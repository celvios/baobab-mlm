const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'Test server working' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // For now, just return success with OTP (in production, send via email)
    console.log(`OTP for ${email}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'Registration successful! Please check your email for verification code.',
      otp: otp // Remove this in production
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});