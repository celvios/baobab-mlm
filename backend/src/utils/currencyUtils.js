const axios = require('axios');

const API_KEY = process.env.EXCHANGE_API_KEY || 'e3a4b965095aaeaeec259e9a';
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

// Minimum deposit in NGN
const MIN_DEPOSIT_NGN = 18000;

let cachedRates = null;
let lastUpdate = null;

async function getExchangeRates() {
  const now = new Date();
  if (cachedRates && lastUpdate && (now - lastUpdate) < 10 * 60 * 1000) {
    return cachedRates;
  }

  try {
    const response = await axios.get(`${BASE_URL}/${API_KEY}/latest/USD`);
    if (response.data.result === 'success') {
      cachedRates = response.data.conversion_rates;
      lastUpdate = now;
      return cachedRates;
    }
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error.message);
  }
  
  return cachedRates || { NGN: 1500, USD: 1 };
}

async function meetsMinimumDeposit(amountUSD) {
  const rates = await getExchangeRates();
  const amountNGN = amountUSD * (rates.NGN || 1500);
  return amountNGN >= MIN_DEPOSIT_NGN;
}

async function convertToUSD(amount, fromCurrency) {
  const rates = await getExchangeRates();
  const rate = rates[fromCurrency] || 1;
  return amount / rate;
}

async function convertFromUSD(amountUSD, toCurrency) {
  const rates = await getExchangeRates();
  const rate = rates[toCurrency] || 1;
  return amountUSD * rate;
}

module.exports = {
  getExchangeRates,
  meetsMinimumDeposit,
  convertToUSD,
  convertFromUSD,
  MIN_DEPOSIT_NGN
};
