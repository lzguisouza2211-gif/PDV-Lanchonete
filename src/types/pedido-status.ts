/**
 * Valid order statuses for the system
 * Flow: Recebido → Em preparo → Finalizado
 */
export const ORDER_STATUSES = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em preparo',
  FINALIZADO: 'Finalizado',
} as const

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES]

/**
 * Validates if a status value is valid
 */
export function isValidOrderStatus(status: string): status is OrderStatus {
  return Object.values(ORDER_STATUSES).includes(status as OrderStatus)
}

/**
 * Gets the next valid status in the flow
 * Returns null if no next status
 */
export function getNextStatus(current: OrderStatus): OrderStatus | null {
  switch (current) {
    case ORDER_STATUSES.RECEBIDO:
      return ORDER_STATUSES.EM_PREPARO
    case ORDER_STATUSES.EM_PREPARO:
      return ORDER_STATUSES.FINALIZADO
    case ORDER_STATUSES.FINALIZADO:
      return null
    default:
      return null
  }
}

/**
 * Validates if a status transition is allowed
 */
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  // Cannot go backwards
  if (from === ORDER_STATUSES.FINALIZADO) return false
  if (from === ORDER_STATUSES.EM_PREPARO && to === ORDER_STATUSES.RECEBIDO) return false
  
  // Cannot skip steps
  if (from === ORDER_STATUSES.RECEBIDO && to === ORDER_STATUSES.FINALIZADO) return false
  
  return true
}
