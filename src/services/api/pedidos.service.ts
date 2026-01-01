import { supabase } from '../supabaseClient';
import { logger } from '../logger/logger';

export type Adicional = { nome: string; preco: number };

export type Item = { nome: string; preco: number; adicionais?: Adicional[] };

export type Pedido = {
  id: number;
  cliente: string;
  itens: Item[];
  total: number;
  status?: string;
  tipoentrega?: string;
  endereco?: string;
  formapagamento?: string;
  troco?: string | number;
};

const hasSupabase = (supabase as any) && typeof (supabase as any).from === 'function';

export const pedidosService = {
  async list(): Promise<Pedido[]> {
    if (!hasSupabase) {
      logger.warn('supabase not initialized - pedidosService.list returning empty array');
      return [];
    }

    try {
      const { data, error } = await (supabase as any).from('pedidos').select('*');
      if (error) {
        logger.error('pedidosService.list supabase error', error);
        throw error;
      }
      return (data || []) as Pedido[];
    } catch (e) {
      logger.error('pedidosService.list unexpected error', e);
      throw e;
    }
  },

  async getById(id: number): Promise<Pedido | null> {
    if (!hasSupabase) return null;
    const { data, error } = await (supabase as any).from('pedidos').select('*').eq('id', id).single();
    if (error) {
      logger.error('pedidosService.getById supabase error', error);
      return null;
    }
    return data as Pedido;
  },

  async create(pedido: Omit<Pedido, 'id'>): Promise<Pedido | null> {
    if (!hasSupabase) {
      logger.warn('supabase not initialized - pedidosService.create no-op');
      return null;
    }

    const payload = {
      cliente: pedido.cliente,
      itens: pedido.itens,
      total: pedido.total,
      status: pedido.status ?? 'Pendente',
      tipoentrega: pedido.tipoentrega ?? null,
      endereco: pedido.endereco ?? null,
      formapagamento: pedido.formapagamento ?? null,
      troco: pedido.troco ?? null,
    };
    const { data, error } = await (supabase as any)
      .from('pedidos')
      .insert([payload])
      .select()
      .single();

    if (error) {
      logger.error('pedidosService.create supabase error', error);
      return null;
    }
    return data as Pedido;
  },

  async updateStatus(id: number, status: string): Promise<boolean> {
    if (!hasSupabase) {
      logger.warn('supabase not initialized - pedidosService.updateStatus no-op');
      return false;
    }
    const { error } = await (supabase as any).from('pedidos').update({ status }).eq('id', id);
    if (error) {
      logger.error('pedidosService.updateStatus supabase error', error);
      return false;
    }
    return true;
  },
};

export default pedidosService;
