import { IMG, photo } from './images';

export const AMENITIES = [
  { icon: 'waves', title: 'Rooftop Infinity Pool', text: 'A heated 25-metre pool above the city, with private cabanas and poolside service.' },
  { icon: 'utensils', title: 'Restaurant & Bar', text: 'Seasonal fine dining at Crest, and handcrafted cocktails at the Aurum Bar.' },
  { icon: 'dumbbell', title: 'Fitness Centre', text: 'Open around the clock with Technogym equipment and personal trainers.' },
  { icon: 'spa', title: 'Spa & Wellness', text: 'Ten treatment rooms, hammam, sauna and a signature African botanicals menu.' },
  { icon: 'presentation', title: 'Conference & Events', text: 'A 400-guest ballroom and three boardrooms with full audio-visual support.' },
  { icon: 'wifi', title: 'Free High-Speed Wi-Fi', text: 'Fibre-fast, complimentary connectivity in every room and public space.' },
  { icon: 'bell', title: '24-Hour Room Service', text: 'The full Crest menu, delivered to your door at any hour, day or night.' },
  { icon: 'plane', title: 'Airport Transportation', text: 'Chauffeured transfers with flight monitoring, so you are never kept waiting.' },
];

export const FACILITIES = [
  {
    id: 'pool',
    icon: 'waves',
    title: 'Swimming Pool',
    image: IMG.pool,
    hours: 'Daily, 6:00 am – 10:00 pm',
    text: 'Swim lengths at sunrise or unwind at dusk beside our heated 25-metre rooftop infinity pool, framed by the Lagos skyline. Reserve a sunken cabana, order from the pool bar, and let our attendants handle the rest. A separate shallow pool keeps younger guests happy.',
    features: ['Heated 25 m infinity pool', 'Private cabanas & daybeds', 'Pool bar and light menu', "Children's pool", 'Towel and attendant service'],
  },
  {
    id: 'dining',
    icon: 'utensils',
    title: 'Restaurant & Bar',
    image: IMG.restaurant,
    hours: 'Crest 6:30 am – 11:00 pm · Aurum Bar 12:00 pm – 1:00 am',
    text: 'Crest Dining celebrates West African produce through a contemporary European lens, from a lavish breakfast spread to a tasting menu worth dressing up for. Afterwards, the Aurum Bar pours rare spirits and original cocktails to live jazz on Friday evenings.',
    features: ['All-day à la carte dining', 'Chef’s tasting menu', 'Private dining room for 14', 'Rare spirits and craft cocktails', 'Live jazz on Fridays'],
    cta: { to: '/restaurant', label: 'View the menu' },
  },
  {
    id: 'fitness',
    icon: 'dumbbell',
    title: 'Fitness Centre',
    image: IMG.gym,
    hours: 'Open 24 hours for in-house guests',
    text: 'A light-filled, fully equipped gym with Technogym cardio and strength equipment, free weights and a dedicated stretching studio. Book a one-to-one session with our personal trainers, or join the 7:00 am yoga class on the terrace.',
    features: ['Technogym equipment', 'Personal training on request', 'Daily yoga and mobility classes', 'Fresh towels and filtered water', 'Steam room access'],
  },
  {
    id: 'spa',
    icon: 'spa',
    title: 'Spa & Wellness',
    image: IMG.spa,
    hours: 'Daily, 9:00 am – 9:00 pm',
    text: 'The Crest Spa is a sanctuary of stone, warm timber and candlelight. Our therapists use shea, baobab and hibiscus-based treatments to restore body and mind, from deep-tissue massage to a three-hour ritual for couples.',
    features: ['Ten treatment rooms', 'Hammam, sauna and steam', 'Couples’ suite with private bath', 'Signature botanicals massage', 'Manicure and pedicure salon'],
  },
  {
    id: 'events',
    icon: 'presentation',
    title: 'Conference & Event Halls',
    image: IMG.hall,
    hours: 'By appointment, 7 days a week',
    text: 'From board meetings to black-tie weddings, our events team shapes every detail. The pillar-free Crest Ballroom seats 400 for dinner, and three boardrooms offer natural light, private entrances and seamless technology.',
    features: ['Crest Ballroom: up to 400 guests', 'Three boardrooms (8–24 guests)', 'Wedding and gala packages', 'In-house catering and florals', 'Simultaneous translation booths'],
    cta: { to: '/contact?subject=Events%20%26%20Conferences', label: 'Enquire about events' },
  },
  {
    id: 'wifi',
    icon: 'wifi',
    title: 'Free Wi-Fi',
    image: IMG.conference,
    hours: 'Complimentary, throughout the hotel',
    text: 'Dual fibre lines and an enterprise-grade network deliver fast, secure and unlimited Wi-Fi in every room, restaurant, meeting space and poolside cabana. A fully staffed business centre handles printing and courier needs.',
    features: ['Unlimited, complimentary access', 'Backup fibre line', 'Business centre with printing', 'Dedicated bandwidth for events', 'Streaming-ready on all in-room TVs'],
  },
  {
    id: 'room-service',
    icon: 'bell',
    title: '24-Hour Room Service',
    image: IMG.dining,
    hours: 'Every hour of every day',
    text: 'Our full menu, plus a late-night selection, is delivered by a dedicated in-room dining team, beautifully presented on linen-draped trolleys. Special dietary needs are always welcome, simply tell us in advance.',
    features: ['Full menu, day and night', 'Dietary and allergy care', 'Breakfast served in-suite', 'Champagne and flowers on request', 'Typical delivery within 25 minutes'],
  },
  {
    id: 'airport',
    icon: 'plane',
    title: 'Airport Transportation',
    image: IMG.lobby,
    hours: 'Available 24/7 with 12 hours’ notice',
    text: 'Arrive refreshed. Our chauffeurs meet you in the arrivals hall with a name board, help with luggage and monitor your flight so delays never leave you waiting. Presidential Suite guests enjoy complimentary return transfers.',
    features: ['Chauffeured Mercedes fleet', 'Meet & greet at arrivals', 'Real-time flight monitoring', 'Child seats on request', 'From $60 each way'],
  },
];

