import React from 'react'
import { render, screen } from '@testing-library/react'
import LoginForm from '../LoginForm'

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    register: jest.fn(),
    user: null,
    logout: jest.fn(),
  }),
}))

describe('LoginForm', () => {
  it('renders login form with correct elements', () => {
    render(<LoginForm />)
    
    // Check if the main heading is rendered
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    
    // Check if username input is present
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    
    // Check if password input is present
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    
    // Check if sign in button is present
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    
    // Check if toggle button is present
    expect(screen.getByRole('button', { name: "Don't have an account? Sign up" })).toBeInTheDocument()
  })

  it('has proper form structure', () => {
    render(<LoginForm />)
    
    // Check if form element exists using tag name
    const formElement = document.querySelector('form')
    expect(formElement).toBeInTheDocument()
    
    // Check if inputs have proper labels (even if visually hidden)
    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    
    expect(usernameInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<LoginForm />)
    
    // Check if inputs have required attributes
    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    
    expect(usernameInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
    
    // Check if password input has correct type
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
