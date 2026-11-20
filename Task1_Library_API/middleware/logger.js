// Logger Middleware to log HTTP request method and URL
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl || req.url}`);
  next();
};

module.exports = logger;
