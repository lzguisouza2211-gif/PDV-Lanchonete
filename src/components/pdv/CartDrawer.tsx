import React from 'react'
import { CartItem } from '../../store/useCart'

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  onRemove: (id: string) => void
  onAdd: (item: CartItem) => void
  children: React.ReactNode
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  total,
  onRemove,
  onAdd,
  children,
}: CartDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          width: '100%',
          maxWidth: 420,
          height: '100%',
          zIndex: 2001,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 20,
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            Seu pedido
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              padding: '4px 8px',
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            ✕
          </button>
        </div>

        {/* Items List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999',
              }}
            >
              <p style={{ fontSize: 18, margin: 0 }}>Carrinho vazio</p>
              <p style={{ fontSize: 14, margin: '8px 0 0 0' }}>
                Adicione itens do cardápio
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  marginBottom: 12,
                  background: '#f9f9f9',
                  borderRadius: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 4,
                      fontSize: 16,
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: '#666',
                    }}
                  >
                    R$ {item.price.toFixed(2)}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    minWidth: 100,
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    onClick={() => onRemove(item.id)}
                    style={{
                      minWidth: 44,
                      minHeight: 44,
                      borderRadius: 8,
                      border: '1px solid #ddd',
                      background: '#fff',
                      fontSize: 20,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      touchAction: 'manipulation',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fee'
                      e.currentTarget.style.borderColor = '#fcc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff'
                      e.currentTarget.style.borderColor = '#ddd'
                    }}
                  >
                    ➖
                  </button>
                  <strong
                    style={{
                      minWidth: 30,
                      textAlign: 'center',
                      fontSize: 18,
                    }}
                  >
                    {item.qty}
                  </strong>
                  <button
                    onClick={() => onAdd({ ...item, qty: 1 })}
                    style={{
                      minWidth: 44,
                      minHeight: 44,
                      borderRadius: 8,
                      border: '1px solid #ddd',
                      background: '#fff',
                      fontSize: 20,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      touchAction: 'manipulation',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#efe'
                      e.currentTarget.style.borderColor = '#cfc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff'
                      e.currentTarget.style.borderColor = '#ddd'
                    }}
                  >
                    ➕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Total and Form */}
        <div
          style={{
            borderTop: '2px solid #eee',
            padding: 20,
            background: '#fff',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid #eee',
            }}
          >
            <strong style={{ fontSize: 18 }}>Total:</strong>
            <strong style={{ fontSize: 24, color: '#c0392b' }}>
              R$ {total.toFixed(2)}
            </strong>
          </div>

          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            transform: translateX(100%);
          }
          to { 
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}

