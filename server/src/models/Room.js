import mongoose from 'mongoose';

/** A physical room that can be assigned to a booking. */
const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: [true, 'Room number is required'], unique: true, trim: true },
    floor: { type: Number, default: 1, min: 0, max: 60 },
    roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: [true, 'Room category is required'], index: true },
    // "available" rooms can be sold. The other states take the room out of inventory.
    status: { type: String, enum: ['available', 'maintenance', 'out_of_service'], default: 'available' },
    notes: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Room', roomSchema);
