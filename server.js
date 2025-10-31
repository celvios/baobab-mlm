const express = require('express');
const path = require('path');
const app = express();

// Serve static files from home folder
app.use('/home', express.static(path.join(__dirname, 'home')));

// Serve React build files
app.use(express.static(path.join(__dirname, 'build')));

// Root route serves PHP homepage (you'll need PHP middleware or proxy)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home', 'index.php'));
});

// Marketing pages
app.get(['/aboutus', '/contact', '/product', '/details'], (req, res) => {
  const page = req.path.substring(1);
  res.sendFile(path.join(__dirname, 'home', `${page}.php`));
});

// All other routes serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
