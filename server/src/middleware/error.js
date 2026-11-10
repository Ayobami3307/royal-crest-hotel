export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Express 4 does not catch rejected promises, so wrap async handlers. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    message = 'Please check the highlighted fields.';
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier supplied.';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message = field ? `A record with that ${field} already exists.` : 'That record already exists.';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Your session has expired. Please sign in again.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body.';
  }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Something went wrong on our side. Please try again.';
  }

  res.status(status).json({ message, details });
}
