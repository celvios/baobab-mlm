const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'backend', 'src', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Replace all SSL configurations
content = content.replace(
  /ssl: process\.env\.NODE_ENV === 'production' \? \{ rejectUnauthorized: false \} : false/g,
  "ssl: process.env.DATABASE_URL ? { rejectUnauthorized: true } : false"
);

fs.writeFileSync(serverPath, content, 'utf8');
console.log('Fixed SSL certificate validation in server.js');
