import mongoose from 'mongoose';

export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** A room category (Standard, Deluxe, Executive Suite, Presidential Suite...). */
const roomTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, maxlength: 80 },
    slug: { type: String, unique: true, index: true },
    shortDescription: { type: String, trim: true, maxlength: 220, default: '' },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 2000 },
    pricePerNight: { type: Number, required: [true, 'Price per night is required'], min: [1, 'Price must be above zero'] },
    bedType: { type: String, required: [true, 'Bed type is required'], trim: true },
    maxGuests: { type: Number, required: true, min: 1, max: 12 },
    sizeSqm: { type: Number, min: 10, default: 30 },
    view: { type: String, trim: true, default: '' },
    facilities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

roomTypeSchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

export default mongoose.model('RoomType', roomTypeSchema);
