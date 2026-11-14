import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'node:dns';
import { connectDB } from './config/db.js';
import User from './models/User.js';

dns.setServers(['1.1.1.1', '1.0.0.1']);

async function createAdmin() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error('ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set.');
  }

  await connectDB();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.log('An account with this email already exists.');
    console.log(`Role: ${existingUser.role}`);
    console.log(`Active: ${existingUser.isActive}`);
    return;
  }

  const passwordHash = await User.hashPassword(password);

  await User.create({
    name,
    email,
    passwordHash,
    role: 'admin',
    isActive: true,
  });

  console.log(`Admin account created successfully for ${email}`);
}

createAdmin()
  .catch((error) => {
    console.error('Admin creation failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });