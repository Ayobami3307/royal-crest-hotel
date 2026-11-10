// Single place to rebrand the site for a different hotel.

export const HOTEL = {
  name: 'Royal Crest Hotel & Suites',
  short: 'Royal Crest',
  tagline: 'Experience Luxury Beyond Expectations.',
  phone: '+234 1 700 0100',
  phoneHref: 'tel:+23417000100',
  email: 'reservations@royalcresthotel.com',
  address: ['12 Crest Avenue', 'Victoria Island, Lagos', 'Nigeria'],
  mapQuery: '12 Crest Avenue, Victoria Island, Lagos, Nigeria',
  checkInTime: '2:00 PM',
  checkOutTime: '12:00 noon',
  // Add full URLs here and the icons appear in the footer automatically.
  social: { instagram: '', facebook: '', x: '' },
};

export const CURRENCY = import.meta.env.VITE_CURRENCY || 'USD';

export const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/rooms', label: 'Rooms & Suites' },
  { to: '/restaurant', label: 'Restaurant' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];
