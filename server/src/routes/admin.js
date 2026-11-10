import { Router } from 'express';
import Booking, { ACTIVE_STATUSES, ALL_STATUSES, REVENUE_STATUSES } from '../models/Booking.js';
import Room from '../models/Room.js';
import RoomType from '../models/RoomType.js';
import ContactMessage from '../models/ContactMessage.js';
import { protect, requireRole } from '../middleware/auth.js';
import { ApiError, asyncHandler } from '../middleware/error.js';
import { isRoomFree } from '../utils/availability.js';
import { addDays, parseDate, toISODate, todayInZone } from '../utils/pricing.js';
import { escapeRegex, str, toList } from '../utils/validate.js';

const router = Router();
const tz = () => process.env.HOTEL_TIMEZONE || 'Africa/Lagos';
const adminOnly = requireRole('admin');

// Everything below requires a signed-in staff member.
router.use(protect, requireRole('admin', 'manager'));

/* ------------------------------------------------------------------ Stats */

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const today = todayInZone(tz());
    const weekAhead = addDays(today, 8);
    const firstMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 5, 1));

    const [statusAgg, monthlyAgg, typeAgg, totalRooms, occupiedRooms, arrivals, departures, recent, unreadMessages, totals] =
      await Promise.all([
        Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Booking.aggregate([
          { $match: { status: { $in: REVENUE_STATUSES }, checkIn: { $gte: firstMonth } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$checkIn' } },
              revenue: { $sum: '$pricing.total' },
              bookings: { $sum: 1 },
            },
          },
        ]),
        Booking.aggregate([
          { $match: { status: { $in: REVENUE_STATUSES } } },
          { $group: { _id: '$roomType', revenue: { $sum: '$pricing.total' }, bookings: { $sum: 1 }, nights: { $sum: '$nights' } } },
          { $lookup: { from: 'roomtypes', localField: '_id', foreignField: '_id', as: 'type' } },
          { $unwind: '$type' },
          { $project: { _id: 0, name: '$type.name', revenue: 1, bookings: 1, nights: 1 } },
          { $sort: { revenue: -1 } },
        ]),
        Room.countDocuments({ status: { $ne: 'out_of_service' } }),
        Booking.distinct('room', { status: { $in: ACTIVE_STATUSES }, checkIn: { $lte: today }, checkOut: { $gt: today } }),
        Booking.find({ status: { $in: ['pending', 'confirmed'] }, checkIn: { $gte: today, $lt: weekAhead } })
          .sort({ checkIn: 1 })
          .limit(8)
          .populate('roomType', 'name')
          .populate('room', 'number')
          .lean(),
        Booking.find({ status: { $in: ['checked_in', 'confirmed'] }, checkOut: today })
          .populate('roomType', 'name')
          .populate('room', 'number')
          .lean(),
        Booking.find().sort({ createdAt: -1 }).limit(6).populate('roomType', 'name').lean(),
        ContactMessage.countDocuments({ isRead: false }),
        Booking.aggregate([
          { $match: { status: { $in: REVENUE_STATUSES } } },
          { $group: { _id: null, revenue: { $sum: '$pricing.total' }, nights: { $sum: '$nights' } } },
        ]),
      ]);

    const byStatus = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0]));
    statusAgg.forEach((s) => {
      byStatus[s._id] = s.count;
    });

    const monthMap = new Map(monthlyAgg.map((m) => [m._id, m]));
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + i, 1));
      const key = d.toISOString().slice(0, 7);
      return { month: key, revenue: monthMap.get(key)?.revenue || 0, bookings: monthMap.get(key)?.bookings || 0 };
    });

    res.json({
      totals: {
        bookings: Object.values(byStatus).reduce((a, b) => a + b, 0),
        revenue: totals[0]?.revenue || 0,
        nightsSold: totals[0]?.nights || 0,
        totalRooms,
        occupiedToday: occupiedRooms.length,
        occupancyRate: totalRooms ? Math.round((occupiedRooms.length / totalRooms) * 100) : 0,
        unreadMessages,
      },
      byStatus,
      monthly,
      byRoomType: typeAgg,
      arrivals,
      departures,
      recent,
    });
  })
);

