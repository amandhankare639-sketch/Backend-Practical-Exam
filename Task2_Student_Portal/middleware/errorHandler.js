// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: err.details && err.details.length > 0 ? err.details[0].message : 'Validation Error'
    });
  }

  // Handle MongoDB duplicate key error (E11000 duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    return res.status(statusCode).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Handle Mongoose schema validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(statusCode).json({
      success: false,
      message: 'Validation Error',
      errors: errors
    });
  }

  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: `Invalid ID format: ${err.value}`
    });
  }

  // Handle JWT verification errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    return res.status(statusCode).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }

  // Return clean JSON error without exposing stack traces
  return res.status(statusCode).json({
    success: false,
    message: message
  });
};

module.exports = errorHandler;
