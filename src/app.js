const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const connectDB = require('./config/db');

// Connect to database
connectDB();

const passport = require('passport');
require('./config/passport'); // Load Passport Strategies

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(passport.initialize());

// Basic Route for healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'DevBrand AI Backend is running' });
});

// Use routes
const routes = require('./routes/index');
app.use('/api/v1', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
