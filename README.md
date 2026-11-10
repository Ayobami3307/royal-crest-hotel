# Royal Crest Hotel & Suites

A full-stack luxury hotel website with a live booking engine and a staff management dashboard.

| Layer    | Stack                                                                 |
| -------- | --------------------------------------------------------------------- |
| Frontend | React 18, React Router 6, Vite, hand-written CSS (design tokens)      |
| Backend  | Node.js, Express 4, MongoDB (Mongoose 8), JWT auth, bcrypt            |
| Security | Helmet, CORS allow-list, rate limiting, server-side validation        |

## Quick start

Requires Node 18+ and a MongoDB instance (local or Atlas).

```bash
# 1. API
cd server
cp .env.example .env          # set MONGODB_URI and a long random JWT_SECRET
npm install
npm run seed                  # categories, 27 rooms, admin account, ~50 demo bookings
npm run dev                   # http://localhost:5000

# 2. Website (new terminal)
cd client
npm install
npm run dev                   # http://localhost:5173  (proxies /api to :5000)
```

Staff dashboard: <http://localhost:5173/admin>
Login with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env` (defaults in `.env.example`).
**Change the password before deploying.**

`npm run seed:clean` seeds the catalogue and admin only, with no demo bookings. Seeding wipes room
categories, rooms, bookings and messages, so never run it against live data.

### Production (single deployment)

```bash
cd client && npm run build    # outputs client/dist
cd ../server && NODE_ENV=production npm start
```

When `client/dist` exists, Express serves the React app and the API from one origin.
To host the frontend separately, set `VITE_API_URL` at build time and `CLIENT_URL` on the server.

## Pages

**Public:** Home, About, Rooms & Suites, Room Details (`/rooms/:slug`), Restaurant (with table
request form), Facilities, Gallery (lightbox), Contact, Reservations (3-step booking),
Manage Booking (look up or cancel with reference + email), 404.

**Admin (`/admin`):** Overview with statistics, Bookings (search, filter, status changes, room
re-assignment), Rooms & Rates (categories, individual rooms, quick price updates), Availability
calendar, Guests (customer list and history), Messages inbox.

## How booking works

1. The guest picks dates and guests. Past dates, check-out on or before check-in, and stays over
   30 nights are rejected in the browser **and** on the server.
2. `GET /api/availability` returns every category with live free-room counts and a server-calculated
   price (subtotal, 5% service charge, 7.5% VAT). Sold-out or too-small categories are shown
   but cannot be selected.
3. The guest enters their details and submits. The server re-validates everything, recalculates
   the price (the browser's figures are never trusted), and assigns a specific free room.
4. A double-booking guard re-checks the room after insert and retries with the next free room, so
   two simultaneous guests cannot receive the same room. If a category sells out meanwhile, the
   guest is sent back to choose again with a clear message.
5. A reference (e.g. `RC-7K2M9X`) is issued. Same-day turnover is allowed (check-out and check-in
   on one date). Set `AUTO_CONFIRM_BOOKINGS=false` to make new bookings start as "pending" for staff to confirm.

## API

Public
- `GET  /api/room-types`, `GET /api/room-types/:slug`
- `GET  /api/availability?checkIn=&checkOut=&guests=`
- `POST /api/bookings`, `GET /api/bookings/lookup`, `POST /api/bookings/cancel`
- `POST /api/contact`

Auth: `POST /api/auth/login`, `GET /api/auth/me`

Admin (Bearer token): `/api/admin/` `stats`, `bookings[/:id]`, `room-types[/:id[/price]]`,
`rooms[/:id]`, `availability`, `customers[/bookings]`, `messages[/:id]`

## Project structure

```
server/src
  config/      database connection
  middleware/  JWT auth guard, error handling
  models/      User, RoomType, Room, Booking, ContactMessage
  routes/      public, bookings, auth, admin
  utils/       pricing + date maths (pure, unit tested), availability, validation
  seed.js      demo data
client/src
  pages/       public pages;  pages/admin/ staff dashboard (lazy-loaded chunk)
  components/  reusable UI (RoomCard, BookingBar, Img, Lightbox, SEO, ...)
  data/        content.js (all copy) and images.js (all photography)
  styles/      index.css (tokens + base), site.css (public), admin.css
```

Run server tests with `cd server && npm test` (pricing, date validation and overlap logic).

## Customising for a real hotel

- **Name, address, phone, email, check-in times, social links, currency:** `client/src/config.js`
  (currency can also be set with `VITE_CURRENCY`)
- **Page copy, testimonials, offers, menus:** `client/src/data/content.js`
- **Photography:** `client/src/data/images.js` and the image URLs in `server/src/seed.js`.
  The bundled photos are royalty-free Unsplash images used for demonstration. Replace them with
  licensed photography of the actual property before launch. If an image fails to load, a gold
  crest placeholder is shown instead of a broken layout.
- **Brand colours and fonts:** CSS variables at the top of `client/src/styles/index.css`
- **Tax and service-charge rates, maximum stay:** `server/src/utils/pricing.js`
- **SEO:** update the canonical URL in `client/index.html`, `client/public/sitemap.xml` and `robots.txt`
  to the real domain.

## Notes for a real launch

- Online payment is deliberately out of scope: guests pay at the hotel. Adding Paystack or Stripe
  would slot in at the end of the booking step.
- Confirmation is shown on screen only. Add an email provider (Resend, SendGrid, SES) in
  `server/src/routes/bookings.js` to send confirmations.
- The admin JWT is kept in `localStorage`. For higher-assurance deployments, move it to an
  httpOnly cookie.
