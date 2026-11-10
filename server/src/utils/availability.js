import Room from '../models/Room.js';
import RoomType from '../models/RoomType.js';
import Booking, { ACTIVE_STATUSES } from '../models/Booking.js';
import { calculateTotal, nightsBetween } from './pricing.js';

/**
 * Availability for every active category across a stay.
 * A room is free if it is sellable (status "available") and has no active booking
 * overlapping [checkIn, checkOut). Same-day turnover is allowed.
 */
export async function getAvailability({ checkIn, checkOut, guests = 1 }) {
  const [types, rooms, bookings] = await Promise.all([
    RoomType.find({ isActive: true }).sort({ order: 1, pricePerNight: 1 }).lean(),
    Room.find({ status: 'available' }).select('_id roomType').lean(),
    Booking.find({
      status: { $in: ACTIVE_STATUSES },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    })
      .select('room')
      .lean(),
  ]);

  const busy = new Set(bookings.map((b) => String(b.room)));
  const nights = nightsBetween(checkIn, checkOut);

  return types.map((type) => {
    const free = rooms.filter((r) => String(r.roomType) === String(type._id) && !busy.has(String(r._id))).length;
    const fitsGuests = guests <= type.maxGuests;
    return {
      ...type,
      available: free,
      fitsGuests,
      bookable: free > 0 && fitsGuests,
      pricing: calculateTotal({ pricePerNight: type.pricePerNight, nights }),
    };
  });
}

/** First free physical room of a category for a stay, or null. */
export async function findFreeRoom(roomTypeId, checkIn, checkOut, { exclude = [] } = {}) {
  const rooms = await Room.find({ roomType: roomTypeId, status: 'available', _id: { $nin: exclude } })
    .sort({ number: 1 })
    .lean();
  if (!rooms.length) return null;

  const busy = await Booking.find({
    room: { $in: rooms.map((r) => r._id) },
    status: { $in: ACTIVE_STATUSES },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  })
    .select('room')
    .lean();

  const busySet = new Set(busy.map((b) => String(b.room)));
  return rooms.find((r) => !busySet.has(String(r._id))) || null;
}

/** Is this specific room free for the stay (ignoring one booking, used when re-assigning)? */
export async function isRoomFree(roomId, checkIn, checkOut, ignoreBookingId) {
  const clash = await Booking.exists({
    room: roomId,
    status: { $in: ACTIVE_STATUSES },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    ...(ignoreBookingId ? { _id: { $ne: ignoreBookingId } } : {}),
  });
  return !clash;
}
