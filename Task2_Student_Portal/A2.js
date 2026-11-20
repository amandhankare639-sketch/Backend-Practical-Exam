/**
 * ============================================================================
 * Task 2: Student Portal with Login and Protected Routes (Single-File Demo)
 * File: A2.js
 *
 * Description:
 * A self-contained, single-file implementation of the Student Portal API.
 * Demonstrates:
 * - Security middlewares: Helmet, CORS, and Express-Rate-Limit
 * - Joi validation for user input
 * - Password hashing with bcryptjs
 * - JWT token generation & verification (1-hour expiration)
 * - Role-based authorization (student vs. admin)
 * - Protected routes (/profile, /students)
 * - Centralized error handling & request logging
 * - MongoDB connection (student_portal) and server startup
 * ============================================================================
 */

// 1. Load Environment Variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Initialize Express Application
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// ----------------------------------------------------------------------------
// 2. Security & Utility Middlewares
// ----------------------------------------------------------------------------

// Helmet adds secure HTTP response headers
app.use(helmet());

// CORS enables cross-origin resource sharing
app.use(cors());

// Rate Limiter: max 100 requests per 15 minutes
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

// Parse JSON request bodies
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl || req.url}`);
  next();
});

// ----------------------------------------------------------------------------
// 3. User Schema & Mongoose Model
// ----------------------------------------------------------------------------
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin'],
        message: '{VALUE} is not a valid role. Allowed roles: student, admin'
      },
      default: 'student'
    }
  },
  {
    timestamps: true
  }
);

// Never expose password hash in API JSON outputs
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User_A2', userSchema);

// ----------------------------------------------------------------------------
// 4. Joi Validation Schemas
// ----------------------------------------------------------------------------
const registerValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('student', 'admin').default('student').messages({
    'any.only': 'Role must be either student or admin'
  })
});

const loginValidationSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

// ----------------------------------------------------------------------------
// 5. Authentication & Authorization Middlewares
// ----------------------------------------------------------------------------

// Authentication Middleware: Verifies Bearer JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format. Expected format: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // payload contains { id, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

// Admin Authorization Middleware: Allows only users with role === 'admin'
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Admin role required.'
    });
  }
  next();
};

// ----------------------------------------------------------------------------
// 6. Application Routes
// ----------------------------------------------------------------------------

// Health Check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Student Portal API (A2 Demo) is running' });
});

// POST /register - Register student or admin
app.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const normalizedEmail = value.email.toLowerCase();

    // Reject duplicate emails
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(value.password, salt);

    const user = new User({
      name: value.name,
      email: normalizedEmail,
      password: hashedPassword,
      role: value.role || 'student'
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /login - Authenticate credentials and return JWT
app.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const normalizedEmail = value.email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT with exactly 1-hour expiration
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /profile - Protected route for any authenticated user
app.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /students - Protected route accessible only to admins
app.get('/students', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');

    return res.status(200).json({
      success: true,
      count: students.length,
      students: students.map((s) => ({
        id: s._id,
        name: s.name,
        email: s.email,
        role: s.role,
        createdAt: s.createdAt
      }))
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 7. Centralized Error Handling Middleware
// ----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.isJoi) {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: err.details && err.details.length > 0 ? err.details[0].message : 'Validation Error'
    });
  }

  if (err.code === 11000) {
    statusCode = 409;
    return res.status(statusCode).json({
      success: false,
      message: 'Email already registered'
    });
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(statusCode).json({
      success: false,
      message: 'Validation Error',
      errors: errors
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: message
  });
});

// ----------------------------------------------------------------------------
// 8. Database Connection & Server Initialization
// ----------------------------------------------------------------------------
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
