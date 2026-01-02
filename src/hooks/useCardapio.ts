import { useEffect, useState } from 'react';
import { cardapioService, ItemCardapio } from '../services/api/cardapio.service'


export function useCardapio() {
    const [itens, setItens] = useState<ItemCardapio[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const carregar = async () => {
        try {
            setLoading(true)
            const data = await cardapioService.list()
            setItens(data)
        } catch (err) {
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregar()
    }, [])

    return { itens, loading, error, recarregar: carregar, }
}