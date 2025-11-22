const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.request('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });
  }

  // Admin - User Management
  async getUsers() {
    return this.request('/api/admin/users');
  }

  async getUser(userId) {
    return this.request(`/api/admin/users/${userId}`);
  }

  async updateUser(userId, data) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deactivateUser(userId) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Admin - Organization Management
  async getOrganization() {
    return this.request('/api/admin/organization');
  }

  async updateOrganization(data) {
    return this.request('/api/admin/organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getOrganizationStats() {
    return this.request('/api/admin/organization/stats');
  }

  async getAvailablePlans() {
    return this.request('/api/admin/organization/plans');
  }

  async updateOrganizationPlan(planTier) {
    return this.request('/api/admin/organization/plan', {
      method: 'PUT',
      body: JSON.stringify({ plan_tier: planTier }),
    });
  }

  // Admin - Dashboard Stats
  async getAdminStats() {
    return this.request('/api/admin/stats');
  }
}

export const api = new ApiService();
