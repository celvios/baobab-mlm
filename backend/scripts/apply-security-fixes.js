const fs = require('fs');
const path = require('path');

console.log('🔒 Applying Security Fixes...\n');

const dangerousFiles = [
  'create-admin-baobab.js',
  'update-admin-password.js',
  'generate-referrals-local.js',
  'debug-endpoint.js',
  'debug-dashboard.js',
  'debug-sendgrid.js',
  'test-email.js'
];

console.log('1. Removing dangerous files with hardcoded credentials...');
dangerousFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`   ✓ Deleted ${file}`);
  }
});

console.log('\n2. Creating .gitignore entries...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
const gitignoreEntries = `
# Security
.env
.env.local
.env.production
*.key
*.pem
*.cert

# Logs
logs/
*.log

# Uploads
uploads/*
!uploads/.gitkeep
`;

if (fs.existsSync(gitignorePath)) {
  fs.appendFileSync(gitignorePath, gitignoreEntries);
  console.log('   ✓ Updated .gitignore');
} else {
  fs.writeFileSync(gitignorePath, gitignoreEntries);
  console.log('   ✓ Created .gitignore');
}

console.log('\n3. Checking environment variables...');
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('   ⚠ .env file not found');
  console.log('   → Copy .env.secure.example to .env and fill in values');
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'JWT_SECRET',
    'DATABASE_URL',
    'NODE_ENV',
    'ALLOWED_ORIGINS'
  ];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      console.log(`   ⚠ Missing ${varName}`);
    } else {
      console.log(`   ✓ ${varName} present`);
    }
  });
}

console.log('\n4. Updating package.json scripts...');
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.scripts.start = 'node src/server.secure.js';
  packageJson.scripts.dev = 'nodemon src/server.secure.js';
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('   ✓ Updated start script to use secure server');
}

console.log('\n5. Security checklist:');
console.log('   [ ] Generate JWT_SECRET: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
console.log('   [ ] Update .env with all required variables');
console.log('   [ ] Enable SSL on database');
console.log('   [ ] Set ALLOWED_ORIGINS to your domain');
console.log('   [ ] Review and test all endpoints');
console.log('   [ ] Run npm audit and fix vulnerabilities');
console.log('   [ ] Set up monitoring and logging');

console.log('\n✅ Security fixes applied!');
console.log('\n⚠️  IMPORTANT: Review DEPLOYMENT_SECURITY_GUIDE.md before going to production\n');
