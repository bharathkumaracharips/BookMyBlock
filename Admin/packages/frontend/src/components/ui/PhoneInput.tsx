import { useState, useEffect, useRef } from 'react'
import { processPhoneNumber, getValidationError, formatForDisplay } from '../../utils/phoneFormatter'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
  disabled?: boolean
  error?: string
  placeholder?: string
  className?: string
}

export function PhoneInput({
  value,
  onChange,
  onValidationChange,
  disabled = false,
  error,
  placeholder = "98765 43210",
  className = ""
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update display value when prop value changes
  useEffect(() => {
    const phoneNumber = processPhoneNumber(value)
    setDisplayValue(phoneNumber.formatted)
    
    const error = getValidationError(value)
    setValidationError(error)
    
    if (onValidationChange) {
      onValidationChange(phoneNumber.isValid)
    }
  }, [value, onValidationChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const phoneNumber = processPhoneNumber(inputValue)
    
    // Update display with formatted value
    setDisplayValue(phoneNumber.formatted)
    
    // Call onChange with cleaned value for parent component
    onChange(phoneNumber.cleaned)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const phoneNumber = processPhoneNumber(pastedText)
    
    // Update display with formatted value
    setDisplayValue(phoneNumber.formatted)
    
    // Call onChange with cleaned value
    onChange(phoneNumber.cleaned)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const showError = (error || validationError) && !isFocused && value.length > 0
  const isValid = !validationError && value.length === 10

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Country Code Display */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 pointer-events-none">
          <span className="text-sm font-medium text-slate-300">🇮🇳</span>
          <span className="text-sm font-medium text-slate-300">+91</span>
          <div className="w-px h-4 bg-slate-600"></div>
        </div>

        {/* Phone Input */}
        <input
          ref={inputRef}
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full pl-20 pr-12 py-3 
            bg-slate-800 border rounded-lg text-white placeholder-slate-400
            focus:outline-none transition-colors duration-200
            ${showError 
              ? 'border-red-500 focus:border-red-500' 
              : isValid 
                ? 'border-green-500 focus:border-green-500'
                : 'border-slate-600 focus:border-violet-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
        />

        {/* Validation Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {value.length > 0 && !isFocused && (
            <>
              {isValid ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {showError && (
        <p className="text-sm text-red-400 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error || validationError}</span>
        </p>
      )}

      {/* Helper Text */}
      {!showError && isFocused && (
        <p className="text-sm text-slate-400">
          Enter your 10-digit mobile number
        </p>
      )}
    </div>
  )
}