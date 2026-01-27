import { useEffect, useState } from 'react'
import { listarProdutosDisponiveisPorCategoriaTipo, ProdutoDisponibilidade } from '../services/produtosDisponibilidade.service'

export function useRefrigerantesDisponiveis(tipo: string) {
  const [sabores, setSabores] = useState<ProdutoDisponibilidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    listarProdutosDisponiveisPorCategoriaTipo('refrigerante', tipo)
      .then(setSabores)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [tipo])

  return { sabores, loading, error }
}
