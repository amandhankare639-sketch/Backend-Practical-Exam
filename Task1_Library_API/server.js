// 1. Load environment variables using dotenv
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

// Import modular routes and middlewares
const bookRoutes = require('./routes/bookRoutes');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// 3. Enable express.json()
app.use(express.json());

// 4. Register the logger middleware
app.use(logger);

// 5. Register book routes
app.use('/books', bookRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'College Library Book Management API is running'
  });
});

// 6. Register error-handling middleware
app.use(errorHandler);

// 2. Connect to MongoDB using Mongoose
// 7. Start the server on port 3000 only after a successful database connection
if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
