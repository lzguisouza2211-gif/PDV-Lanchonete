import React, { useEffect } from 'react'

type SuccessModalProps = {
  onClose: () => void
  cliente?: string
}

export default function SuccessModal({
  onClose,
  cliente,
}: SuccessModalProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3000,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          padding: '40px 32px',
          borderRadius: 20,
          textAlign: 'center',
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'scaleIn 0.3s ease',
        }}
      >
        <div
          style={{
            fontSize: 64,
            marginBottom: 16,
            animation: 'bounce 0.6s ease',
          }}
        >
          ✅
        </div>

        <h2
          style={{
            margin: '0 0 12px 0',
            fontSize: 24,
            fontWeight: 700,
            color: '#1a1a1a',
          }}
        >
          Pedido enviado!
        </h2>

        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: 16,
            color: '#666',
            lineHeight: 1.5,
          }}
        >
          {cliente
            ? `Obrigado, ${cliente}! Seu pedido foi recebido com sucesso.`
            : 'Seu pedido foi recebido com sucesso e está sendo preparado.'}
        </p>

        <button
          onClick={onClose}
          style={{
            padding: '12px 32px',
            borderRadius: 8,
            border: 'none',
            background: '#c0392b',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#a93226'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#c0392b'
          }}
        >
          Fazer novo pedido
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            transform: scale(0.9);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

