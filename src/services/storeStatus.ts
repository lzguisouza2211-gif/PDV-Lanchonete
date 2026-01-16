import { supabase } from './supabaseClient'

export interface StoreStatus {
  id: number
  is_open: boolean
  updated_at: string
}

export const storeStatusService = {
  async getStatus(): Promise<StoreStatus | null> {
    const { data, error } = await supabase
      .from('store_status')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      return null
    }

    return data
  },

  async toggleStatus(isOpen: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('store_status')
      .update({ is_open: isOpen, updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (error) {
      return false
    }

    return true
  },
}

