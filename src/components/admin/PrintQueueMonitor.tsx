/**
 * Monitor de Fila de Impressão
 * Mostra status e quantidade de trabalhos na fila
 */

import { useEffect, useState } from 'react'
import { printQueue } from '../../services/printer/printQueue'

interface QueueStatus {
  size: number
  isPrinting: boolean
  jobs: Array<{
    id: string
    type: 'producao' | 'motoboy'
    status: 'pending' | 'printing' | 'completed' | 'failed'
    retries: number
  }>
}

export default function PrintQueueMonitor() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    size: 0,
    isPrinting: false,
    jobs: [],
  })

  // Atualiza status a cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const status = printQueue.getQueueStatus()
      setQueueStatus(status)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (queueStatus.size === 0 && !queueStatus.isPrinting) {
    return null // Não exibe se não há nada na fila
  }

  return (
    <div
      style={{
        background: '#f0f7ff',
        border: '2px solid #3498db',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        animation: 'slideDown 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 20,
              animation: queueStatus.isPrinting
                ? 'pulse 1s infinite'
                : 'none',
            }}
          >
            🖨️
          </span>
          <span
            style={{
              fontWeight: 600,
              color: '#3498db',
              fontSize: 14,
            }}
          >
            Fila de Impressão
          </span>
        </div>
        <span
          style={{
            background: queueStatus.isPrinting ? '#27ae60' : '#f39c12',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {queueStatus.isPrinting ? '⏳ Imprimindo...' : '📋 Na fila'}
        </span>
      </div>

      {/* Status dos trabalhos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {queueStatus.jobs.map((job) => (
          <div
            key={job.id}
            style={{
              background: '#fff',
              padding: 10,
              borderRadius: 6,
              borderLeft: `4px solid ${
                job.status === 'completed'
                  ? '#27ae60'
                  : job.status === 'failed'
                    ? '#c0392b'
                    : job.status === 'printing'
                      ? '#3498db'
                      : '#f39c12'
              }`,
              fontSize: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontWeight: 600 }}>
                {job.type === 'producao' ? '👨‍🍳 Produção' : '🚗 Motoboy'}
              </span>
              <span style={{ color: '#999', marginLeft: 8 }}>
                {job.status === 'printing'
                  ? 'Imprimindo...'
                  : job.status === 'completed'
                    ? 'Concluído'
                    : job.status === 'failed'
                      ? 'Falha'
                      : `Aguardando... (${job.retries} tentativas)`}
              </span>
            </div>
            <span style={{ fontSize: 11, color: '#999' }}>
              {job.id.substring(0, 8)}...
            </span>
          </div>
        ))}
      </div>

      {queueStatus.jobs.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            color: '#999',
            fontSize: 12,
            padding: 8,
          }}
        >
          Nenhum trabalho na fila
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
