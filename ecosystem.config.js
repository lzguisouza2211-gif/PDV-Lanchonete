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
      script: 'printer-backend.js'
    }
  ]
}