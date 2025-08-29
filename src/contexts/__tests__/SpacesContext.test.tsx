import React from 'react'
import { render, screen } from '@testing-library/react'
import { SpacesProvider } from '../SpacesContext'
import { AuthProvider } from '../AuthContext'

// Mock the spaces API
jest.mock('../../services/spacesApi', () => ({
  getSpaces: jest.fn(),
}))

// Mock the auth API
jest.mock('../../services/authApi', () => ({
  authApi: {
    getProfile: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  },
}))

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}))

const TestComponent = () => {
  return (
    <div>
      <span data-testid="test-component">Test Component</span>
    </div>
  )
}

describe('SpacesContext with AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing when wrapped with both providers', () => {
    render(
      <AuthProvider>
        <SpacesProvider>
          <TestComponent />
        </SpacesProvider>
      </AuthProvider>
    )
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
  })

  it('does not fetch spaces when auth is loading', async () => {
    const { getSpaces } = await import('../../services/spacesApi')
    
    render(
      <AuthProvider>
        <SpacesProvider>
          <TestComponent />
        </SpacesProvider>
      </AuthProvider>
    )
    
    // Should not call getSpaces immediately when auth is loading
    expect(getSpaces).not.toHaveBeenCalled()
  })
})
