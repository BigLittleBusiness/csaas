import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './api'

global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        user: { id: 1, email: 'test@example.com', role: 'admin' }
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.login('test@example.com', 'password')

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
        })
      )
    })

    it('should handle login errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      })

      await expect(api.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('User Management', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'test-token')
    })

    it('should get users list', async () => {
      const mockUsers = {
        users: [
          { id: 1, name: 'User 1', email: 'user1@example.com' },
          { id: 2, name: 'User 2', email: 'user2@example.com' },
        ],
        total: 2
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      })

      const result = await api.getUsers()

      expect(result).toEqual(mockUsers)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/users'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should update user', async () => {
      const mockUser = { id: 1, name: 'Updated User', role: 'admin' }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })

      const result = await api.updateUser(1, { name: 'Updated User', role: 'admin' })

      expect(result.user).toEqual(mockUser)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/users/1'),
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })

    it('should deactivate user', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'User deactivated successfully' }),
      })

      const result = await api.deactivateUser(1)

      expect(result.message).toBe('User deactivated successfully')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/users/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('Organization Management', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'test-token')
    })

    it('should get organization details', async () => {
      const mockOrg = {
        id: 1,
        name: 'Test Org',
        plan_tier: 'growth',
        customer_count: 50
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrg,
      })

      const result = await api.getOrganization()

      expect(result).toEqual(mockOrg)
    })

    it('should update organization plan', async () => {
      const mockResponse = {
        message: 'Plan updated successfully',
        organization: { plan_tier: 'enterprise' }
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.updateOrganizationPlan('enterprise')

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/organization/plan'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ plan_tier: 'enterprise' }),
        })
      )
    })
  })
})
