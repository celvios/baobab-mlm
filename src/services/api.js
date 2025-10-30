const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://baobab-mlm.onrender.com';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    this.csrfToken = null;
    console.log('API Base URL:', API_BASE_URL);
    this.fetchCsrfToken();
  }

  async fetchCsrfToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/csrf-token`);
      const data = await response.json();
      this.csrfToken = data.csrfToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
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
    
    const token = this.token || localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    console.log('Making request to:', url);
    console.log('API Base URL configured as:', API_BASE_URL);

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
    if (!this.csrfToken) {
      await this.fetchCsrfToken();
    }
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        fullName: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        country: userData.country,
        referredBy: userData.referralCode || null
      }),
    });
  }

  async login(email, password) {
    if (!this.csrfToken) {
      await this.fetchCsrfToken();
    }
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async verifyEmail(token) {
    return this.request(`/auth/verify-email?token=${token}`);
  }

  async resendVerification(email) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // User methods
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getWallet() {
    return this.request('/user/wallet');
  }

  async getTransactionHistory(page = 1, limit = 10) {
    return this.request(`/user/transactions?page=${page}&limit=${limit}`);
  }

  // Withdrawal methods
  async requestWithdrawal(data) {
    return this.request('/withdrawal/request', {
      method: 'POST',
      body: JSON.stringify(data),
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

  async getStageProgress() {
    return this.request('/mlm/level-progress');
  }

  async getUserMatrix() {
    return this.request('/mlm/matrix');
  }

  async getBinaryTree() {
    return this.request('/mlm/binary-tree');
  }

  async getMatrixTree() {
    return this.request('/mlm/matrix-tree');
  }

  async syncMatrix() {
    return this.request('/mlm/sync-matrix', {
      method: 'POST'
    });
  }

  async getUserIncentives() {
    return this.request('/mlm/incentives');
  }

  // Orders methods
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(page = 1, limit = 10) {
    return this.request(`/orders?page=${page}&limit=${limit}`);
  }

  async getOrderById(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, statusData) {
    return this.request(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async deleteOrder(orderId) {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  async deleteAllOrders() {
    return this.request('/orders', {
      method: 'DELETE',
    });
  }

  // Payment methods
  async uploadPaymentProof(formData) {
    const url = `${API_BASE_URL}/api/payment/upload-proof`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    
    return response.json();
  }

  async getPendingPayments() {
    return this.request('/payment/pending');
  }

  async confirmPayment(userId, creditAmount, type = 'joining_fee') {
    return this.request(`/payment/confirm/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ creditAmount, type }),
    });
  }

  // Products methods
  async getProducts() {
    return this.request('/products');
  }

  async getProductById(productId) {
    return this.request(`/products/${productId}`);
  }

  // Wallet purchase
  async purchaseWithWallet(orderData) {
    return this.request('/wallet/purchase', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Admin methods
  async setupAdmin(adminData) {
    return this.request('/admin-setup', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async adminLogin(email, password) {
    const response = await this.request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('adminToken', response.token);
    }
    
    return response;
  }

  async getAdminStats() {
    return this.request('/admin-stats');
  }

  async getRecentActivity() {
    return this.request('/admin/recent-activity');
  }

  async getUsers() {
    return this.request('/admin/users-test');
  }

  async createUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async creditUser(userId, amount) {
    return this.request(`/admin/users/${userId}/credit-test`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async creditUserWithNotification(userId, amount) {
    return this.request(`/admin/users/${userId}/credit-with-notification`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getAdminOrders() {
    return this.request('/admin/orders');
  }

  async updateOrderStatus(orderId, statusData) {
    return this.request(`/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async getAdminProducts() {
    return this.request('/admin/products');
  }

  async createProduct(productData) {
    const url = `${API_BASE_URL}/api/admin/products`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: productData // FormData, don't stringify
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }
    
    return response.json();
  }

  async updateProduct(productId, productData) {
    const url = `${API_BASE_URL}/api/admin/products/${productId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: productData // FormData, don't stringify
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }
    
    return response.json();
  }

  async deleteProduct(productId) {
    return this.request(`/admin/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Admin Email methods
  async getEmailList(category = 'all', search = '') {
    return this.request(`/admin/emails/list?category=${category}&search=${search}`);
  }

  async getAllUsers() {
    return this.request('/admin/users?limit=1000');
  }

  async sendEmail(emailData) {
    return this.request('/admin/emails/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async getEmailHistory(page = 1, limit = 10) {
    return this.request(`/admin/emails/history?page=${page}&limit=${limit}`);
  }

  async removeUserFromEmailList(userId) {
    return this.request(`/admin/emails/remove-user/${userId}`, {
      method: 'DELETE',
    });
  }

  // Deposit methods
  async submitDepositRequest(formData) {
    const url = `${API_BASE_URL}/api/deposit/request`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Deposit request failed');
    }
    
    return response.json();
  }

  async getDepositStatus() {
    return this.request('/deposit/status');
  }

  async getDepositRequests() {
    console.log('getDepositRequests called');
    console.log('Admin token:', localStorage.getItem('adminToken'));
    const result = await this.request('/admin/deposit-requests');
    console.log('getDepositRequests result:', result);
    return result;
  }

  async approveDeposit(depositId, data) {
    return this.request('/admin/approve-deposit', {
      method: 'POST',
      body: JSON.stringify({ depositId, ...data }),
    });
  }

  async rejectDeposit(depositId) {
    return this.request('/admin/reject-deposit', {
      method: 'POST',
      body: JSON.stringify({ depositId }),
    });
  }

  // Blog methods
  async getBlogPosts() {
    return this.request('/admin/blog');
  }

  async createBlogPost(blogData) {
    return this.request('/admin/blog', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  }

  async updateBlogPost(blogId, blogData) {
    return this.request(`/admin/blog/${blogId}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  }

  async deleteBlogPost(blogId) {
    return this.request(`/admin/blog/${blogId}`, {
      method: 'DELETE',
    });
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('user');
  }
}

export default new ApiService();