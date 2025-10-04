const sgMail = require('@sendgrid/mail');

// Set your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'YOUR_API_KEY_HERE');

const msg = {
  to: 'toluking001@gmail.com',
  from: 'toluking001@gmail.com', // Use verified sender
  subject: 'SendGrid Test',
  text: 'Test email from SendGrid',
  html: '<strong>Test email from SendGrid</strong>',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully');
  })
  .catch((error) => {
    console.error('SendGrid Error Details:');
    console.error('Status Code:', error.code);
    console.error('Message:', error.message);
    console.error('Response Body:', error.response?.body);
  });