export const TESTIMONIALS = [
  {
    name: 'Adaeze Okonkwo',
    from: 'Lagos, Nigeria',
    stay: 'Deluxe Room',
    text: 'From the moment I walked into the lobby, every detail felt considered: the scent, the lighting, the warmth of the team. My Deluxe Room overlooked the pool and I slept better than I have in years.',
  },
  {
    name: 'Daniel Carter',
    from: 'London, United Kingdom',
    stay: 'Executive Suite',
    text: 'I spend over a hundred nights a year in hotels. Royal Crest is now the first one I ask my assistant to book. The Executive Lounge, the speed of the Wi-Fi and the quiet professionalism are unmatched.',
  },
  {
    name: 'Sophie & Marc Laurent',
    from: 'Paris, France',
    stay: 'Romantic Escape',
    text: 'We celebrated our tenth anniversary here. Champagne and rose petals were waiting, the couples’ massage was divine and dinner at Crest was the best meal of our trip. Thank you for making it unforgettable.',
  },
  {
    name: 'The Mensah Family',
    from: 'Accra, Ghana',
    stay: 'Presidential Suite',
    text: 'Three generations under one roof, and everyone felt looked after. Our butler remembered the children’s favourite snacks by the second day. The terrace pool was an absolute highlight.',
  },
  {
    name: 'Ngozi & Emeka Eze',
    from: 'Abuja, Nigeria',
    stay: 'Crest Ballroom',
    text: 'Our wedding for 320 guests ran flawlessly. The events team anticipated everything, the food was extraordinary and our families still talk about the evening. We could not have chosen a better venue.',
  },
];

