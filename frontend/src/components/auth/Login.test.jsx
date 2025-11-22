import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import { api } from '@/services/api'

vi.mock('@/services/api')
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

const renderLogin = (props = {}) => {
  return render(
    <BrowserRouter>
      <Login {...props} />
    </BrowserRouter>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render login form', () => {
    renderLogin()
    
    expect(screen.getByText(/UpliftCS/i)).toBeInTheDocument()
    expect(screen.getByText(/Customer Success, Elevated by AI/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should handle successful login', async () => {
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin',
      name: 'Admin User'
    }

    const mockResponse = {
      access_token: 'test-token',
      refresh_token: 'refresh-token',
      user: mockUser
    }

    api.login.mockResolvedValueOnce(mockResponse)
    const onLogin = vi.fn()
    const user = userEvent.setup()

    renderLogin({ onLogin })

    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('admin@example.com', 'password123')
      expect(localStorage.getItem('access_token')).toBe('test-token')
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token')
      expect(onLogin).toHaveBeenCalledWith(mockUser)
    })
  })

  it('should handle login error', async () => {
    api.login.mockRejectedValueOnce(new Error('Invalid credentials'))
    const user = userEvent.setup()

    renderLogin()

    await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(api.login).toHaveBeenCalled()
    })
  })

  it('should show loading state during login', async () => {
    api.login.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    const user = userEvent.setup()

    renderLogin()

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument()
  })

  it('should require email and password', async () => {
    const user = userEvent.setup()
    renderLogin()

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    // Form validation should prevent submission
    expect(api.login).not.toHaveBeenCalled()
  })
})
