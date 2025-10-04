const axios = require('axios');

class PaystackService {
  constructor() {
    this.baseURL = 'https://api.paystack.co';
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
  }

  async verifyBankAccount(accountNumber, bankCode) {
    try {
      const response = await axios.get(
        `${this.baseURL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        return {
          success: true,
          accountName: response.data.data.account_name,
          accountNumber: response.data.data.account_number
        };
      }

      return { success: false, message: 'Account verification failed' };
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      return { success: false, message: 'Unable to verify account' };
    }
  }

  async getBanks() {
    try {
      const response = await axios.get(`${this.baseURL}/bank`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching banks:', error);
      return [];
    }
  }
}

module.exports = new PaystackService();