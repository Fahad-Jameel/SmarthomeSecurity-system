#!/bin/bash

# Smart Home Security Server - Vercel Deployment Script

echo "🚀 Starting deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the server directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Please create one with the following variables:"
    echo "   MONGO_URI=your_mongodb_connection_string"
    echo "   SESSION_SECRET=your_session_secret"
    echo "   CLIENT_URL=your_frontend_url"
    echo "   NODE_ENV=production"
    echo ""
    echo "You can also set these in Vercel dashboard after deployment."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Test your API endpoints"
echo "3. Update your frontend to use the new API URL"
echo ""
echo "🔗 Your API will be available at: https://your-project.vercel.app/api" 