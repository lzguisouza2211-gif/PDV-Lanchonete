import { supabase } from '../supabaseClient'

export const deliveryFeeService = {
  /**
   * Busca o valor atual da taxa de entrega
   */
  async getDeliveryFee(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('delivery_config')
        .select('taxa_entrega')
        .eq('id', 1)
        .single()

      if (error) {
        console.error('Erro ao buscar taxa de entrega:', error)
        return 0
      }

      return data?.taxa_entrega || 0
    } catch (error) {
      console.error('Erro ao buscar taxa de entrega:', error)
      return 0
    }
  },

  /**
   * Atualiza o valor da taxa de entrega
   */
  async updateDeliveryFee(novoValor: number): Promise<boolean> {
    try {
      if (novoValor < 0) {
        throw new Error('A taxa de entrega não pode ser negativa')
      }

      const { error } = await supabase
        .from('delivery_config')
        .update({ taxa_entrega: novoValor, updated_at: new Date().toISOString() })
        .eq('id', 1)

      if (error) {
        console.error('Erro ao atualizar taxa de entrega:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao atualizar taxa de entrega:', error)
      return false
    }
  },
}
