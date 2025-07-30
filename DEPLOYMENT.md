# Frontend Deployment Guide for Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be in a Git repository
3. **Backend API**: Your backend should be deployed and accessible

## Environment Variables

Set these environment variables in your Vercel project settings:

```bash
REACT_APP_API_URL=https://your-backend-domain.vercel.app
```

**Important**: Replace `your-backend-domain.vercel.app` with your actual backend Vercel domain.

## Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Set the root directory to the project root (where package.json is located)
5. Configure environment variables
6. Deploy

#### Option B: Using Vercel CLI
```bash
vercel
```

### 3. Configure Environment Variables
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `REACT_APP_API_URL` with your backend API URL

## Important Notes

### API Configuration
- The frontend will automatically use the `REACT_APP_API_URL` environment variable
- If not set, it defaults to `http://localhost:5000` for development
- Make sure your backend CORS settings allow requests from your frontend domain

### CORS Configuration
Your backend should have CORS configured to allow requests from your frontend domain:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Session Management
- Sessions are handled via cookies with `withCredentials: true`
- Ensure your backend and frontend are on compatible domains for cookie sharing

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check your `REACT_APP_API_URL` environment variable
   - Ensure your backend is deployed and accessible
   - Check CORS configuration on your backend

2. **Build Errors**
   - Check that all dependencies are properly installed
   - Ensure Node.js version is compatible (use Node 18+)

3. **Session Issues**
   - Verify that both frontend and backend are using HTTPS in production
   - Check that cookie domains are properly configured

### Logs
View deployment logs in your Vercel dashboard under the "Functions" tab.

## Production Considerations

1. **Security**
   - Use HTTPS (automatic with Vercel)
   - Ensure environment variables are properly set
   - Consider implementing CSP headers

2. **Performance**
   - Vercel automatically optimizes static assets
   - Enable caching for better performance

3. **Monitoring**
   - Use Vercel's built-in analytics
   - Monitor build times and deployment success rates

## Development vs Production

### Development
- API URL: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### Production
- API URL: `https://your-backend.vercel.app`
- Frontend: `https://your-frontend.vercel.app`

## Testing Your Deployment

1. **Health Check**: Visit your frontend URL to ensure it loads
2. **API Connection**: Try logging in to test API connectivity
3. **Session Persistence**: Verify that sessions work across page refreshes
4. **All Features**: Test all major features to ensure they work with the deployed backend 