/* --------------------------------------------------------------- Bookings */

router.get(
  '/bookings',
  asyncHandler(async (req, res) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 100);
    const filter = {};

    if (ALL_STATUSES.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(str(req.query.q, 60)), 'i');
      filter.$or = [{ reference: rx }, { 'guest.firstName': rx }, { 'guest.lastName': rx }, { 'guest.email': rx }];
    }
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);
    if (from || to) filter.checkIn = { ...(from && { $gte: from }), ...(to && { $lte: to }) };

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('roomType', 'name')
        .populate('room', 'number floor')
        .lean(),
      Booking.countDocuments(filter),
    ]);
    res.json({ bookings, page, pages: Math.max(Math.ceil(total / limit), 1), total });
  })
);

router.get(
  '/bookings/:id',
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('roomType', 'name').populate('room', 'number floor').lean();
    if (!booking) throw new ApiError(404, 'Booking not found.');
    res.json({ booking });
  })
);

// Update status and/or move the booking to another room of the same category.
router.patch(
  '/bookings/:id',
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found.');

    const { status, roomId } = req.body || {};

    if (roomId && String(roomId) !== String(booking.room)) {
      const room = await Room.findById(roomId);
      if (!room) throw new ApiError(404, 'Room not found.');
      if (room.status !== 'available') throw new ApiError(409, `Room ${room.number} is not in service.`);
      if (String(room.roomType) !== String(booking.roomType)) {
        throw new ApiError(400, 'Choose a room from the same category as the booking.');
      }
      if (!(await isRoomFree(room._id, booking.checkIn, booking.checkOut, booking._id))) {
        throw new ApiError(409, `Room ${room.number} is already booked for those dates.`);
      }
      booking.room = room._id;
    }

    if (status && status !== booking.status) {
      if (!ALL_STATUSES.includes(status)) throw new ApiError(400, 'Unknown booking status.');
      const reopening = ACTIVE_STATUSES.includes(status) && !ACTIVE_STATUSES.includes(booking.status);
      if (reopening && !(await isRoomFree(booking.room, booking.checkIn, booking.checkOut, booking._id))) {
        throw new ApiError(409, 'That room has since been booked. Move this booking to another room first.');
      }
      booking.status = status;
      booking.cancelledAt = status === 'cancelled' ? new Date() : undefined;
    }

    await booking.save();
    const fresh = await Booking.findById(booking._id).populate('roomType', 'name').populate('room', 'number floor').lean();
    res.json({ booking: fresh });
  })
);

/* ------------------------------------------------------------- Room types */

const roomTypeFields = (b = {}) => ({
  name: str(b.name, 80),
  shortDescription: str(b.shortDescription, 220),
  description: str(b.description, 2000),
  pricePerNight: Number(b.pricePerNight),
  bedType: str(b.bedType, 60),
  maxGuests: Number.parseInt(b.maxGuests, 10),
  sizeSqm: Number(b.sizeSqm) || 30,
  view: str(b.view, 80),
  facilities: toList(b.facilities),
  images: toList(b.images),
  featured: Boolean(b.featured),
  isActive: b.isActive !== false,
  order: Number(b.order) || 0,
});

router.get(
  '/room-types',
  asyncHandler(async (_req, res) => {
    const [types, counts] = await Promise.all([
      RoomType.find().sort({ order: 1, pricePerNight: 1 }).lean(),
      Room.aggregate([{ $group: { _id: '$roomType', total: { $sum: 1 } } }]),
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.total]));
    res.json({ roomTypes: types.map((t) => ({ ...t, roomCount: countMap.get(String(t._id)) || 0 })) });
  })
);

router.post(
  '/room-types',
  adminOnly,
  asyncHandler(async (req, res) => {
    const roomType = await RoomType.create(roomTypeFields(req.body));
    res.status(201).json({ roomType });
  })
);

