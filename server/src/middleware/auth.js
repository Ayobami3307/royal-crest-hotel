import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncHandler } from './error.js';

export const signToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

/** Requires a valid Bearer token and attaches the user to req.user. */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Authentication required.');

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.sub).select('-passwordHash');
  if (!user || !user.isActive) throw new ApiError(401, 'Account not found or disabled.');
  req.user = user;
  next();
});

/** Role gate, used after `protect`. */
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to do that.'));
    }
    next();
  };
