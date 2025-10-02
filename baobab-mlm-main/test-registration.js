// Test script to verify registration endpoint
const testRegistration = async () => {
  const API_BASE_URL = 'http://localhost:5001/api';
  
  const testData = {
    email: 'test' + Date.now() + '@example.com',
    password: 'testpass123',
    fullName: 'Test User',
    phone: '1234567890',
    referredBy: null
  };

  try {
    console.log('Testing registration with:', testData);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Success response:', data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

testRegistration();