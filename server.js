const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/translate', require('./routes/translate'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://ninoespe01_db_user:ninoespe01_db_user@cluster0.xvhzspp.mongodb.net/?appName=Cluster0';

if (!mongoURI) {
  console.error('Error: MONGODB_URI is not defined. Please create a .env file with MONGODB_URI.');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';

// Make JWT_SECRET available globally
process.env.JWT_SECRET = JWT_SECRET;

// Listen on all network interfaces (required for Render)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

