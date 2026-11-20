// 1. Load environment variables using dotenv
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import modular routes and middlewares
const authRoutes = require('./routes/authRoutes');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// 2. Configure Security Middlewares
app.use(helmet());
app.use(cors());

// Configure Rate Limiting: 100 requests per 15-minute window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use(limiter);

// 3. Configure Express JSON Body Parser
app.use(express.json());

// 4. Register Logger Middleware
app.use(logger);

// 5. Register Authentication & Protected Routes
app.use('/', authRoutes);

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Student Portal API with Login and Protected Routes is running'
  });
});

// 6. Register Centralized Error Handling Middleware
app.use(errorHandler);

// 7. Connect to MongoDB and start server only after successful connection
if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB (student_portal)');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
