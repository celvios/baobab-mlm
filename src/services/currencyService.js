const API_KEY = process.env.REACT_APP_EXCHANGE_API_KEY || 'e3a4b965095aaeaeec259e9a';
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
      // Get country from user profile in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const country = user.country || 'NG';
      console.log('Currency Service - User country:', country);
      this.userLocation = country;
      this.userCurrency = AFRICAN_CURRENCIES[country] || 'NGN';
      console.log('Currency Service - Selected currency:', this.userCurrency);
      return { country: this.userLocation, currency: this.userCurrency };
    } catch (error) {
      console.error('Failed to get user location:', error);
      return { country: 'NG', currency: 'NGN' };
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
      // Fallback to hardcoded rates if API fails
      if (Object.keys(this.rates).length === 0) {
        this.rates = {
          NGN: 1500, AOA: 900, XOF: 600, BWP: 13.5, NAD: 18, ZAR: 18,
          KES: 130, GHS: 15, EGP: 49, TZS: 2600, UGX: 3700, ZMW: 27,
          MUR: 46, ETB: 120, RWF: 1300, MWK: 1730, MZN: 64, LRD: 190,
          USD: 1
        };
      }
      return this.rates;
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
      'DZD': (p) => `DA ${Math.round(p).toLocaleString()}`,
      'AOA': (p) => `Kz ${p.toFixed(2)}`,
      'XOF': (p) => `CFA ${Math.round(p).toLocaleString()}`,
      'BWP': (p) => `P${p.toFixed(2)}`,
      'BIF': (p) => `FBu ${Math.round(p).toLocaleString()}`,
      'XAF': (p) => `FCFA ${Math.round(p).toLocaleString()}`,
      'CVE': (p) => `$${p.toFixed(2)}`,
      'KMF': (p) => `CF ${Math.round(p).toLocaleString()}`,
      'CDF': (p) => `FC ${p.toFixed(2)}`,
      'DJF': (p) => `Fdj ${Math.round(p).toLocaleString()}`,
      'EGP': (p) => `E£${p.toFixed(2)}`,
      'ERN': (p) => `Nfk ${p.toFixed(2)}`,
      'ETB': (p) => `Br ${p.toFixed(2)}`,
      'GMD': (p) => `D ${p.toFixed(2)}`,
      'GHS': (p) => `₵${p.toFixed(2)}`,
      'GNF': (p) => `FG ${Math.round(p).toLocaleString()}`,
      'KES': (p) => `KSh ${Math.round(p).toLocaleString()}`,
      'LSL': (p) => `L ${p.toFixed(2)}`,
      'LRD': (p) => `L$ ${p.toFixed(2)}`,
      'LYD': (p) => `LD ${p.toFixed(3)}`,
      'MGA': (p) => `Ar ${Math.round(p).toLocaleString()}`,
      'MWK': (p) => `MK ${Math.round(p).toLocaleString()}`,
      'MRU': (p) => `UM ${p.toFixed(2)}`,
      'MUR': (p) => `₨ ${p.toFixed(2)}`,
      'MAD': (p) => `DH ${p.toFixed(2)}`,
      'MZN': (p) => `MT ${p.toFixed(2)}`,
      'NAD': (p) => `N$ ${p.toFixed(2)}`,
      'NGN': (p) => `₦${Math.round(p).toLocaleString()}`,
      'RWF': (p) => `RF ${Math.round(p).toLocaleString()}`,
      'STN': (p) => `Db ${p.toFixed(2)}`,
      'SCR': (p) => `₨ ${p.toFixed(2)}`,
      'SLL': (p) => `Le ${Math.round(p).toLocaleString()}`,
      'SOS': (p) => `Sh ${Math.round(p).toLocaleString()}`,
      'ZAR': (p) => `R ${p.toFixed(2)}`,
      'SSP': (p) => `£ ${p.toFixed(2)}`,
      'SDG': (p) => `SDG ${p.toFixed(2)}`,
      'SZL': (p) => `L ${p.toFixed(2)}`,
      'TZS': (p) => `TSh ${Math.round(p).toLocaleString()}`,
      'TND': (p) => `DT ${p.toFixed(3)}`,
      'UGX': (p) => `USh ${Math.round(p).toLocaleString()}`,
      'ZMW': (p) => `ZK ${p.toFixed(2)}`,
      'ZWL': (p) => `Z$ ${p.toFixed(2)}`,
      'USD': (p) => `$${p.toFixed(2)}`
    };

    const formatter = formatters[curr] || ((p) => `${curr} ${p.toFixed(2)}`);
    return formatter(price);
  }

  getCurrencySymbol(currency = null) {
    const curr = currency || this.userCurrency;
    const symbols = {
      'DZD': 'DA', 'AOA': 'Kz', 'XOF': 'CFA', 'BWP': 'P', 'BIF': 'FBu',
      'XAF': 'FCFA', 'CVE': '$', 'KMF': 'CF', 'CDF': 'FC', 'DJF': 'Fdj',
      'EGP': 'E£', 'ERN': 'Nfk', 'ETB': 'Br', 'GMD': 'D', 'GHS': '₵',
      'GNF': 'FG', 'KES': 'KSh', 'LSL': 'L', 'LRD': 'L$', 'LYD': 'LD',
      'MGA': 'Ar', 'MWK': 'MK', 'MRU': 'UM', 'MUR': '₨', 'MAD': 'DH',
      'MZN': 'MT', 'NAD': 'N$', 'NGN': '₦', 'RWF': 'RF', 'STN': 'Db',
      'SCR': '₨', 'SLL': 'Le', 'SOS': 'Sh', 'ZAR': 'R', 'SSP': '£',
      'SDG': 'SDG', 'SZL': 'L', 'TZS': 'TSh', 'TND': 'DT', 'UGX': 'USh',
      'ZMW': 'ZK', 'ZWL': 'Z$', 'USD': '$'
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