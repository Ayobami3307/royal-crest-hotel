import { Router } from 'express';
import RoomType from '../models/RoomType.js';
import ContactMessage from '../models/ContactMessage.js';
import { ApiError, asyncHandler } from '../middleware/error.js';
import { getAvailability } from '../utils/availability.js';
import { validateStay, todayInZone } from '../utils/pricing.js';
import { EMAIL_RE, assertValid, str } from '../utils/validate.js';

const router = Router();
const tz = () => process.env.HOTEL_TIMEZONE || 'Africa/Lagos';

// Room categories (public catalogue)
router.get(
  '/room-types',
  asyncHandler(async (req, res) => {
    const filter = { isActive: true };
    if (req.query.featured === 'true') filter.featured = true;
    const types = await RoomType.find(filter).sort({ order: 1, pricePerNight: 1 }).lean();
    res.json({ roomTypes: types });
  })
);

router.get(
  '/room-types/:slug',
  asyncHandler(async (req, res) => {
    const type = await RoomType.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!type) throw new ApiError(404, 'We could not find that room.');
    res.json({ roomType: type });
  })
);

// Live availability + server-calculated pricing for a stay
router.get(
  '/availability',
  asyncHandler(async (req, res) => {
    const stay = validateStay(
      { checkIn: req.query.checkIn, checkOut: req.query.checkOut },
      { today: todayInZone(tz()) }
    );
    if (!stay.ok) throw new ApiError(400, stay.error);

    const guests = Number.parseInt(req.query.guests, 10) || 1;
    if (guests < 1 || guests > 12) throw new ApiError(400, 'Number of guests must be between 1 and 12.');

    const rooms = await getAvailability({ checkIn: stay.checkIn, checkOut: stay.checkOut, guests });
    res.json({ nights: stay.nights, guests, rooms });
  })
);

// Contact form
router.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const data = {
      name: str(req.body.name, 80),
      email: str(req.body.email, 120).toLowerCase(),
      phone: str(req.body.phone, 30),
      subject: str(req.body.subject, 120) || 'General enquiry',
      message: str(req.body.message, 2000),
    };
    assertValid({
      name: !data.name && 'Please enter your name.',
      email: !EMAIL_RE.test(data.email) && 'Please enter a valid email address.',
      message: data.message.length < 10 && 'Please write a message of at least 10 characters.',
    });
    await ContactMessage.create(data);
    res.status(201).json({ message: 'Thank you. Our guest relations team will reply within one working day.' });
  })
);

export default router;