router.put(
  '/room-types/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    const roomType = await RoomType.findById(req.params.id);
    if (!roomType) throw new ApiError(404, 'Room category not found.');
    roomType.set(roomTypeFields(req.body)); // slug stays stable so public URLs do not break
    await roomType.save();
    res.json({ roomType });
  })
);

router.patch(
  '/room-types/:id/price',
  adminOnly,
  asyncHandler(async (req, res) => {
    const price = Number(req.body.pricePerNight);
    if (!Number.isFinite(price) || price <= 0) throw new ApiError(400, 'Enter a price above zero.');
    const roomType = await RoomType.findByIdAndUpdate(req.params.id, { pricePerNight: price }, { new: true, runValidators: true });
    if (!roomType) throw new ApiError(404, 'Room category not found.');
    res.json({ roomType });
  })
);

router.delete(
  '/room-types/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    if (await Room.exists({ roomType: req.params.id })) {
      throw new ApiError(409, 'This category still has rooms. Remove or reassign them first, or deactivate the category instead.');
    }
    if (await Booking.exists({ roomType: req.params.id })) {
      throw new ApiError(409, 'This category has booking history. Deactivate it instead of deleting.');
    }
    const removed = await RoomType.findByIdAndDelete(req.params.id);
    if (!removed) throw new ApiError(404, 'Room category not found.');
    res.json({ ok: true });
  })
);

/* ------------------------------------------------------------------ Rooms */

const roomFields = (b = {}) => ({
  number: str(b.number, 20),
  floor: Number.parseInt(b.floor, 10) || 1,
  roomType: b.roomType,
  status: b.status || 'available',
  notes: str(b.notes, 300),
});

const hasFutureBookings = (roomId) =>
  Booking.exists({ room: roomId, status: { $in: ACTIVE_STATUSES }, checkOut: { $gt: todayInZone(tz()) } });

router.get(
  '/rooms',
  asyncHandler(async (_req, res) => {
    const today = todayInZone(tz());
    const [rooms, current] = await Promise.all([
      Room.find().sort({ number: 1 }).populate('roomType', 'name').lean(),
      Booking.find({ status: { $in: ACTIVE_STATUSES }, checkIn: { $lte: today }, checkOut: { $gt: today } })
        .select('room reference guest checkOut status')
        .lean(),
    ]);
    const occupancy = new Map(current.map((b) => [String(b.room), b]));
    res.json({
      rooms: rooms.map((r) => {
        const b = occupancy.get(String(r._id));
        return {
          ...r,
          occupiedToday: Boolean(b),
          currentGuest: b ? `${b.guest.firstName} ${b.guest.lastName}` : null,
          currentReference: b?.reference || null,
          departsOn: b ? toISODate(b.checkOut) : null,
        };
      }),
    });
  })
);

router.post(
  '/rooms',
  adminOnly,
  asyncHandler(async (req, res) => {
    const data = roomFields(req.body);
    if (!(await RoomType.exists({ _id: data.roomType }))) throw new ApiError(400, 'Choose a valid room category.');
    const room = await Room.create(data);
    res.status(201).json({ room });
  })
);

router.put(
  '/rooms/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);
    if (!room) throw new ApiError(404, 'Room not found.');
    const data = roomFields(req.body);
    if (!(await RoomType.exists({ _id: data.roomType }))) throw new ApiError(400, 'Choose a valid room category.');

    const leavingService = data.status !== 'available' && room.status === 'available';
    const changingType = String(data.roomType) !== String(room.roomType);
    if ((leavingService || changingType) && (await hasFutureBookings(room._id))) {
      throw new ApiError(409, 'This room has current or upcoming bookings. Move those bookings to another room first.');
    }
    room.set(data);
    await room.save();
    res.json({ room });
  })
);

