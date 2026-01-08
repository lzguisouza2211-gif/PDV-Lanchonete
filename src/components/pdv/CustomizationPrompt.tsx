import React from 'react'

type CustomizationPromptProps = {
  isOpen: boolean
  onClose: () => void
  onYes: () => void
  onNo: () => void
  produtoNome: string
}

export default function CustomizationPrompt({
  isOpen,
  onClose,
  onYes,
  onNo,
  produtoNome,
}: CustomizationPromptProps) {
  if (!isOpen) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 3000,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          maxWidth: 320,
          width: '90%',
          zIndex: 3001,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.2s ease',
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: 18,
            fontWeight: 700,
            color: '#1a1a1a',
            textAlign: 'center',
          }}
        >
          Personalizar {produtoNome}?
        </h3>
        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
          }}
        >
          Deseja adicionar extras ou observações?
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onNo}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: '2px solid #ddd',
              background: '#fff',
              color: '#666',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#999'
              e.currentTarget.style.background = '#f5f5f5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd'
              e.currentTarget.style.background = '#fff'
            }}
          >
            Não
          </button>
          <button
            onClick={onYes}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: '#27ae60',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#229954'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#27ae60'
            }}
          >
            Sim
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translate(-50%, -40%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}

