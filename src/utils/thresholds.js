import currencyService from '../services/currencyService';

const BASE_THRESHOLD_NGN = 18000;

export async function getLocalizedThreshold() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const country = user.country || 'NG';
  
  if (country === 'NG') {
    return { amount: BASE_THRESHOLD_NGN, formatted: '₦18,000' };
  }
  
  // Convert NGN 18,000 to user's currency
  await currencyService.initialize();
  const rates = currencyService.rates;
  
  const ngnRate = rates['NGN'] || 1500;
  const userCurrencyRate = rates[currencyService.userCurrency] || 1;
  
  const amountInUserCurrency = (BASE_THRESHOLD_NGN / ngnRate) * userCurrencyRate;
  const formatted = currencyService.formatPrice(amountInUserCurrency);
  
  return { amount: amountInUserCurrency, formatted };
}
