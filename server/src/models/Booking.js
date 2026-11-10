import mongoose from 'mongoose';
import { randomInt } from 'node:crypto';

export const ACTIVE_STATUSES = ['pending', 'confirmed', 'checked_in'];
export const REVENUE_STATUSES = ['confirmed', 'checked_in', 'checked_out'];
export const ALL_STATUSES = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

// Unambiguous characters only (no 0/O, 1/I)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const makeReference = () =>
  'RC-' + Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true, index: true },
    roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true, index: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    guest: {
      firstName: { type: String, required: [true, 'First name is required'], trim: true, maxlength: 60 },
      lastName: { type: String, required: [true, 'Last name is required'], trim: true, maxlength: 60 },
      email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
        index: true,
      },
      phone: { type: String, required: [true, 'Phone number is required'], trim: true, maxlength: 30 },
      country: { type: String, trim: true, maxlength: 60, default: '' },
    },
    guests: { type: Number, required: true, min: 1 },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    specialRequests: { type: String, trim: true, maxlength: 500, default: '' },
    pricing: {
      pricePerNight: Number,
      nights: Number,
      subtotal: Number,
      serviceCharge: Number,
      vat: Number,
      total: Number,
    },
    status: { type: String, enum: ALL_STATUSES, default: 'confirmed', index: true },
    cancelledAt: Date,
  },
  { timestamps: true }
);

// Fast overlap look-ups when checking whether a room is free.
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });

bookingSchema.pre('validate', function setReference(next) {
  if (!this.reference) this.reference = makeReference();
  next();
});

export default mongoose.model('Booking', bookingSchema);