router.delete(
  '/rooms/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    if (await hasFutureBookings(req.params.id)) {
      throw new ApiError(409, 'This room has current or upcoming bookings. Move them before deleting the room.');
    }
    if (await Booking.exists({ room: req.params.id })) {
      throw new ApiError(409, 'This room has booking history, so it cannot be deleted. Set it to "out of service" instead.');
    }
    const removed = await Room.findByIdAndDelete(req.params.id);
    if (!removed) throw new ApiError(404, 'Room not found.');
    res.json({ ok: true });
  })
);

/* ----------------------------------------------------------- Availability */

router.get(
  '/availability',
  asyncHandler(async (req, res) => {
    const from = parseDate(req.query.from) || todayInZone(tz());
    const days = Math.min(Math.max(Number.parseInt(req.query.days, 10) || 14, 1), 31);
    const dates = Array.from({ length: days }, (_, i) => addDays(from, i));
    const end = addDays(from, days);

    const [types, rooms, bookings] = await Promise.all([
      RoomType.find().sort({ order: 1, pricePerNight: 1 }).lean(),
      Room.find().select('roomType status').lean(),
      Booking.find({ status: { $in: ACTIVE_STATUSES }, checkIn: { $lt: end }, checkOut: { $gt: from } })
        .select('roomType checkIn checkOut')
        .lean(),
    ]);

    const roomTypes = types.map((t) => {
      const mine = rooms.filter((r) => String(r.roomType) === String(t._id));
      const sellable = mine.filter((r) => r.status === 'available').length;
      const booked = bookings.filter((b) => String(b.roomType) === String(t._id));
      return {
        id: t._id,
        name: t.name,
        totalRooms: mine.length,
        sellable,
        unavailable: mine.length - sellable,
        days: dates.map((d) => {
          const count = booked.filter((b) => b.checkIn <= d && b.checkOut > d).length;
          return { date: toISODate(d), booked: count, available: Math.max(sellable - count, 0) };
        }),
      };
    });

    res.json({ from: toISODate(from), days: dates.map(toISODate), roomTypes });
  })
);

/* -------------------------------------------------------------- Customers */

router.get(
  '/customers',
  asyncHandler(async (req, res) => {
    const match = {};
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(str(req.query.q, 60)), 'i');
      match.$or = [{ 'guest.firstName': rx }, { 'guest.lastName': rx }, { 'guest.email': rx }, { 'guest.phone': rx }];
    }
    const customers = await Booking.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$guest.email',
          firstName: { $first: '$guest.firstName' },
          lastName: { $first: '$guest.lastName' },
          phone: { $first: '$guest.phone' },
          country: { $first: '$guest.country' },
          bookings: { $sum: 1 },
          nights: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$nights', 0] } },
          totalSpent: { $sum: { $cond: [{ $in: ['$status', REVENUE_STATUSES] }, '$pricing.total', 0] } },
          lastStay: { $max: '$checkIn' },
        },
      },
      { $sort: { totalSpent: -1, lastStay: -1 } },
      { $limit: 500 },
      { $project: { _id: 0, email: '$_id', firstName: 1, lastName: 1, phone: 1, country: 1, bookings: 1, nights: 1, totalSpent: 1, lastStay: 1 } },
    ]);
    res.json({ customers });
  })
);

router.get(
  '/customers/bookings',
  asyncHandler(async (req, res) => {
    const email = str(req.query.email, 120).toLowerCase();
    if (!email) throw new ApiError(400, 'An email address is required.');
    const bookings = await Booking.find({ 'guest.email': email })
      .sort({ checkIn: -1 })
      .populate('roomType', 'name')
      .populate('room', 'number')
      .lean();
    res.json({ bookings });
  })
);

/* --------------------------------------------------------------- Messages */

router.get(
  '/messages',
  asyncHandler(async (_req, res) => {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json({ messages });
  })
);

router.patch(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: Boolean(req.body.isRead) }, { new: true });
    if (!message) throw new ApiError(404, 'Message not found.');
    res.json({ message });
  })
);

router.delete(
  '/messages/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);

export default router;
