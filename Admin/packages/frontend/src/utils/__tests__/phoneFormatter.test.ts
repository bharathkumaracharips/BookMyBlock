import { describe, it, expect } from 'vitest'
import {
  cleanPhoneNumber,
  formatForDisplay,
  formatForSubmission,
  isValidIndianNumber,
  processPhoneNumber,
  getValidationError
} from '../phoneFormatter'

describe('phoneFormatter', () => {
  describe('cleanPhoneNumber', () => {
    it('should remove all non-digit characters', () => {
      expect(cleanPhoneNumber('98765-43210')).toBe('9876543210')
      expect(cleanPhoneNumber('98765 43210')).toBe('9876543210')
      expect(cleanPhoneNumber('(98765) 43210')).toBe('9876543210')
      expect(cleanPhoneNumber('987.654.3210')).toBe('9876543210')
    })

    it('should remove +91 prefix', () => {
      expect(cleanPhoneNumber('+919876543210')).toBe('9876543210')
      expect(cleanPhoneNumber('919876543210')).toBe('9876543210')
      expect(cleanPhoneNumber('+91 98765 43210')).toBe('9876543210')
    })

    it('should handle empty input', () => {
      expect(cleanPhoneNumber('')).toBe('')
      expect(cleanPhoneNumber('   ')).toBe('')
    })

    it('should not remove 91 if not a prefix', () => {
      expect(cleanPhoneNumber('9876591210')).toBe('9876591210')
    })
  })

  describe('formatForDisplay', () => {
    it('should format 10-digit number with space', () => {
      expect(formatForDisplay('9876543210')).toBe('98765 43210')
      expect(formatForDisplay('+919876543210')).toBe('98765 43210')
      expect(formatForDisplay('98765-43210')).toBe('98765 43210')
    })

    it('should return unformatted for invalid length', () => {
      expect(formatForDisplay('987654321')).toBe('987654321')
      expect(formatForDisplay('98765432100')).toBe('98765432100')
    })
  })

  describe('formatForSubmission', () => {
    it('should format with +91 prefix', () => {
      expect(formatForSubmission('9876543210')).toBe('+919876543210')
      expect(formatForSubmission('+919876543210')).toBe('+919876543210')
      expect(formatForSubmission('98765 43210')).toBe('+919876543210')
    })

    it('should return unformatted for invalid length', () => {
      expect(formatForSubmission('987654321')).toBe('987654321')
      expect(formatForSubmission('98765432100')).toBe('98765432100')
    })
  })

  describe('isValidIndianNumber', () => {
    it('should validate correct Indian mobile numbers', () => {
      expect(isValidIndianNumber('9876543210')).toBe(true)
      expect(isValidIndianNumber('8765432109')).toBe(true)
      expect(isValidIndianNumber('7654321098')).toBe(true)
      expect(isValidIndianNumber('6543210987')).toBe(true)
    })

    it('should reject invalid starting digits', () => {
      expect(isValidIndianNumber('5876543210')).toBe(false)
      expect(isValidIndianNumber('1876543210')).toBe(false)
      expect(isValidIndianNumber('0876543210')).toBe(false)
    })

    it('should reject invalid lengths', () => {
      expect(isValidIndianNumber('987654321')).toBe(false)
      expect(isValidIndianNumber('98765432100')).toBe(false)
      expect(isValidIndianNumber('')).toBe(false)
    })

    it('should handle formatted inputs', () => {
      expect(isValidIndianNumber('+919876543210')).toBe(true)
      expect(isValidIndianNumber('98765 43210')).toBe(true)
      expect(isValidIndianNumber('98765-43210')).toBe(true)
    })
  })

  describe('processPhoneNumber', () => {
    it('should return complete PhoneNumber object for valid input', () => {
      const result = processPhoneNumber('+91 98765 43210')
      expect(result).toEqual({
        raw: '+91 98765 43210',
        cleaned: '9876543210',
        formatted: '98765 43210',
        international: '+919876543210',
        isValid: true
      })
    })

    it('should return invalid PhoneNumber for invalid input', () => {
      const result = processPhoneNumber('123456789')
      expect(result.isValid).toBe(false)
      expect(result.raw).toBe('123456789')
    })
  })

  describe('getValidationError', () => {
    it('should return null for valid numbers', () => {
      expect(getValidationError('9876543210')).toBeNull()
      expect(getValidationError('+919876543210')).toBeNull()
      expect(getValidationError('98765 43210')).toBeNull()
    })

    it('should return error for empty input', () => {
      expect(getValidationError('')).toBe('Mobile number is required')
      expect(getValidationError('   ')).toBe('Mobile number is required')
    })

    it('should return error for short numbers', () => {
      expect(getValidationError('987654321')).toBe('Mobile number must be 10 digits')
    })

    it('should return error for long numbers', () => {
      expect(getValidationError('98765432100')).toBe('Mobile number must be exactly 10 digits')
    })

    it('should return error for invalid starting digits', () => {
      expect(getValidationError('1876543210')).toBe('Please enter a valid Indian mobile number')
      expect(getValidationError('5876543210')).toBe('Please enter a valid Indian mobile number')
    })
  })
})