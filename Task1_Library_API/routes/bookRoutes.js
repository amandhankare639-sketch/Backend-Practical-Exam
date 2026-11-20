const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');

const router = express.Router();

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. POST /books - Add a new book
router.post('/', async (req, res, next) => {
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

// 2. GET /books - Retrieve all books
router.get('/', async (req, res, next) => {
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

// 3. GET /books/:id - Retrieve a single book using its MongoDB ID
router.get('/:id', async (req, res, next) => {
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

// 4. PUT /books/:id - Update an existing book
router.put('/:id', async (req, res, next) => {
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

// 5. DELETE /books/:id - Delete a book using its ID
router.delete('/:id', async (req, res, next) => {
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

module.exports = router;
