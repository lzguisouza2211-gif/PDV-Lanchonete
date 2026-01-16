import { useState } from 'react'
import { formatPixKey } from '../../config/pix'

interface PixKeyDisplayProps {
  pixKey: string
  keyType?: string
  recipientName?: string
  amount?: number
}

export default function PixKeyDisplay({
  pixKey,
  keyType = 'random',
  recipientName,
  amount,
}: PixKeyDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)

  const formattedKey = formatPixKey(pixKey, keyType)

  const copyToClipboard = async () => {
    try {
      // Tenta usar a API moderna do Clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(pixKey)
        setCopied(true)
        setError(false)
      } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea')
        textArea.value = pixKey
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          setCopied(true)
          setError(false)
        } else {
          throw new Error('Falha ao copiar')
        }
      }

      // Reset após 2 segundos
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Erro ao copiar chave PIX:', err)
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 2000)
    }
  }

  return (
    <>
      <style>{`
        @media (max-width: 480px) {
          .pix-key-container {
            padding: 6px !important;
            margin-bottom: 12px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            border-radius: 8px !important;
          }
          .pix-key-title {
            font-size: 12px !important;
            margin: 0 0 4px 0 !important;
            gap: 3px !important;
          }
          .pix-key-title span {
            font-size: 12px !important;
          }
          .pix-key-description {
            display: none !important;
          }
          .pix-key-input-container {
            flex-direction: column !important;
            gap: 3px !important;
            margin-bottom: 0 !important;
          }
          .pix-key-value {
            font-size: 11px !important;
            min-width: unset !important;
            margin-bottom: 0 !important;
            padding: 4px 6px !important;
            margin: 0 !important;
            font-weight: 600 !important;
          }
          .pix-key-button {
            width: 100% !important;
            min-width: unset !important;
            padding: 8px 6px !important;
            font-size: 10px !important;
            gap: 3px !important;
            margin: 0 !important;
            border-radius: 6px !important;
          }
          .pix-key-button span:first-child {
            font-size: 10px !important;
          }
          .pix-key-display {
            font-size: 10px !important;
            padding: 6px 6px !important;
            min-width: unset !important;
            width: 100% !important;
            overflow-x: auto !important;
            letter-spacing: 0 !important;
            margin: 0 !important;
            flex-shrink: 1 !important;
            border-radius: 6px !important;
            line-height: 1.2 !important;
            max-height: 40px !important;
            overflow-y: hidden !important;
          }
          .pix-key-info {
            display: none !important;
          }
          .pix-key-success {
            font-size: 9px !important;
            padding: 3px 6px !important;
            margin: 0 !important;
            border-radius: 4px !important;
            margin-top: 2px !important;
          }
        }
      `}</style>

      <div
        className="pix-key-container"
        style={{
          background: '#fff8f2',
          border: '2px solid #c0392b',
          borderRadius: 12,
          padding: 10,
          marginBottom: 20,
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          margin: '0 0 20px 0',
        }}
      >
        <h4
          className="pix-key-title"
          style={{
            margin: '0 0 8px 0',
            fontSize: 14,
            fontWeight: 700,
            color: '#c0392b',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: 16 }}>📱</span>
          PIX
        </h4>

        {amount && (
          <div
            className="pix-key-value"
            style={{
              fontSize: 14,
              color: '#c0392b',
              fontWeight: 700,
              marginBottom: 6,
              padding: '6px 0',
              background: 'transparent',
              borderRadius: 8,
              border: 'none',
              textAlign: 'left',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            R$ {amount.toFixed(2)}
          </div>
        )}

        <div
          className="pix-key-input-container"
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 4,
            marginBottom: 0,
            flexWrap: 'wrap',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          <div
            className="pix-key-display"
            style={{
              flex: 1,
              minWidth: '0',
              background: '#fff',
              border: '2px solid #ddd',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: 600,
              color: '#333',
              wordBreak: 'break-all',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
              overflowWrap: 'break-word',
              lineHeight: 1.3,
            }}
          >
            {formattedKey}
          </div>

          <button
            className="pix-key-button"
            onClick={copyToClipboard}
            style={{
              background: copied ? '#27ae60' : error ? '#e74c3c' : '#c0392b',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.3s ease',
              minWidth: '90px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!copied && !error) {
                e.currentTarget.style.background = '#a93226'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(192, 57, 43, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!copied && !error) {
                e.currentTarget.style.background = '#c0392b'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
              }
            }}
          >
            <span style={{ fontSize: 12 }}>
              {copied ? '✅' : error ? '❌' : '📋'}
            </span>
            <span>{copied ? 'OK' : error ? 'Erro' : 'Copiar'}</span>
          </button>
        </div>

        {copied && (
          <div
            className="pix-key-success"
            style={{
              fontSize: 11,
              color: '#27ae60',
              fontWeight: 600,
              padding: '4px 0',
              background: 'transparent',
              border: 'none',
              borderRadius: 4,
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box',
              marginTop: 4,
            }}
          >
            ✓ Copiado!
          </div>
        )}
      </div>
    </>
  )
}