export const OFFERS = [
  {
    key: 'Romantic Escape',
    title: 'Romantic Escape',
    tag: 'For two',
    type: 'deluxe-room',
    image: IMG.room2,
    text: 'Reconnect in a Deluxe Room with a bottle of champagne on arrival, rose-petal turn-down and a 60-minute couples’ massage.',
    includes: ['Champagne and chocolates on arrival', '60-minute couples’ massage', 'Late check-out until 2:00 pm'],
  },
  {
    key: 'The Executive Stay',
    title: 'The Executive Stay',
    tag: 'For business',
    type: 'executive-suite',
    image: IMG.room3,
    text: 'Everything a working trip demands: a spacious suite, lounge access, laundry and a chauffeured arrival transfer.',
    includes: ['Daily breakfast and lounge access', 'Five laundry items per day', 'One-way airport transfer'],
  },
  {
    key: 'Weekend Getaway',
    title: 'Weekend Getaway',
    tag: 'Friday – Sunday',
    type: 'standard-room',
    image: IMG.poolWide,
    text: 'Slow down for the weekend with breakfast in bed, a poolside cabana for the afternoon and a relaxed late check-out.',
    includes: ['Breakfast for two each morning', 'Two hours in a poolside cabana', 'Late check-out until 4:00 pm'],
  },
];

export const MENU = {
  Starters: [
    { name: 'Suya-Spiced Tuna Tartare', desc: 'Avocado, pickled shallot, yaji crisp', price: 18 },
    { name: 'Roasted Heirloom Beetroot', desc: 'Whipped goat’s cheese, pistachio, honey', price: 15, tag: 'V' },
    { name: 'Lobster Bisque', desc: 'Cognac cream, chive oil, brioche', price: 19 },
    { name: 'Seared Scallops', desc: 'Cauliflower purée, caper and raisin dressing', price: 22 },
  ],
  Mains: [
    { name: 'Chargrilled Lamb Rack', desc: 'Herb crust, jollof barley, rosemary jus', price: 42 },
    { name: 'Pan-Roasted Sea Bass', desc: 'Saffron beurre blanc, charred greens', price: 36 },
    { name: 'Wagyu Beef Fillet', desc: 'Truffle potato terrine, red wine reduction', price: 58 },
    { name: 'Wild Mushroom Risotto', desc: 'Aged parmesan, truffle oil, crispy sage', price: 28, tag: 'V' },
  ],
  Desserts: [
    { name: 'Dark Chocolate Fondant', desc: 'Salted caramel, vanilla bean ice cream', price: 14 },
    { name: 'Passion Fruit Soufflé', desc: 'Coconut sorbet', price: 15 },
    { name: 'Zobo-Poached Pear', desc: 'Hibiscus syrup, mascarpone, toasted oats', price: 13, tag: 'V' },
    { name: 'The Crest Cheese Selection', desc: 'Five cheeses, fig chutney, walnut bread', price: 18 },
  ],
  Cocktails: [
    { name: 'Crest Old Fashioned', desc: 'Aged bourbon, smoked demerara, orange bitters', price: 14 },
    { name: 'Aurum Spritz', desc: 'Champagne, gold-leaf liqueur, bitter orange', price: 13 },
    { name: 'Hibiscus Martini', desc: 'Vodka, zobo reduction, lime, egg white', price: 14 },
    { name: 'Garden Hour', desc: 'Alcohol-free: cucumber, basil, elderflower, soda', price: 9, tag: 'V' },
  ],
};

export const DINING_HOURS = [
  { label: 'Breakfast', time: '6:30 am – 10:30 am' },
  { label: 'Lunch', time: '12:00 pm – 3:00 pm' },
  { label: 'Dinner', time: '6:00 pm – 11:00 pm' },
  { label: 'Aurum Bar', time: '12:00 pm – 1:00 am' },
  { label: 'Room service', time: '24 hours' },
];

