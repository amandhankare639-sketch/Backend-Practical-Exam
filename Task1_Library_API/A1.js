/**
 * ============================================================================
 * Task 1: College Library Book Management System API (Single-File Demonstration)
 * File: A1.js
 *
 * Description:
 * A self-contained, single-file implementation of the Library Book Management API.
 * Demonstrates Mongoose Schema validation, Express routing, Custom Logger
 * Middleware, Centralized Error Handling, and MongoDB connection.
 * ============================================================================
 */

// 1. Load Environment Variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

// Initialize Express Application
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ----------------------------------------------------------------------------
// 2. Mongoose Book Model & Schema Definition
// ----------------------------------------------------------------------------
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be at least 1']
  },
  category: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const Book = mongoose.model('Book', bookSchema);

// ----------------------------------------------------------------------------
// 3. Middlewares
// ----------------------------------------------------------------------------

// Built-in Middleware for parsing JSON request bodies
app.use(express.json());

// Logger Middleware: Logs the HTTP request method and requested URL
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl || req.url}`);
  next();
});

// Helper function to check MongoDB ObjectId validity
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ----------------------------------------------------------------------------
// 4. CRUD API Endpoints
// ----------------------------------------------------------------------------

// POST /books - Add a new book
app.post('/books', async (req, res, next) => {
  try {
    const { title, author, price, category, isAvailable } = req.body;

    const book = new Book({
      title,
      author,
      price,
      category,
      isAvailable
    });

    const savedBook = await book.save();

    return res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: savedBook
    });
  } catch (error) {
    next(error);
  }
});

// GET /books - Retrieve all books
app.get('/books', async (req, res, next) => {
  try {
    const books = await Book.find();

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    next(error);
  }
});

// GET /books/:id - Retrieve a single book using its MongoDB ID
app.get('/books/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MongoDB ID format'
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
});

// PUT /books/:id - Update an existing book
app.put('/books/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MongoDB ID format'
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /books/:id - Delete a book using its ID
app.delete('/books/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MongoDB ID format'
      });
    }

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: deletedBook
    });
  } catch (error) {
    next(error);
  }
});

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'College Library Book Management API (A1 Single-File Demo) is running' });
});

// ----------------------------------------------------------------------------
// 5. Centralized Error Handling Middleware
// ----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Schema Validation Errors (e.g., missing required fields, price < 1)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(statusCode).json({
      success: false,
      message: 'Validation Error',
      errors: errors
    });
  }

  // Handle Mongoose Invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: `Invalid MongoDB ID format: ${err.value}`
    });
  }

  // Avoid exposing internal stack traces
  return res.status(statusCode).json({
    success: false,
    message: message
  });
});

// ----------------------------------------------------------------------------
// 6. Database Connection & Server Initialization
// ----------------------------------------------------------------------------
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
