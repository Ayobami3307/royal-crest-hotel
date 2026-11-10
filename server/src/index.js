import 'dotenv/config';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;

function assertConfig() {
  const secret = process.env.JWT_SECRET || '';
  if (!secret) throw new Error('JWT_SECRET is not set. Copy server/.env.example to server/.env first.');
  if (process.env.NODE_ENV === 'production' && (secret.length < 32 || secret.startsWith('replace-me'))) {
    throw new Error('Set JWT_SECRET to a long random value before running in production.');
  }
}

async function start() {
  assertConfig();
  await connectDB();
  const server = createApp().listen(PORT, () => console.log(`Royal Crest API listening on http://localhost:${PORT}`));

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  console.error(`Startup failed: ${err.message}`);
  process.exit(1);
});
