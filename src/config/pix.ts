// Configuração da chave PIX para recebimento de pagamentos
export const PIX_CONFIG = {
  key: '128.052.796-03', // Substitua pela sua chave PIX real (CPF, CNPJ, email, telefone ou chave aleatória)
  keyType: 'cnpj' as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
  recipientName: 'LUIZÃO LANCHES',
}

// Função auxiliar para formatar chaves PIX (CPF/CNPJ)
export function formatPixKey(key: string, type: string): string {
  if (type === 'cpf') {
    // Formato: 000.000.000-00
    return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (type === 'cnpj') {
    // Formato: 00.000.000/0001-00
    return key.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return key
}
