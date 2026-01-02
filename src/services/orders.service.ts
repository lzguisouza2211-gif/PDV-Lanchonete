import { fetchAdapter } from './adapter'

export async function getOrders() {
  return fetchAdapter(async () => {
    // Implementar via supabaseClient
    return []
  })
}

export async function createOrder(payload: any) {
  return fetchAdapter(async () => {
    return { ok: true }
  })
}

export async function updateOrderStatus(id: string, status: string) {
  return fetchAdapter(async () => {
    return { ok: true }
  })
}
