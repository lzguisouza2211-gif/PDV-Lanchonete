import { Pedido } from '../../services/api/pedidos.service'

interface OrderMonitorProps {
  pedidos: Pedido[]
}

export default function OrderMonitor({ pedidos }: OrderMonitorProps) {
  // Ordenar por mais recentes
  const pedidosOrdenados = [...pedidos]
    .sort((a, b) => b.id - a.id)
    .slice(0, 4)

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; border: string }> = {
      'Recebido': { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
      'Preparo': { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
      'Enviado': { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
      'Pronto': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
      'Pago': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
      'Entregue': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
    }
    return statusMap[status] || { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' }
  }

  const getTipoLabel = (tipo?: string) => {
    const tipos: Record<string, string> = {
      'entrega': 'Delivery',
      'retirada': 'Mesa',
      'local': 'Mesa',
    }
    return tipos[tipo || 'retirada'] || 'Mesa'
  }

  return (
    <div
      style={{
        background: '#fff',
        padding: 32,
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: '#1a1a1a',
          }}
        >
          Monitor de Pedidos
        </h2>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: '#3b82f6',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
          }}
          onClick={() => window.location.href = '/admin'}
        >
          Ver banco de dados completo →
        </button>
      </div>

      {pedidosOrdenados.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
          }}
        >
          <p style={{ fontSize: 16, margin: 0 }}>
            Nenhum pedido ainda hoje
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 120px 120px 100px 60px',
              gap: 16,
              padding: '12px 16px',
              background: '#f9fafb',
              borderRadius: '8px 8px 0 0',
              fontSize: 12,
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
            }}
          >
            <div>ID</div>
            <div>MESA / CLIENTE</div>
            <div>STATUS</div>
            <div>TOTAL</div>
            <div></div>
            <div></div>
          </div>

          {/* Rows */}
          {pedidosOrdenados.map((pedido, index) => {
            const statusColors = getStatusColor(pedido.status)
            const tipoLabel = getTipoLabel(pedido.tipoentrega)
            
            return (
              <div
                key={pedido.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 120px 120px 100px 60px',
                  gap: 16,
                  padding: '16px',
                  background: '#fff',
                  borderBottom: index < pedidosOrdenados.length - 1 ? '1px solid #f3f4f6' : 'none',
                  alignItems: 'center',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff'
                }}
              >
                {/* ID */}
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  #{pedido.id}
                </div>

                {/* Cliente/Mesa */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                    {tipoLabel === 'Mesa' ? `Mesa ${pedido.cliente?.split(' ')[1] || ''}` : pedido.cliente}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {pedido.cliente}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 12px',
                      borderRadius: 12,
                      background: statusColors.bg,
                      color: statusColors.text,
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1px solid ${statusColors.border}`,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: statusColors.text,
                      }}
                    />
                    {pedido.status}
                  </span>
                </div>

                {/* Total */}
                <div style={{ fontWeight: 700, fontSize: 16, color: '#c0392b' }}>
                  R$ {Number(pedido.total || 0).toFixed(2)}
                </div>

                {/* Tipo */}
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {tipoLabel === 'Delivery' ? '📍' : '🏪'} {pedido.tipoentrega?.slice(0, 10) || '-'}
                </div>

                {/* Ações */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: '#9ca3af',
                      padding: 4,
                    }}
                  >
                    ⋮
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pedidosOrdenados.length > 0 && (
        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            color: '#9ca3af',
            textAlign: 'left',
          }}
        >
          Mostrando últimos {pedidosOrdenados.length} pedidos
        </div>
      )}
    </div>
  )
}
