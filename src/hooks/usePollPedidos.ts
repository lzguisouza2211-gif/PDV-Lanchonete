import { useEffect } from 'react'
import { usePedidos } from './usePedidos'

// Polling hook para pedidos (Admin) agora usando usePedidos service-backed
export function usePollPedidos(onData: (d: any) => void, interval = 5000) {
  const { listPedidos } = usePedidos()

  useEffect(() => {
    let id: any
    async function poll() {
      const dados = await listPedidos()
      onData(dados)
    }
    id = setInterval(poll, interval)
    poll()
    return () => clearInterval(id)
  }, [onData, interval, listPedidos])
}
