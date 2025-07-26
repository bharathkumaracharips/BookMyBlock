import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Simple test component for setup verification
const TestComponent = () => (
  <div>
    <h1>BookMyBlock</h1>
    <p>Frontend setup complete ✅</p>
  </div>
)

describe('Frontend Setup', () => {
  it('should render test component', () => {
    render(<TestComponent />)
    expect(screen.getByText('BookMyBlock')).toBeInTheDocument()
    expect(screen.getByText('Frontend setup complete ✅')).toBeInTheDocument()
  })
})