export const GALLERY = [
  { src: IMG.hero[0], alt: 'Royal Crest Hotel and rooftop pool at golden hour', category: 'Exterior', span: 'wide' },
  { src: IMG.room1, alt: 'Standard Room with king bed and city view', category: 'Rooms' },
  { src: IMG.pool, alt: 'Rooftop infinity pool with loungers', category: 'Pool', span: 'tall' },
  { src: IMG.restaurant, alt: 'Crest Dining restaurant interior', category: 'Dining' },
  { src: IMG.room3, alt: 'Executive Suite bedroom', category: 'Rooms' },
  { src: IMG.spa, alt: 'Spa treatment room with candles and orchids', category: 'Spa & Wellness', span: 'tall' },
  { src: IMG.lobby, alt: 'Grand lobby with marble floor', category: 'Exterior' },
  { src: IMG.dining, alt: 'Chef-plated main course at Crest Dining', category: 'Dining' },
  { src: IMG.hall, alt: 'Crest Ballroom set for a banquet', category: 'Events', span: 'wide' },
  { src: IMG.room2, alt: 'Deluxe Room with balcony', category: 'Rooms' },
  { src: IMG.massage, alt: 'Massage therapy at the Crest Spa', category: 'Spa & Wellness' },
  { src: IMG.bar, alt: 'Aurum Bar signature cocktails', category: 'Dining', span: 'tall' },
  { src: IMG.gym, alt: 'Fitness centre with Technogym equipment', category: 'Spa & Wellness' },
  { src: IMG.poolWide, alt: 'Poolside cabanas at sunset', category: 'Pool' },
  { src: IMG.room4, alt: 'Presidential Suite living room', category: 'Rooms', span: 'wide' },
  { src: IMG.conference, alt: 'Boardroom set for a meeting', category: 'Events' },
  { src: IMG.exterior, alt: 'Hotel facade at dusk', category: 'Exterior' },
  { src: IMG.bath, alt: 'Marble suite bathroom with soaking tub', category: 'Rooms' },
].map((g) => ({ ...g, thumb: photo(g.src, 800), full: photo(g.src, 1800) }));

export const GALLERY_CATEGORIES = ['All', 'Rooms', 'Dining', 'Pool', 'Spa & Wellness', 'Events', 'Exterior'];

export const TIMELINE = [
  { year: '1998', title: 'The doors open', text: 'Royal Crest welcomes its first guests as a twelve-room boutique hotel on Crest Avenue.' },
  { year: '2006', title: 'The Crest Ballroom', text: 'A new conference wing and a 400-guest ballroom make the hotel Lagos’s favourite stage for celebrations.' },
  { year: '2013', title: 'Spa & Wellness', text: 'The Crest Spa opens with a signature menu inspired by West African botanicals.' },
  { year: '2019', title: 'A complete reimagining', text: 'Every room is redesigned, and the rooftop infinity pool is unveiled above the skyline.' },
  { year: '2024', title: 'The Presidential Floor', text: 'The 160 m² Presidential Suite and the Aurum Bar complete the hotel’s vision.' },
];

export const VALUES = [
  { icon: 'key', title: 'Quiet exclusivity', text: 'With only 27 rooms and suites, every guest receives the attention of a private residence.' },
  { icon: 'star', title: 'Uncompromising detail', text: 'From hand-pressed linens to the temperature of your coffee, we obsess so you never have to.' },
  { icon: 'shield', title: 'Genuine warmth', text: 'Nigerian hospitality is generous by nature. Our team treats every arrival as an honoured guest.' },
  { icon: 'spa', title: 'Rooted in place', text: 'We champion local artists, growers and craftspeople throughout our menus and interiors.' },
];

export const FAQ = [
  { q: 'What are check-in and check-out times?', a: 'Check-in is from 2:00 pm and check-out is by 12:00 noon. Early check-in and late check-out are available on request, subject to availability.' },
  { q: 'Is breakfast included in the room rate?', a: 'Breakfast is included with the Executive Suite and Presidential Suite, and with our Weekend Getaway package. For other rooms, it can be added at the Crest restaurant.' },
  { q: 'Can I cancel or change my reservation?', a: 'Yes. Use "Manage booking" with your reference and email to cancel online, or call our reservations team to amend your dates.' },
  { q: 'Do you offer airport transfers?', a: 'We do. Chauffeured transfers are available 24/7 with twelve hours’ notice, and are complimentary return for Presidential Suite guests.' },
  { q: 'Is the hotel suitable for children?', a: 'Absolutely. We provide cots, high chairs, a children’s pool and a children’s menu. Please let us know your requirements when booking.' },
];

export const STATS = [
  { value: 28, suffix: '', label: 'Years of hospitality' },
  { value: 27, suffix: '', label: 'Rooms & suites' },
  { value: 140, suffix: '+', label: 'Dedicated team members' },
  { value: 4.9, suffix: '', label: 'Average guest rating', decimals: 1 },
];
