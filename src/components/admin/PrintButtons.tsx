/**
 * Componente de botões de impressão para cards do kanban
 */

import React from 'react'
import { Pedido } from '../../services/api/pedidos.service'
import { usePrinter } from '../../hooks/usePrinter'

interface PrintButtonsProps {
  pedido: Pedido
  showMotoboy?: boolean // Mostrar botão de motoboy apenas se for entrega
  onPrintSuccess?: (type: string) => void
}

export default function PrintButtons({
  pedido,
  showMotoboy = true,
  onPrintSuccess,
}: PrintButtonsProps) {
  const { printProducao, printMotoboy, status } = usePrinter()
  const [showMenu, setShowMenu] = React.useState(false)

  const isEntrega = pedido.tipoentrega === 'entrega'
  const isLoading = status.isLoading

  const handlePrintProducao = async () => {
    const success = await printProducao(pedido)
    if (success) {
      onPrintSuccess?.('producao')
      setShowMenu(false)
    }
  }

  const handlePrintMotoboy = async () => {
    const success = await printMotoboy(pedido)
    if (success) {
      onPrintSuccess?.('motoboy')
      setShowMenu(false)
    }
  }

  // Menu de impressão
  if (showMenu) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          animation: 'slideDown 0.2s ease',
        }}
      >
        <button
          onClick={handlePrintProducao}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#e8f4f8',
            border: '1px solid #3498db',
            color: '#3498db',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading)
              e.currentTarget.style.background = '#3498db',
                (e.currentTarget.style.color = '#fff')
          }}
          onMouseLeave={(e) => {
            if (!isLoading)
              e.currentTarget.style.background = '#e8f4f8',
                (e.currentTarget.style.color = '#3498db')
          }}
        >
          {isLoading ? '⏳ Imprimindo...' : '👨‍🍳 Produção'}
        </button>

        {showMotoboy && isEntrega && (
          <button
            onClick={handlePrintMotoboy}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#f0e8f4',
              border: '1px solid #9b59b6',
              color: '#9b59b6',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading)
                e.currentTarget.style.background = '#9b59b6',
                  (e.currentTarget.style.color = '#fff')
            }}
            onMouseLeave={(e) => {
              if (!isLoading)
                e.currentTarget.style.background = '#f0e8f4',
                  (e.currentTarget.style.color = '#9b59b6')
            }}
          >
            {isLoading ? '⏳ Imprimindo...' : '🚗 Motoboy'}
          </button>
        )}

        <button
          onClick={() => setShowMenu(false)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            color: '#666',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#eeeeee'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f5f5f5'
          }}
        >
          ✕ Fechar
        </button>
      </div>
    )
  }

  // Botão flutuante para abrir menu
  return (
    <button
      onClick={() => setShowMenu(true)}
      disabled={isLoading}
      style={{
        width: '100%',
        marginTop: 8,
        padding: '10px 16px',
        background: isLoading ? '#f0f0f0' : '#fff',
        border: isLoading ? '1px solid #ddd' : '2px solid #2ecc71',
        color: isLoading ? '#999' : '#2ecc71',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = '#2ecc71'
          e.currentTarget.style.color = '#fff'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 204, 113, 0.3)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = '#fff'
          e.currentTarget.style.color = '#2ecc71'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {isLoading ? (
        <>
          <span>⏳</span> Imprimindo...
        </>
      ) : (
        <>
          <span>🖨️</span> Imprimir
        </>
      )}
    </button>
  )
}
