import React, { useEffect, useRef, useState } from 'react'
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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 2000,
        }}
      />

      {/* DRAWER */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className="cart-drawer"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          zIndex: 2001,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-2px 0 12px rgba(0,0,0,0.12)',
        }}
      >
        {/* HEADER */}
        <header
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            Seu pedido
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#f6f6f6',
              border: 'none',
              borderRadius: 10,
              width: 36,
              height: 36,
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </header>

        {/* ITENS */}
        <section
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
          }}
        >
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', marginTop: 48 }}>
              <p style={{ fontSize: 16, marginBottom: 4 }}>
                Carrinho vazio
              </p>
              <p style={{ fontSize: 13 }}>
                Adicione itens do cardápio
              </p>
            </div>
          ) : (
            items.map((item, index) => {
              const extrasAdd = (item.extras || []).filter(
                (e) => e.tipo === 'add'
              )
              const extrasRemove = (item.extras || []).filter(
                (e) => e.tipo === 'remove'
              )

              return (
                <div
                  key={`${item.id}-${index}`}
                  style={{
                    paddingBottom: 16,
                    marginBottom: 16,
                    borderBottom: '1px solid #eee',
                  }}
                >
                  {/* NOME + PREÇO */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 6,
                    }}
                  >
                    <strong style={{ fontSize: 15, fontWeight: 600 }}>
                      {item.name}
                    </strong>
                    <strong
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#c0392b',
                      }}
                    >
                      R$ {(item.price * item.qty).toFixed(2)}
                    </strong>
                  </div>

                  {/* EXTRAS */}
                  {extrasAdd.map((e, i) => (
                    <div
                      key={i}
                      style={{ fontSize: 12, color: '#27ae60' }}
                    >
                      + {e.nome}
                    </div>
                  ))}
                  {extrasRemove.map((e, i) => (
                    <div
                      key={i}
                      style={{ fontSize: 12, color: '#e74c3c' }}
                    >
                      – Sem {e.nome}
                    </div>
                  ))}

                  {/* INGREDIENTES INDISPONÍVEIS */}
                  {item.ingredientes_indisponiveis && item.ingredientes_indisponiveis.length > 0 && (
                    <div>
                      {item.ingredientes_indisponiveis.map((ing, i) => (
                        <div
                          key={i}
                          style={{ fontSize: 12, color: '#e74c3c' }}
                        >
                          – Sem {ing}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* OBSERVAÇÕES */}
                  {item.observacoes && (
                    <div
                      style={{
                        fontSize: 12,
                        color: '#666',
                        marginTop: 6,
                        fontStyle: 'italic',
                      }}
                    >
                      📝 {item.observacoes}
                    </div>
                  )}

                  {/* CONTROLES */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    <button
                      onClick={() => onRemove(item.id)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        background: '#fff',
                        fontSize: 18,
                        cursor: 'pointer',
                      }}
                    >
                      −
                    </button>

                    <span style={{ minWidth: 24, textAlign: 'center' }}>
                      {item.qty}
                    </span>

                    <button
                      onClick={() => onAdd({ ...item, qty: 1 })}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        background: '#fff',
                        fontSize: 18,
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </section>

        {/* FOOTER */}
        <footer
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #eee',
            background: '#fff',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 200px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <strong>Total</strong>
            <strong
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#c0392b',
              }}
            >
              R$ {total.toFixed(2)}
            </strong>
          </div>

          {/* FORMULÁRIO */}
          {children}
        </footer>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .cart-drawer {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  )
}