import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../middleware/error.js';
import { protect, signToken } from '../middleware/auth.js';
import { EMAIL_RE, str } from '../utils/validate.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Please try again in 15 minutes.' },
});

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const email = str(req.body.email, 120).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!EMAIL_RE.test(email) || !password) throw new ApiError(400, 'Please enter your email and password.');

    const user = await User.findOne({ email });
    // Same message for unknown email and wrong password, so accounts cannot be enumerated.
    if (!user || !user.isActive || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Incorrect email or password.');
    }

    user.lastLoginAt = new Date();
    await user.save();
    res.json({ token: signToken(user), user: user.toSafeJSON() });
  })
);

router.get('/me', protect, (req, res) => res.json({ user: req.user.toSafeJSON() }));

export default router;
