/**
 * Validation utilities for Brazilian phone numbers
 */

/**
 * Validates a Brazilian phone number
 * Accepts formats:
 * - (11) 98765-4321
 * - 11987654321
 * - +55 11 98765-4321
 * - +5511987654321
 * - (11) 3456-7890 (landline)
 * 
 * @param telefone - Phone number string to validate
 * @returns true if valid Brazilian phone number
 */
export function validarTelefoneBrasileiro(telefone: string): boolean {
  if (!telefone || telefone.trim() === '') return false
  
  // Remove all non-digit characters
  const digitsOnly = telefone.replace(/\D/g, '')
  
  // Brazilian phone patterns:
  // - Landline: 10 digits (2 DDD + 8 digits)
  // - Mobile: 11 digits (2 DDD + 9 digits starting with 9)
  // - With country code: 12-13 digits (55 + DDD + phone)
  
  // Must have 10, 11, 12, or 13 digits
  if (digitsOnly.length < 10 || digitsOnly.length > 13) return false
  
  // Remove country code if present
  let phoneNumber = digitsOnly
  if (digitsOnly.startsWith('55') && digitsOnly.length > 11) {
    phoneNumber = digitsOnly.substring(2)
  }
  
  // Now should have 10 or 11 digits
  if (phoneNumber.length !== 10 && phoneNumber.length !== 11) return false
  
  // DDD must be between 11 and 99
  const ddd = parseInt(phoneNumber.substring(0, 2), 10)
  if (ddd < 11 || ddd > 99) return false
  
  // If 11 digits, the third digit must be 9 (mobile)
  if (phoneNumber.length === 11 && phoneNumber[2] !== '9') return false
  
  return true
}

/**
 * Formats a phone number string to Brazilian format
 * @param telefone - Phone number to format
 * @returns Formatted phone number (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */
export function formatarTelefoneBrasileiro(telefone: string): string {
  const digitsOnly = telefone.replace(/\D/g, '')
  
  // Remove country code if present
  let phoneNumber = digitsOnly
  if (digitsOnly.startsWith('55') && digitsOnly.length > 11) {
    phoneNumber = digitsOnly.substring(2)
  }
  
  if (phoneNumber.length === 11) {
    // Mobile: (XX) 9XXXX-XXXX
    return `(${phoneNumber.substring(0, 2)}) ${phoneNumber.substring(2, 7)}-${phoneNumber.substring(7)}`
  } else if (phoneNumber.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return `(${phoneNumber.substring(0, 2)}) ${phoneNumber.substring(2, 6)}-${phoneNumber.substring(6)}`
  }
  
  return telefone
}

/**
 * Removes all formatting from a phone number and ensures country code 55
 * @param telefone - Formatted phone number
 * @returns Only digits with country code 55 (Brazilian format for WhatsApp)
 */
export function limparTelefone(telefone: string): string {
  const digitsOnly = telefone.replace(/\D/g, '')
  
  // Se já tem código do país 55 e mais de 11 dígitos, retorna como está
  if (digitsOnly.startsWith('55') && digitsOnly.length >= 12) {
    return digitsOnly
  }
  
  // Se não tem código do país, adiciona o 55 do Brasil
  if (digitsOnly.length === 10 || digitsOnly.length === 11) {
    return '55' + digitsOnly
  }
  
  // Retorna como está se não se encaixar nos padrões
  return digitsOnly
}
