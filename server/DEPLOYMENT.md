# Deployment Guide for Vercel

## Prerequisites

1. **MongoDB Database**: You need a MongoDB database (MongoDB Atlas recommended for production)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Git Repository**: Your code should be in a Git repository

## Environment Variables

Set these environment variables in your Vercel project settings:

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smarthomesecurity
SESSION_SECRET=your_very_secure_session_secret_here
CLIENT_URL=https://your-frontend-domain.com
NODE_ENV=production
```

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
4. Set the root directory to `server/`
5. Configure environment variables
6. Deploy

#### Option B: Using Vercel CLI
```bash
cd server
vercel
```

### 3. Configure Environment Variables
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all the required environment variables listed above

## Important Notes

### Database Connection
- Use MongoDB Atlas for production
- Ensure your MongoDB connection string is correct
- The database will be automatically connected when the server starts

### Session Storage
- Sessions are stored in MongoDB using `connect-mongo`
- This ensures sessions persist across serverless function invocations

### CORS Configuration
- Update `CLIENT_URL` to match your frontend domain
- For development, you can use `http://localhost:3000`

### API Endpoints
All API endpoints will be available at:
```
https://your-vercel-domain.vercel.app/api/*
```

### Health Check
Test your deployment with:
```
https://your-vercel-domain.vercel.app/api/health
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your `MONGO_URI` environment variable
   - Ensure your MongoDB cluster allows connections from Vercel's IP ranges

2. **CORS Errors**
   - Verify your `CLIENT_URL` environment variable
   - Check that your frontend is making requests to the correct API URL

3. **Session Issues**
   - Ensure `SESSION_SECRET` is set and secure
   - Check that MongoDB is accessible for session storage

### Logs
View deployment logs in your Vercel dashboard under the "Functions" tab.

## Production Considerations

1. **Security**
   - Use strong session secrets
   - Enable HTTPS (automatic with Vercel)
   - Consider rate limiting for API endpoints

2. **Performance**
   - Vercel automatically scales your serverless functions
   - Database connection pooling is handled automatically

3. **Monitoring**
   - Use Vercel's built-in analytics
   - Monitor function execution times and errors 