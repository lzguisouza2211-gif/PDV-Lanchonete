import React, { useEffect } from 'react'

type ToastProps = {
  message: string
  onClose: () => void
  type?: 'success' | 'info'
}

export default function Toast({
  message,
  onClose,
  type = 'success',
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'success' ? '#27ae60' : '#3498db',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: 'slideUp 0.3s ease',
        maxWidth: '90%',
      }}
    >
      <span style={{ fontSize: 20 }}>
        {type === 'success' ? '✅' : 'ℹ️'}
      </span>
      <span style={{ fontWeight: 600, fontSize: 15 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          borderRadius: '50%',
          width: 24,
          height: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          marginLeft: 8,
        }}
      >
        ✕
      </button>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

