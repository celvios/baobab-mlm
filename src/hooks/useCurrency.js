import { useState, useEffect } from 'react';
import currencyService from '../services/currencyService';

export const useCurrency = () => {
  const [currency, setCurrency] = useState('NGN');
  const [country, setCountry] = useState('NG');
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState({});

  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        const data = await currencyService.initialize();
        setCurrency(data.currency);
        setCountry(data.country);
        setRates(data.rates);
      } catch (error) {
        console.error('Currency initialization failed:', error);
        setCurrency('NGN'); // Default to Nigeria
        setCountry('NG');
      } finally {
        setLoading(false);
      }
    };

    initializeCurrency();
  }, []);

  const convertPrice = async (usdPrice) => {
    return await currencyService.convertPrice(usdPrice);
  };

  const formatPrice = (price) => {
    return currencyService.formatPrice(price);
  };

  const getCurrencySymbol = () => {
    return currencyService.getCurrencySymbol();
  };

  return {
    currency,
    country,
    loading,
    rates,
    convertPrice,
    formatPrice,
    getCurrencySymbol
  };
};