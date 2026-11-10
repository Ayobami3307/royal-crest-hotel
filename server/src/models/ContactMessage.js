import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    subject: { type: String, trim: true, maxlength: 120, default: 'General enquiry' },
    message: { type: String, required: [true, 'Message is required'], trim: true, minlength: 10, maxlength: 2000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
