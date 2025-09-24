#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Baobab Homepage Deployment...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if build directory exists, if not create it
if (!fs.existsSync('build')) {
  console.log('📁 Creating build directory...');
  fs.mkdirSync('build');
}

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Build the project
  console.log('🔨 Building the project...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n✅ Build completed successfully!');
  console.log('\n📋 Deployment Instructions:');
  console.log('\n🔵 For Vercel:');
  console.log('1. Install Vercel CLI: npm i -g vercel');
  console.log('2. Run: vercel --prod');
  console.log('3. Follow the prompts');
  
  console.log('\n🟢 For Render:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect your GitHub repo to Render');
  console.log('3. Render will automatically use the render.yaml configuration');
  
  console.log('\n🌐 Your homepage will be available at the deployed URL');
  console.log('📁 Build files are in the ./build directory');

} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}