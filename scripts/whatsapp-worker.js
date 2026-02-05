// Detecta ambiente e carrega .env correspondente
const env = process.env.NODE_ENV || 'dev';
const envFile = `.env.${env}`;
require('dotenv').config({ path: envFile });

const axios = require('axios');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');

const REQUIRED_ENVS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'WHATSAPP_PROVIDER'
];

const DEFAULTS = {
  CRON_SCHEDULE: '*/30 * * * * *',
  BATCH_SIZE: '10',
  REQUEST_TIMEOUT_MS: '15000'
};

function ensureEnv() {
  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
}

function log(level, message, meta) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] ${message}`;
  if (meta) {
    console.log(base, meta);
  } else {
    console.log(base);
  }
}

function normalizePhone(rawPhone) {
  if (!rawPhone) return null;
  const digits = String(rawPhone).replace(/\D+/g, '');
  if (!digits) return null;
  if (digits.startsWith('55')) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function extractNotificationMessage(notification) {
  return (
    notification.message ||
    notification.mensagem ||
    (notification.payload && (notification.payload.message || notification.payload.mensagem)) ||
    null
  );
}

function extractNotificationPhone(notification) {
  return normalizePhone(
    notification.phone ||
      notification.telefone ||
      (notification.payload && (notification.payload.phone || notification.payload.telefone))
  );
}

function buildMetaRequest(notification) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_API_TOKEN;
  if (!phoneNumberId || !token) {
    throw new Error('Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_API_TOKEN for Meta provider');
  }
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  const to = extractNotificationPhone(notification);
  const body = extractNotificationMessage(notification);
  if (!to) throw new Error('Phone not found in notification');
  if (!body) throw new Error('Message not found in notification');
  return {
    url,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body
      }
    }
  };
}

function buildEvolutionRequest(notification) {
  const url = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  if (!url) throw new Error('Missing WHATSAPP_API_URL for Evolution provider');
  const number = extractNotificationPhone(notification);
  const text = extractNotificationMessage(notification);
  if (!number) throw new Error('Phone not found in notification');
  if (!text) throw new Error('Message not found in notification');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return {
    url,
    headers,
    data: {
      number,
      text
    }
  };
}

function buildZApiRequest(notification) {
  const url = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  const clientToken = process.env.WHATSAPP_CLIENT_TOKEN;
  if (!url) throw new Error('Missing WHATSAPP_API_URL for Z-API provider');
  const phone = extractNotificationPhone(notification);
  const message = extractNotificationMessage(notification);
  if (!phone) throw new Error('Phone not found in notification');
  if (!message) throw new Error('Message not found in notification');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (clientToken) {
    headers['Client-Token'] = clientToken;
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return {
    url,
    headers,
    data: {
      phone,
      message
    }
  };
}

function buildCustomRequest(notification) {
  const url = process.env.WHATSAPP_API_URL;
  if (!url) throw new Error('Missing WHATSAPP_API_URL for custom provider');
  const token = process.env.WHATSAPP_API_TOKEN;
  const phone = extractNotificationPhone(notification);
  const message = extractNotificationMessage(notification);
  if (!phone) throw new Error('Phone not found in notification');
  if (!message) throw new Error('Message not found in notification');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return {
    url,
    headers,
    data: {
      phone,
      message,
      notification
    }
  };
}

function buildRequest(notification) {
  const provider = String(process.env.WHATSAPP_PROVIDER || '').toLowerCase();
  switch (provider) {
    case 'meta':
      return buildMetaRequest(notification);
    case 'evolution':
      return buildEvolutionRequest(notification);
    case 'zapi':
      return buildZApiRequest(notification);
    case 'custom':
      return buildCustomRequest(notification);
    default:
      throw new Error(`Unsupported WHATSAPP_PROVIDER: ${provider}`);
  }
}

async function sendWhatsApp(notification) {
  const request = buildRequest(notification);
  const timeout = Number(process.env.REQUEST_TIMEOUT_MS || DEFAULTS.REQUEST_TIMEOUT_MS);
  const response = await axios({
    method: 'POST',
    url: request.url,
    headers: request.headers,
    data: request.data,
    timeout
  });
  return response.data;
}

async function markNotification(supabase, id, status, errorMessage) {
  const updatePayload = {
    status,
    processed_at: new Date().toISOString(),
    error_message: errorMessage || null
  };
  const { error } = await supabase
    .from('whatsapp_notifications')
    .update(updatePayload)
    .eq('id', id);
  if (error) {
    throw new Error(`Failed to update notification ${id}: ${error.message}`);
  }
}

async function fetchPending(supabase, batchSize) {
  const { data, error } = await supabase
    .from('whatsapp_notifications')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return data || [];
}

let isRunning = false;

async function runWorker(supabase) {
  if (isRunning) {
    log('WARN', 'Worker still running, skipping this cycle');
    return;
  }

  isRunning = true;
  const batchSize = Number(process.env.BATCH_SIZE || DEFAULTS.BATCH_SIZE);

  try {
    const notifications = await fetchPending(supabase, batchSize);
    if (!notifications.length) {
      log('INFO', 'No pending notifications');
      return;
    }

    log('INFO', `Processing ${notifications.length} notifications`);

    for (const notification of notifications) {
      const id = notification.id;
      try {
        const responseData = await sendWhatsApp(notification);
        log('INFO', `Notification ${id} sent`, responseData);
        await markNotification(supabase, id, 'sent', null);
      } catch (err) {
        const message = err && err.message ? err.message : 'Unknown error';
        log('ERROR', `Notification ${id} failed`, message);
        await markNotification(supabase, id, 'error', message);
      }
    }
  } catch (err) {
    const message = err && err.message ? err.message : 'Unknown error';
    log('ERROR', 'Worker cycle failed', message);
  } finally {
    isRunning = false;
  }
}

function start() {
  Object.assign(process.env, DEFAULTS, process.env);
  ensureEnv();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const schedule = process.env.CRON_SCHEDULE || DEFAULTS.CRON_SCHEDULE;
  log('INFO', `WhatsApp worker started with schedule: ${schedule}`);

  cron.schedule(schedule, () => runWorker(supabase));
  runWorker(supabase);
}

start();
