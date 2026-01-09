# MoveWell Server

Backend server for the MoveWell React Native application.

## Quick Deploy to Render

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Set Root Directory to `server`
4. Add environment variables (MONGODB_URI, JWT_SECRET)
5. Deploy!

## Local Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file in the `server` directory with the following content:
```
PORT=4000
MONGODB_URI=mongodb+srv://ninoespe01_db_user:ninoespe01_db_user@cluster0.xvhzspp.mongodb.net/?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important**: Replace `your_super_secret_jwt_key_change_this_in_production` with a strong, random secret key for production use.

3. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on port 4000 by default.

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Progress Tracking
- `POST /api/progress/workout` - Record a workout
- `POST /api/progress/habit` - Record a habit
- `POST /api/progress/stretch` - Record a stretch
- `POST /api/progress/steps` - Add steps
- `POST /api/progress/language-activity` - Record language learning activity
- `GET /api/progress/stats` - Get user statistics
- `GET /api/progress/today` - Get today's progress
- `GET /api/progress/range` - Get progress for a date range

### Translation
- `POST /api/translate` - Translate text
- `GET /api/translate/languages` - Get available languages

All endpoints except `/health` and `/api/auth/*` require authentication via Bearer token in the Authorization header.

## Environment Variables

- `PORT` - Server port (default: 4000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

