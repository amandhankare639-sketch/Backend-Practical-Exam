const mongoose = require('mongoose');

// Define Mongoose Schema for Library Book
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

// Create and export Mongoose Model
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
