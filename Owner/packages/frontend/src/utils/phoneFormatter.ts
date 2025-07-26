/**
 * Phone number formatting utilities for Indian phone numbers
 */

export interface PhoneNumber {
  raw: string           // Original input
  cleaned: string       // Digits only (10 digits)
  formatted: string     // Display format (XXXXX XXXXX)
  international: string // Submission format (+91XXXXXXXXXX)
  isValid: boolean     // Validation status
}

/**
 * Clean phone number by removing all non-digit characters and +91 prefix
 */
export function cleanPhoneNumber(input: string): string {
  if (!input) return ''
  
  // Remove all non-digit characters
  let cleaned = input.replace(/\D/g, '')
  
  // Remove +91 prefix if present (91 at the start)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2)
  }
  
  return cleaned
}

/**
 * Format phone number for display (XXXXX XXXXX)
 */
export function formatForDisplay(number: string): string {
  const cleaned = cleanPhoneNumber(number)
  
  if (cleaned.length !== 10) return cleaned
  
  return `${cleaned.substring(0, 5)} ${cleaned.substring(5)}`
}

/**
 * Format phone number for submission (+91XXXXXXXXXX)
 */
export function formatForSubmission(number: string): string {
  const cleaned = cleanPhoneNumber(number)
  
  if (cleaned.length !== 10) return cleaned
  
  return `+91${cleaned}`
}

/**
 * Validate if the number is a valid 10-digit Indian mobile number
 */
export function isValidIndianNumber(number: string): boolean {
  const cleaned = cleanPhoneNumber(number)
  
  // Must be exactly 10 digits
  if (cleaned.length !== 10) return false
  
  // Must start with 6, 7, 8, or 9 (Indian mobile number prefixes)
  const firstDigit = cleaned.charAt(0)
  return ['6', '7', '8', '9'].includes(firstDigit)
}

/**
 * Process phone number input and return complete PhoneNumber object
 */
export function processPhoneNumber(input: string): PhoneNumber {
  const cleaned = cleanPhoneNumber(input)
  const isValid = isValidIndianNumber(input)
  
  return {
    raw: input,
    cleaned,
    formatted: formatForDisplay(input),
    international: formatForSubmission(input),
    isValid
  }
}

/**
 * Get validation error message for invalid phone numbers
 */
export function getValidationError(number: string): string | null {
  if (!number.trim()) {
    return 'Mobile number is required'
  }
  
  const cleaned = cleanPhoneNumber(number)
  
  if (cleaned.length === 0) {
    return 'Please enter a valid mobile number'
  }
  
  if (cleaned.length < 10) {
    return 'Mobile number must be 10 digits'
  }
  
  if (cleaned.length > 10) {
    return 'Mobile number must be exactly 10 digits'
  }
  
  const firstDigit = cleaned.charAt(0)
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return 'Please enter a valid Indian mobile number'
  }
  
  return null
}