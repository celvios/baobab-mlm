const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    console.log('API Base URL:', API_BASE_URL);
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    console.log('Making request to:', url, 'with config:', config);

    try {
      const response = await fetch(url, config);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = 'Something went wrong';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Handle network errors specifically
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        fullName: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        referredBy: userData.referralCode || null
      }),
    });
  }

  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async verifyEmail(token) {
    return this.request(`/api/auth/verify-email?token=${token}`);
  }

  async resendVerification(email) {
    return this.request('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email, otp) {
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  // User methods
  async getProfile() {
    return this.request('/api/user/profile');
  }

  async updateProfile(profileData) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getWallet() {
    return this.request('/api/user/wallet');
  }

  async getTransactionHistory(page = 1, limit = 10) {
    return this.request(`/api/user/transactions?page=${page}&limit=${limit}`);
  }

  // Withdrawal methods
  async requestWithdrawal(amount) {
    return this.request('/withdrawal/request', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getWithdrawalRequests(page = 1, limit = 10) {
    return this.request(`/withdrawal/requests?page=${page}&limit=${limit}`);
  }

  // Market updates methods
  async getMarketUpdates(page = 1, limit = 10) {
    return this.request(`/market-updates?page=${page}&limit=${limit}`);
  }

  async markUpdateAsRead(updateId) {
    return this.request(`/market-updates/${updateId}/read`, {
      method: 'PUT',
    });
  }

  async getUnreadCount() {
    return this.request('/market-updates/unread-count');
  }

  // MLM methods
  async getMatrix() {
    return this.request('/mlm/matrix');
  }

  async getEarnings() {
    return this.request('/mlm/earnings');
  }

  async getTeam() {
    return this.request('/mlm/team');
  }

  async getLevelProgress() {
    return this.request('/mlm/level-progress');
  }

  // Orders methods
  async createOrder(orderData) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(page = 1, limit = 10) {
    return this.request(`/api/orders?page=${page}&limit=${limit}`);
  }

  async getOrderById(orderId) {
    return this.request(`/api/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, statusData) {
    return this.request(`/api/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async deleteOrder(orderId) {
    return this.request(`/api/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('user');
  }
}

export default new ApiService();