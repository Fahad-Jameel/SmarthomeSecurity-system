#!/bin/bash

# Smart Home Security Frontend - Vercel Deployment Script

echo "🚀 Starting frontend deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Please create one with the following variables:"
    echo "   REACT_APP_API_URL=https://your-backend-domain.vercel.app"
    echo ""
    echo "You can also set these in Vercel dashboard after deployment."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set REACT_APP_API_URL environment variable in Vercel dashboard"
echo "2. Update your backend CORS settings to allow your frontend domain"
echo "3. Test the application functionality"
echo ""
echo "🔗 Your frontend will be available at: https://your-project.vercel.app" 