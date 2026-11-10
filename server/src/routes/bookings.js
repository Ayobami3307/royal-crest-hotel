import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Booking, { ACTIVE_STATUSES } from '../models/Booking.js';
import RoomType from '../models/RoomType.js';
import { ApiError, asyncHandler } from '../middleware/error.js';
import { findFreeRoom } from '../utils/availability.js';
import { calculateTotal, todayInZone, validateStay } from '../utils/pricing.js';
import { EMAIL_RE, assertValid, str } from '../utils/validate.js';

const router = Router();
const tz = () => process.env.HOTEL_TIMEZONE || 'Africa/Lagos';

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many booking attempts. Please try again later or call us to reserve.' },
});

/** Shape returned to guests: no internal ids beyond the reference. */
const publicBooking = (b, roomTypeName) => ({
  reference: b.reference,
  status: b.status,
  roomType: roomTypeName ?? b.roomType?.name,
  guest: b.guest,
  guests: b.guests,
  checkIn: b.checkIn,
  checkOut: b.checkOut,
  nights: b.nights,
  specialRequests: b.specialRequests,
  pricing: b.pricing,
  createdAt: b.createdAt,
});

router.post(
  '/',
  createLimiter,
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const guest = {
      firstName: str(body.firstName, 60),
      lastName: str(body.lastName, 60),
      email: str(body.email, 120).toLowerCase(),
      phone: str(body.phone, 30),
      country: str(body.country, 60),
    };
    const guests = Number.parseInt(body.guests, 10);

    assertValid({
      firstName: !guest.firstName && 'Please enter your first name.',
      lastName: !guest.lastName && 'Please enter your last name.',
      email: !EMAIL_RE.test(guest.email) && 'Please enter a valid email address.',
      phone: !/^[+\d][\d\s().-]{6,}$/.test(guest.phone) && 'Please enter a valid phone number.',
      guests: !(guests >= 1 && guests <= 12) && 'Please choose the number of guests.',
      roomTypeId: !body.roomTypeId && 'Please choose a room.',
    });

    const stay = validateStay({ checkIn: body.checkIn, checkOut: body.checkOut }, { today: todayInZone(tz()) });
    if (!stay.ok) throw new ApiError(400, stay.error);

    const type = await RoomType.findOne({ _id: body.roomTypeId, isActive: true });
    if (!type) throw new ApiError(404, 'That room category is no longer available.');
    if (guests > type.maxGuests) {
      throw new ApiError(400, `${type.name} sleeps up to ${type.maxGuests} guests. Please choose a larger room.`);
    }

    // Prices are always calculated on the server, never trusted from the browser.
    const pricing = calculateTotal({ pricePerNight: type.pricePerNight, nights: stay.nights });
    const status = process.env.AUTO_CONFIRM_BOOKINGS === 'false' ? 'pending' : 'confirmed';

    // Assign a physical room. If two guests grab the same room at the same moment, the booking with the
    // higher _id backs off and the next free room is tried, so a room is never double-sold.
    const tried = [];
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const room = await findFreeRoom(type._id, stay.checkIn, stay.checkOut, { exclude: tried });
      if (!room) {
        throw new ApiError(409, `Sorry, ${type.name} has just sold out for those dates. Please choose another room or dates.`);
      }

      const booking = await Booking.create({
        roomType: type._id,
        room: room._id,
        guest,
        guests,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        nights: stay.nights,
        specialRequests: str(body.specialRequests, 500),
        pricing,
        status,
      });

      const clash = await Booking.exists({
        _id: { $lt: booking._id },
        room: room._id,
        status: { $in: ACTIVE_STATUSES },
        checkIn: { $lt: stay.checkOut },
        checkOut: { $gt: stay.checkIn },
      });

      if (!clash) return res.status(201).json({ booking: publicBooking(booking, type.name) });

      await Booking.deleteOne({ _id: booking._id });
      tried.push(room._id);
    }

    throw new ApiError(409, 'We could not secure that room. Please try again.');
  })
);

// Guests can retrieve a booking with reference + email
router.get(
  '/lookup',
  asyncHandler(async (req, res) => {
    const reference = str(req.query.reference, 20).toUpperCase();
    const email = str(req.query.email, 120).toLowerCase();
    if (!reference || !EMAIL_RE.test(email)) throw new ApiError(400, 'Enter your booking reference and email address.');

    const booking = await Booking.findOne({ reference, 'guest.email': email }).populate('roomType', 'name');
    if (!booking) throw new ApiError(404, 'We could not find a booking matching those details.');
    res.json({ booking: publicBooking(booking) });
  })
);

// Guests can cancel an upcoming booking with reference + email
router.post(
  '/cancel',
  asyncHandler(async (req, res) => {
    const reference = str(req.body.reference, 20).toUpperCase();
    const email = str(req.body.email, 120).toLowerCase();
    const booking = await Booking.findOne({ reference, 'guest.email': email }).populate('roomType', 'name');
    if (!booking) throw new ApiError(404, 'We could not find a booking matching those details.');
    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw new ApiError(400, 'This booking can no longer be cancelled online. Please call the front desk.');
    }
    if (booking.checkIn < todayInZone(tz())) throw new ApiError(400, 'This stay has already started.');

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();
    res.json({ booking: publicBooking(booking) });
  })
);

export default router;
