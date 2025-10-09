const axios = require('axios');

const createAdmin = async () => {
  try {
    const response = await axios.post('https://baobab-mlm.onrender.com/api/admin-setup', {
      email: 'info@baobaworldwide.com',
      password: 'BaobabAdmin2025!',
      fullName: 'Baobab Admin'
    });

    console.log('✅ Admin created successfully!');
    console.log('Email: info@baobaworldwide.com');
    console.log('Password: BaobabAdmin2025!');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('✅ Admin already exists');
      console.log('Email: info@baobaworldwide.com');
      console.log('Password: BaobabAdmin2025!');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
};

createAdmin();
