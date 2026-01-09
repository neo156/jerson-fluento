# Deploying MoveWell Server to Render

This guide will help you deploy the MoveWell server to Render.

## Prerequisites

1. A Render account (sign up at [render.com](https://render.com))
2. MongoDB Atlas cluster (already configured)
3. Git repository (optional, but recommended)

## Step 1: Prepare Your Repository

Make sure your `server` folder is ready for deployment:
- ✅ `package.json` exists with start script
- ✅ `server.js` is the entry point
- ✅ All dependencies are listed in `package.json`

## Step 2: Deploy to Render

### Option A: Deploy via Render Dashboard

1. **Log in to Render**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Sign in or create an account

2. **Create a New Web Service**
   - Click "New +" button
   - Select "Web Service"

3. **Connect Your Repository**
   - Connect your GitHub/GitLab repository
   - Or use "Public Git repository" and paste your repo URL
   - Select the repository containing your server

4. **Configure the Service**
   - **Name**: `movewell-server` (or any name you prefer)
   - **Root Directory**: `server` (important: set this to the server folder)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose Free (or paid plan for better performance)

5. **Set Environment Variables**
   Click "Advanced" and add these environment variables:
   
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://ninoespe01_db_user:ninoespe01_db_user@cluster0.xvhzspp.mongodb.net/?appName=Cluster0
   JWT_SECRET=your_very_strong_secret_key_here_change_this
   ```
   
   **Important**: 
   - Replace `your_very_strong_secret_key_here_change_this` with a strong, random secret key
   - You can generate one using: `openssl rand -base64 32`
   - Render will automatically set `PORT`, but you can set it to `10000` explicitly

6. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your server
   - Wait for the deployment to complete (usually 2-5 minutes)

### Option B: Deploy using render.yaml (Recommended)

1. **Push render.yaml to your repository**
   - The `render.yaml` file is already in the server directory
   - Commit and push it to your repository

2. **Import in Render**
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will detect the `render.yaml` file
   - Review the configuration and click "Apply"

3. **Set Environment Variables**
   - After the service is created, go to Environment tab
   - Add the environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A strong secret key (generate with `openssl rand -base64 32`)

## Step 3: Verify Deployment

1. **Check the Logs**
   - Go to your service in Render dashboard
   - Click on "Logs" tab
   - You should see: "Connected to MongoDB" and "Server is running on port 10000"

2. **Test the Health Endpoint**
   - Your service URL will be: `https://movewell-server.onrender.com` (or your custom name)
   - Visit: `https://your-service-name.onrender.com/health`
   - You should see: `{"status":"ok","message":"Server is running"}`

## Step 4: Update Your App Configuration

Update your app's `config.js` file to use the Render URL:

```javascript
const API_BASE_URL = __DEV__ 
  ? LOCAL_SERVER_URL
  : 'https://your-service-name.onrender.com';  // Your Render URL
```

## Important Notes

### Free Tier Limitations
- **Spinning Down**: Free services spin down after 15 minutes of inactivity
- **Cold Start**: First request after spin-down may take 30-60 seconds
- **Monthly Limits**: 750 hours/month (enough for always-on if you're the only user)

### Production Recommendations
1. **Upgrade to Paid Plan**: For production apps, consider a paid plan ($7/month) for:
   - Always-on service (no spin-down)
   - Faster response times
   - Better performance

2. **Custom Domain**: You can add a custom domain in Render settings

3. **Environment Variables**: Never commit `.env` files. Always use Render's environment variables.

4. **JWT Secret**: Use a strong, random secret key in production:
   ```bash
   openssl rand -base64 32
   ```

## Troubleshooting

### Build Fails
- Check that `package.json` has all dependencies
- Verify Node.js version compatibility
- Check build logs in Render dashboard

### Service Won't Start
- Check logs for error messages
- Verify all environment variables are set
- Ensure MongoDB URI is correct and accessible
- Check that PORT is set correctly

### Connection Timeouts
- Free tier services spin down after inactivity
- First request may be slow (cold start)
- Consider upgrading to paid plan for always-on

### MongoDB Connection Issues
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check that your MongoDB user has proper permissions
- Verify the connection string is correct

## Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor CPU, memory, and response times
- **Alerts**: Set up alerts for service downtime

## Support

- Render Documentation: [render.com/docs](https://render.com/docs)
- Render Support: Available in dashboard

