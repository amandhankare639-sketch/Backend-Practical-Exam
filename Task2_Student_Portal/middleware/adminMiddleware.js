// Middleware to restrict access to admin users only
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Admin role required.'
    });
  }
  next();
};

module.exports = adminMiddleware;
