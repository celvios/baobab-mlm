const API_KEY = 'e3a4b965095aaeaeec259e9a';
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

// African countries and their currencies
const AFRICAN_CURRENCIES = {
  'DZ': 'DZD', // Algeria
  'AO': 'AOA', // Angola
  'BJ': 'XOF', // Benin
  'BW': 'BWP', // Botswana
  'BF': 'XOF', // Burkina Faso
  'BI': 'BIF', // Burundi
  'CM': 'XAF', // Cameroon
  'CV': 'CVE', // Cape Verde
  'CF': 'XAF', // Central African Republic
  'TD': 'XAF', // Chad
  'KM': 'KMF', // Comoros
  'CG': 'XAF', // Congo
  'CD': 'CDF', // Democratic Republic of Congo
  'DJ': 'DJF', // Djibouti
  'EG': 'EGP', // Egypt
  'GQ': 'XAF', // Equatorial Guinea
  'ER': 'ERN', // Eritrea
  'ET': 'ETB', // Ethiopia
  'GA': 'XAF', // Gabon
  'GM': 'GMD', // Gambia
  'GH': 'GHS', // Ghana
  'GN': 'GNF', // Guinea
  'GW': 'XOF', // Guinea-Bissau
  'CI': 'XOF', // Ivory Coast
  'KE': 'KES', // Kenya
  'LS': 'LSL', // Lesotho
  'LR': 'LRD', // Liberia
  'LY': 'LYD', // Libya
  'MG': 'MGA', // Madagascar
  'MW': 'MWK', // Malawi
  'ML': 'XOF', // Mali
  'MR': 'MRU', // Mauritania
  'MU': 'MUR', // Mauritius
  'MA': 'MAD', // Morocco
  'MZ': 'MZN', // Mozambique
  'NA': 'NAD', // Namibia
  'NE': 'XOF', // Niger
  'NG': 'NGN', // Nigeria
  'RW': 'RWF', // Rwanda
  'ST': 'STN', // Sao Tome and Principe
  'SN': 'XOF', // Senegal
  'SC': 'SCR', // Seychelles
  'SL': 'SLL', // Sierra Leone
  'SO': 'SOS', // Somalia
  'ZA': 'ZAR', // South Africa
  'SS': 'SSP', // South Sudan
  'SD': 'SDG', // Sudan
  'SZ': 'SZL', // Swaziland
  'TZ': 'TZS', // Tanzania
  'TG': 'XOF', // Togo
  'TN': 'TND', // Tunisia
  'UG': 'UGX', // Uganda
  'ZM': 'ZMW', // Zambia
  'ZW': 'ZWL'  // Zimbabwe
};

class CurrencyService {
  constructor() {
    this.rates = {};
    this.lastUpdate = null;
    this.userLocation = null;
    this.userCurrency = 'USD';
  }

  async getUserLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      this.userLocation = data.country_code;
      this.userCurrency = AFRICAN_CURRENCIES[data.country_code] || 'USD';
      return { country: data.country_code, currency: this.userCurrency };
    } catch (error) {
      console.error('Failed to get user location:', error);
      return { country: 'NG', currency: 'NGN' }; // Default to Nigeria
    }
  }

  async getExchangeRates() {
    try {
      const response = await fetch(`${BASE_URL}/${API_KEY}/latest/USD`);
      const data = await response.json();
      
      if (data.result === 'success') {
        this.rates = data.conversion_rates;
        this.lastUpdate = new Date();
        return this.rates;
      }
      throw new Error('Failed to fetch exchange rates');
    } catch (error) {
      console.error('Exchange rate fetch error:', error);
      return this.rates; // Return cached rates
    }
  }

  async convertPrice(usdPrice, targetCurrency = null) {
    const currency = targetCurrency || this.userCurrency;
    
    // Check if rates need updating (update every 10 minutes)
    const needsUpdate = !this.lastUpdate || 
      (new Date() - this.lastUpdate) > 10 * 60 * 1000;
    
    if (needsUpdate) {
      await this.getExchangeRates();
    }

    const rate = this.rates[currency] || 1;
    return usdPrice * rate;
  }

  formatPrice(price, currency = null) {
    const curr = currency || this.userCurrency;
    
    const formatters = {
      'NGN': (p) => `₦${Math.round(p).toLocaleString()}`,
      'ZAR': (p) => `R${p.toFixed(2)}`,
      'EGP': (p) => `E£${p.toFixed(2)}`,
      'KES': (p) => `KSh${Math.round(p).toLocaleString()}`,
      'GHS': (p) => `₵${p.toFixed(2)}`,
      'MAD': (p) => `${p.toFixed(2)} DH`,
      'TND': (p) => `${p.toFixed(3)} TND`,
      'USD': (p) => `$${p.toFixed(2)}`
    };

    const formatter = formatters[curr] || formatters['USD'];
    return formatter(price);
  }

  getCurrencySymbol(currency = null) {
    const curr = currency || this.userCurrency;
    const symbols = {
      'NGN': '₦', 'ZAR': 'R', 'EGP': 'E£', 'KES': 'KSh',
      'GHS': '₵', 'MAD': 'DH', 'TND': 'TND', 'USD': '$'
    };
    return symbols[curr] || curr;
  }

  async initialize() {
    await this.getUserLocation();
    await this.getExchangeRates();
    return {
      country: this.userLocation,
      currency: this.userCurrency,
      rates: this.rates
    };
  }
}

export default new CurrencyService();