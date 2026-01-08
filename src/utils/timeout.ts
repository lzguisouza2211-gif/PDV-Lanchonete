/**
 * Wrapper para adicionar timeout a promises
 * Útil para evitar travamentos em conexões lentas
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 15000,
  errorMessage: string = 'Operação excedeu o tempo limite'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ])
}

/**
 * Retorna uma mensagem de erro amigável baseada no tipo de erro
 */
export function getFriendlyErrorMessage(error: any): string {
  if (!error) return 'Erro desconhecido'

  const message = error.message || String(error)

  // Erros de rede
  if (
    message.includes('timeout') ||
    message.includes('tempo limite') ||
    message.includes('excedeu')
  ) {
    return 'A conexão está lenta. Por favor, tente novamente.'
  }

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('Failed to fetch')
  ) {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.'
  }

  // Erros do Supabase
  if (message.includes('JWT') || message.includes('token')) {
    return 'Sessão expirada. Por favor, recarregue a página.'
  }

  if (message.includes('permission') || message.includes('policy')) {
    return 'Você não tem permissão para realizar esta ação.'
  }

  // Erro genérico
  return message || 'Ocorreu um erro. Por favor, tente novamente.'
}

