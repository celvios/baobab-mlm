# Baobab Homepage Deployment Guide

This guide will help you deploy the Baobab homepage to both Vercel and Render.

## 🚀 Quick Deploy

Run the deployment preparation script:
```bash
npm run deploy
```

## 📋 Manual Deployment Steps

### Prerequisites
- Node.js installed
- Git repository set up
- Account on Vercel and/or Render

### 1. Prepare the Build

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## 🔵 Vercel Deployment

### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a React app
5. Click "Deploy"

### Vercel Configuration
The project includes a `vercel.json` file with:
- Static build configuration
- Proper routing for SPA
- Caching headers for assets
- Production environment variables

## 🟢 Render Deployment

### Steps:
1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New Static Site"
4. Connect your GitHub repository
5. Render will use the `render.yaml` configuration automatically

### Render Configuration
The `render.yaml` file includes:
- Static site configuration
- Build command: `npm install && npm run build`
- Publish directory: `./build`
- Production environment

## 🌐 Homepage Features

The deployed homepage includes:
- ✅ Responsive design
- ✅ Modern React components
- ✅ Tailwind CSS styling
- ✅ Optimized images
- ✅ SEO-friendly structure
- ✅ Fast loading performance

## 📁 Project Structure

```
baobab-mlm/
├── src/
│   ├── pages/
│   │   └── Homepage.js          # Main homepage component
│   ├── App.js                   # Updated routing
│   └── index.css               # Tailwind styles
├── public/
│   └── images/                 # Homepage images
├── vercel.json                 # Vercel configuration
├── render.yaml                 # Render configuration
└── deploy.js                   # Deployment script
```

## 🔧 Environment Variables

No environment variables are required for the homepage deployment.

## 🐛 Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`

### Images Not Loading
- Verify images are in `public/images/` directory
- Check image paths in components start with `/images/`

### Routing Issues
- Vercel: The `vercel.json` handles SPA routing
- Render: Static sites automatically handle SPA routing

## 📞 Support

If you encounter issues:
1. Check the build logs
2. Verify all images are present
3. Ensure the repository is up to date
4. Contact support if needed

## 🎉 Success!

Once deployed, your Baobab homepage will be live and accessible at:
- Vercel: `https://your-project.vercel.app`
- Render: `https://your-project.onrender.com`

The homepage includes all sections from the design:
- Hero section with product showcase
- About Baobab information
- Benefits and features
- Product highlights
- Customer testimonials
- Community vision
- Blog section
- Footer with links