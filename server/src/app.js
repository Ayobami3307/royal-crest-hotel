import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import { errorHandler, notFound } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
          frameSrc: ['https://www.google.com'],
          connectSrc: ["'self'"],
        },
      },
    })
  );

  const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin / server-to-server requests (no Origin header) and the configured clients.
        if (!origin || origins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} is not allowed by CORS`));
      },
    })
  );

  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.use(
    '/api',
    rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false })
  );

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
  app.use('/api/auth', authRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', publicRoutes);
  app.use('/api', notFound);

  // In production the API can also serve the built React app (single deployment).
  const dist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist, { maxAge: '7d', index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
