/**
 * Seeds the database with room categories, rooms, an admin account and (optionally) demo bookings.
 *
 *   npm run seed          -> categories + rooms + admin + ~50 demo bookings
 *   npm run seed:clean    -> categories + rooms + admin only
 *
 * WARNING: this wipes room categories, rooms, bookings and contact messages.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import RoomType from './models/RoomType.js';
import Room from './models/Room.js';
import Booking from './models/Booking.js';
import ContactMessage from './models/ContactMessage.js';
import { addDays, calculateTotal, todayInZone } from './utils/pricing.js';

const demo = !process.argv.includes('--no-demo');
const force = process.argv.includes('--force');

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

const ROOM_TYPES = [
  {
    name: 'Standard Room',
    order: 1,
    featured: false,
    pricePerNight: 145,
    bedType: '1 King bed or 2 Twin beds',
    maxGuests: 2,
    sizeSqm: 28,
    view: 'City view',
    shortDescription: 'A calm, beautifully appointed retreat for the discerning solo traveller or couple.',
    description:
      'Our Standard Rooms balance quiet elegance with everything you need for a restful stay. Hand-finished joinery, a plush pillow-top bed dressed in 400-thread-count linen and soft ambient lighting set the tone, while blackout drapes and double glazing guarantee uninterrupted sleep above the city.',
    facilities: ['Free high-speed Wi-Fi', 'Air conditioning', '43" Smart TV', 'Rain shower', 'Work desk', 'In-room safe', 'Tea & coffee station', 'Mini-bar'],
    images: [img('photo-1631049307264-da0ec9d70304'), img('photo-1590490360182-c33d57733427'), img('photo-1578683010236-d716f9a3f461')],
    floors: [2, 3],
    count: 12,
  },
  {
    name: 'Deluxe Room',
    order: 2,
    featured: true,
    pricePerNight: 215,
    bedType: '1 King bed',
    maxGuests: 3,
    sizeSqm: 38,
    view: 'Pool & garden view',
    shortDescription: 'Generous space, a private balcony and a marble bathroom overlooking the gardens.',
    description:
      'Wake to soft light over the pool terrace and landscaped gardens. Deluxe Rooms extend to 38 square metres with a lounge corner, a private balcony and a marble bathroom with a deep soaking tub, designed for guests who like a little more room to unwind.',
    facilities: ['Private balcony', 'Soaking bathtub', 'Free high-speed Wi-Fi', '50" Smart TV', 'Nespresso machine', 'Lounge seating', 'Premium toiletries', 'Turn-down service'],
    images: [img('photo-1618773928121-c32242e63f39'), img('photo-1611892440504-42a792e24d32'), img('photo-1582719508461-905c673771fd')],
    floors: [4, 5],
    count: 8,
  },
  {
    name: 'Executive Suite',
    order: 3,
    featured: true,
    pricePerNight: 360,
    bedType: '1 King bed + sofa bed',
    maxGuests: 4,
    sizeSqm: 62,
    view: 'Panoramic skyline view',
    shortDescription: 'A separate living room, executive lounge access and sweeping skyline views.',
    description:
      'The Executive Suite pairs a serene bedroom with a separate living and dining area, ideal for business travellers and families. Floor-to-ceiling windows frame the skyline, and your stay includes access to the Crest Lounge with daily breakfast, afternoon tea and evening canapés.',
    facilities: ['Separate living room', 'Executive lounge access', 'Daily breakfast for two', 'Floor-to-ceiling windows', 'Walk-in wardrobe', 'Double-vanity marble bathroom', 'Nespresso machine', 'Evening canapés'],
    images: [img('photo-1595576508898-0ad5c879a061'), img('photo-1560448204-e02f11c3d0e2'), img('photo-1566665797739-1674de7a421a')],
    floors: [6],
    count: 5,
  },
  {
    name: 'Presidential Suite',
    order: 4,
    featured: true,
    pricePerNight: 890,
    bedType: '2 King beds',
    maxGuests: 6,
    sizeSqm: 160,
    view: 'Penthouse panoramic view',
    shortDescription: 'Our crowning residence: 160 m² across the top floor with a private butler.',
    description:
      'The Presidential Suite occupies the hotel’s top floor. Two master bedrooms, a grand salon, a private dining room, a study and a terrace with a plunge pool are attended by your personal butler around the clock. Airport transfers in a chauffeured limousine and in-suite dining are included.',
    facilities: ['Private butler', 'Terrace with plunge pool', 'Private dining room', 'Chauffeured airport transfer', 'Study & meeting space', 'Two master bathrooms with spa tubs', 'Complimentary mini-bar', 'Priority spa access'],
    images: [img('photo-1512918728675-ed5a9ecdebfd'), img('photo-1631049552057-403cdb8f0658'), img('photo-1564078516393-cf04bd966897')],
    floors: [7],
    count: 2,
  },
];

// Small deterministic PRNG so the demo data is the same every run.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Adaeze', 'Tunde', 'Amara', 'Chidi', 'Sophie', 'James', 'Fatima', 'Daniel', 'Ngozi', 'Michael', 'Aisha', 'Oliver', 'Zainab', 'Emeka', 'Grace', 'Samuel', 'Lara', 'Kwame', 'Hannah', 'Yusuf', 'Ifeoma', 'David', 'Chiamaka', 'Peter'];
const LAST = ['Okafor', 'Balogun', 'Adeyemi', 'Nwosu', 'Laurent', 'Carter', 'Bello', 'Mensah', 'Eze', 'Thompson', 'Ibrahim', 'Hughes', 'Abubakar', 'Okonkwo', 'Williams', 'Ojo', 'Martins', 'Boateng', 'Clarke', 'Danjuma'];
const COUNTRIES = ['Nigeria', 'Nigeria', 'Nigeria', 'Ghana', 'United Kingdom', 'United States', 'South Africa', 'Kenya', 'United Arab Emirates', 'France', 'Canada'];
const REQUESTS = ['', '', '', 'Late check-in after 10pm', 'High floor please', 'Airport pickup required', 'Celebrating an anniversary', 'Extra pillows', 'Quiet room away from the lift', 'Baby cot needed'];

async function seed() {
  if (process.env.NODE_ENV === 'production' && !force) {
    throw new Error('Refusing to wipe data in production. Re-run with --force if you really mean it.');
  }
  await connectDB();

  console.log('Clearing existing hotel data…');
  await Promise.all([RoomType.deleteMany({}), Room.deleteMany({}), Booking.deleteMany({}), ContactMessage.deleteMany({})]);

  // Admin account (created or updated, other users are left alone)
  const email = (process.env.ADMIN_EMAIL || 'admin@royalcresthotel.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe!2026';
  await User.findOneAndUpdate(
    { email },
    { name: process.env.ADMIN_NAME || 'Hotel Administrator', email, role: 'admin', isActive: true, passwordHash: await User.hashPassword(password) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Categories + rooms
  const types = [];
  for (const { floors, count, ...fields } of ROOM_TYPES) {
    const type = await RoomType.create(fields);
    types.push(type);
    const perFloor = Math.ceil(count / floors.length);
    const rooms = [];
    for (let i = 0; i < count; i += 1) {
      const floor = floors[Math.floor(i / perFloor)];
      rooms.push({ number: `${floor}${String((i % perFloor) + 1).padStart(2, '0')}`, floor, roomType: type._id });
    }
    await Room.insertMany(rooms);
  }
  const allRooms = await Room.find().lean();
  console.log(`Created ${types.length} categories and ${allRooms.length} rooms.`);

  if (demo) {
    const rand = mulberry32(2026);
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const today = todayInZone(process.env.HOTEL_TIMEZONE || 'Africa/Lagos');
    const intervals = new Map(); // roomId -> [[checkIn, checkOut]]
    const docs = [];
    // Bias towards cheaper rooms, like a real hotel
    const weighted = [types[0], types[0], types[0], types[1], types[1], types[1], types[2], types[2], types[3]];

    for (let i = 0; i < 70 && docs.length < 52; i += 1) {
      const type = pick(weighted);
      const nights = 1 + Math.floor(rand() * 5);
      const checkIn = addDays(today, -80 + Math.floor(rand() * 125));
      const checkOut = addDays(checkIn, nights);

      const room = allRooms
        .filter((r) => String(r.roomType) === String(type._id))
        .find((r) => (intervals.get(String(r._id)) || []).every(([a, b]) => !(checkIn < b && checkOut > a)));
      if (!room) continue;

      let status;
      if (checkOut <= today) status = rand() < 0.92 ? 'checked_out' : 'cancelled';
      else if (checkIn <= today) status = 'checked_in';
      else status = rand() < 0.8 ? 'confirmed' : rand() < 0.6 ? 'pending' : 'cancelled';

      if (status !== 'cancelled') intervals.set(String(room._id), [...(intervals.get(String(room._id)) || []), [checkIn, checkOut]]);

      const first = pick(FIRST);
      const last = pick(LAST);
      const createdAt = new Date(Math.min(addDays(checkIn, -(1 + Math.floor(rand() * 28))).getTime(), Date.now() - 3600_000));

      docs.push({
        roomType: type._id,
        room: room._id,
        guest: {
          firstName: first,
          lastName: last,
          email: `${first}.${last}${Math.floor(rand() * 90) + 10}@example.com`.toLowerCase(),
          phone: `+234 80${Math.floor(rand() * 90000000 + 10000000)}`,
          country: pick(COUNTRIES),
        },
        guests: 1 + Math.floor(rand() * type.maxGuests),
        checkIn,
        checkOut,
        nights,
        specialRequests: pick(REQUESTS),
        pricing: calculateTotal({ pricePerNight: type.pricePerNight, nights }),
        status,
        cancelledAt: status === 'cancelled' ? createdAt : undefined,
        createdAt,
        updatedAt: createdAt,
      });
    }
    await Booking.insertMany(docs);
    await ContactMessage.insertMany([
      { name: 'Ifeoma Nnadi', email: 'ifeoma.nnadi@example.com', phone: '+234 803 555 0142', subject: 'Wedding reception enquiry', message: 'We are planning a wedding reception for about 180 guests in March. Could you share hall rates and catering packages?' },
      { name: 'Mark Jensen', email: 'mark.jensen@example.com', subject: 'Airport transfer', message: 'Do you offer airport pickup for late-night arrivals, and what is the cost for two passengers?' },
      { name: 'Aisha Lawal', email: 'aisha.lawal@example.com', subject: 'Corporate rates', message: 'Our company is looking at a corporate account for regular stays. Who should I speak with about negotiated rates?', isRead: true },
    ]);
    console.log(`Created ${docs.length} demo bookings and 3 contact messages.`);
  }

  console.log(`\nAdmin login → ${email}  /  ${password}`);
  if (password === 'ChangeMe!2026') console.log('(That is the default demo password. Set ADMIN_PASSWORD in server/.env before going live.)');
}

seed()
  .catch((err) => {
    console.error(`Seed failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
