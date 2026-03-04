function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status);
  res.json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

module.exports = { notFound, errorHandler };
