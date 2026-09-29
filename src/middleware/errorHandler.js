function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
}

module.exports = errorHandler;
