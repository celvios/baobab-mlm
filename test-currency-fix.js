// Test script to verify currency fix
// Run this in browser console after logging in

console.log('=== Currency System Test ===\n');

// 1. Check if user object has country
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('1. User Country:', user.country || 'NOT FOUND ❌');

// 2. Check currency mapping
const AFRICAN_CURRENCIES = {
  'NA': 'NAD', 'NG': 'NGN', 'ZA': 'ZAR', 'EG': 'EGP',
  'KE': 'KES', 'GH': 'GHS', 'MA': 'MAD', 'TN': 'TND'
};

const expectedCurrency = AFRICAN_CURRENCIES[user.country] || 'NGN';
console.log('2. Expected Currency:', expectedCurrency);

// 3. Test currency service
import currencyService from './src/services/currencyService.js';

currencyService.getUserLocation().then(location => {
  console.log('3. Currency Service Location:', location);
  
  if (location.country === user.country) {
    console.log('✅ Country matches!');
  } else {
    console.log('❌ Country mismatch!');
  }
  
  if (location.currency === expectedCurrency) {
    console.log('✅ Currency correct!');
  } else {
    console.log('❌ Currency incorrect!');
  }
});

// 4. Test price formatting
const testPrice = 100; // $100 USD
currencyService.convertPrice(testPrice).then(converted => {
  const formatted = currencyService.formatPrice(converted);
  console.log(`4. Test Price: $${testPrice} USD → ${formatted}`);
});

console.log('\n=== Test Complete ===');
console.log('If you see ❌, please:');
console.log('1. Log out');
console.log('2. Clear localStorage');
console.log('3. Log back in');
