// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
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

  // Avoid exposing internal stack traces in API responses
  return res.status(statusCode).json({
    success: false,
    message: message
  });
};

module.exports = errorHandler;
