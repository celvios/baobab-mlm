import React, { useEffect, useState } from 'react';
import { useCurrency } from '../hooks/useCurrency';

const CurrencyTest = () => {
  const { currency, country, loading, formatPrice, convertPrice } = useCurrency();
  const [testPrice, setTestPrice] = useState(null);

  useEffect(() => {
    const testConversion = async () => {
      if (!loading) {
        const converted = await convertPrice(20); // Test $20 USD
        setTestPrice(converted);
      }
    };
    testConversion();
  }, [loading, convertPrice]);

  if (loading) {
    return <div>Loading currency data...</div>;
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h3 className="font-bold text-blue-800 mb-2">Currency Test</h3>
      <p><strong>Detected Country:</strong> {country}</p>
      <p><strong>Currency:</strong> {currency}</p>
      <p><strong>$20 USD converts to:</strong> {testPrice ? formatPrice(testPrice) : 'Converting...'}</p>
    </div>
  );
};

export default CurrencyTest;