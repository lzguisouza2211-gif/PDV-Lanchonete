import { supabase } from '../supabaseClient'

export type PedidoItem = {
	id?: number
	pedido_id: number
	nome: string
	quantidade: number
	adicionais?: any[]
	retirados?: any[]
	observacoes?: string
	preco: number
	created_at?: string
}

export const pedidoItensService = {
	async inserirItens(pedido_id: number, itens: Omit<PedidoItem, 'id' | 'pedido_id' | 'created_at'>[]): Promise<boolean> {
		if (!pedido_id || !Array.isArray(itens) || itens.length === 0) return false
		const payload = itens.map(item => ({
			...item,
			pedido_id,
			adicionais: item.adicionais || [],
			retirados: item.retirados || [],
		}))
		const { error } = await supabase.from('pedido_itens').insert(payload)
		if (error) {
			console.error('Erro ao inserir itens do pedido:', error)
			return false
		}
		return true
	},

	async buscarPorPedido(pedido_id: number): Promise<PedidoItem[]> {
		const { data, error } = await supabase
			.from('pedido_itens')
			.select('*')
			.eq('pedido_id', pedido_id)
			.order('id', { ascending: true })
		if (error) {
			console.error('Erro ao buscar itens do pedido:', error)
			return []
		}
		return data || []
	},
}
