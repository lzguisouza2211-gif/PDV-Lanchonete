module.exports = {
  apps: [
    {
      name: 'whatsapp-worker',
      script: 'scripts/whatsapp-worker.js',
      env: {
        NODE_ENV: 'prod'
      }
    },
    {
      name: 'printer-backend',
      script: 'printer-backend.js',
      env: {
        PRINTER_NAME: 'ELGIN',
        PRINTER_FALLBACK_MODE: 'false',
        PRINTER_API_PORT: '4000',
        PRINTER_ENABLE_CUT: 'true'
      }
    }
  ]
}