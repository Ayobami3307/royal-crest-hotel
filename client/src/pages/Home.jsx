import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingBar from '../components/BookingBar';
import CtaBand from '../components/CtaBand';
import Icon from '../components/Icon';
import Img from '../components/Img';
import MapEmbed from '../components/MapEmbed';
import Reveal from '../components/Reveal';
import RoomCard from '../components/RoomCard';
import SectionHeading from '../components/SectionHeading';
import Seo from '../components/Seo';
import StatsRow from '../components/StatsRow';
import { ErrorState, RoomSkeletons } from '../components/States';
import { HOTEL } from '../config';
import { AMENITIES, GALLERY, OFFERS, TESTIMONIALS } from '../data/content';
import { IMG } from '../data/images';
import { useApi } from '../hooks/useApi';
import { initials } from '../utils/format';

function HeroSlides() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setActive((n) => (n + 1) % IMG.hero.length), 7000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hero__slides" aria-hidden="true">
      {IMG.hero.map((id, i) => (
        <Img key={id} src={id} w={2200} eager={i === 0} className={`hero__slide ${i === active ? 'is-active' : ''}`} />
      ))}
    </div>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;
  const go = useCallback((n) => setI((n + count) % count), [count]);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % count), 8000);
    return () => clearInterval(t);
  }, [paused, count]);

  return (
    <div
      className="testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="testimonials__stage" aria-live="polite">
        {TESTIMONIALS.map((t, idx) => (
          <figure key={t.name} className={`quote ${idx === i ? 'is-active' : ''}`} aria-hidden={idx !== i}>
            <div className="quote__stars" aria-label="Rated 5 out of 5">
              {Array.from({ length: 5 }, (_, s) => <Icon key={s} name="star" size={18} filled />)}
            </div>
            <blockquote>“{t.text}”</blockquote>
            <figcaption>
              <span className="quote__avatar" aria-hidden="true">{initials(t.name)}</span>
              <span>
                <strong>{t.name}</strong>
                <small>{t.from} · {t.stay}</small>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="testimonials__controls">
        <button type="button" onClick={() => go(i - 1)} aria-label="Previous review"><Icon name="left" size={20} /></button>
        <div className="dots">
          {TESTIMONIALS.map((t, idx) => (
            <button key={t.name} type="button" className={idx === i ? 'is-active' : ''} onClick={() => go(idx)} aria-label={`Show review ${idx + 1}`} />
          ))}
        </div>
        <button type="button" onClick={() => go(i + 1)} aria-label="Next review"><Icon name="right" size={20} /></button>
      </div>
    </div>
  );
}

export default function Home() {
  const { data, loading, error, reload } = useApi('/room-types');
  const roomTypes = data?.roomTypes || [];
  const featured = roomTypes.filter((r) => r.featured).slice(0, 3);
  const showcase = featured.length ? featured : roomTypes.slice(0, 3);

  return (
    <>
      <Seo
        description="Royal Crest Hotel & Suites: a five-star luxury hotel in Victoria Island, Lagos, with elegant rooms and suites, fine dining, a rooftop pool, spa and event halls. Book direct."
      />

      {/* ------------------------------------------------------------ Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <HeroSlides />
        <div className="hero__shade" />
        <div className="container hero__inner">
          <div className="hero__content">
            <p className="hero__eyebrow">
              <span /> Five-star luxury · Victoria Island, Lagos
            </p>
            <h1 id="hero-title" className="hero__title">
              Experience Luxury <em>Beyond Expectations.</em>
            </h1>
            <p className="hero__sub">
              Royal Crest Hotel &amp; Suites is an intimate sanctuary of 27 rooms and suites above the Lagos skyline, where
              refined design, exceptional dining and heartfelt Nigerian hospitality come together.
            </p>
            <div className="hero__actions">
              <Link to="/reservations" className="btn btn--gold">Book Your Stay</Link>
              <Link to="/rooms" className="btn btn--outline">Explore Rooms &amp; Suites</Link>
            </div>
          </div>
          <BookingBar roomTypes={roomTypes} />
        </div>
      </section>

      {/* ------------------------------------------------------- Welcome */}
      <section className="section section--ivory">
        <div className="container intro">
          <SectionHeading
            align="left"
            eyebrow="Welcome to Royal Crest"
            title="A sanctuary above the city"
            text="For nearly three decades, Royal Crest has been Lagos’s address for discreet, unhurried luxury. Every suite, every plate and every greeting is shaped by one conviction: that true luxury is feeling entirely, effortlessly looked after."
          />
          <Reveal delay={150} className="intro__points">
            <ul>
              <li><Icon name="check" size={18} /> Complimentary high-speed Wi-Fi and welcome drink</li>
              <li><Icon name="check" size={18} /> Best-rate guarantee when you book direct</li>
              <li><Icon name="check" size={18} /> Easy online cancellation before arrival</li>
              <li><Icon name="check" size={18} /> 24-hour reception, concierge and room service</li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------- Featured rooms */}
      <section className="section section--paper" aria-labelledby="featured-title">
        <div className="container">
          <SectionHeading
            eyebrow="Accommodation"
            title="Rooms & suites crafted for rest"
            text="Four categories of accommodation, each finished in natural stone, warm timber and the softest linens."
          />
          {loading && <RoomSkeletons />}
          {error && <ErrorState error={error} onRetry={reload} title="We couldn’t load our rooms" />}
          {!loading && !error && (
            <div className="grid grid--3">
              {showcase.map((room, i) => (
                <RoomCard key={room._id} room={room} index={i} />
              ))}
            </div>
          )}
          <Reveal className="center mt-lg">
            <Link to="/rooms" className="btn btn--dark">View All Rooms &amp; Suites <Icon name="arrow" size={16} /></Link>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- About */}
      <section className="section section--dark about-home">
        <div className="container split">
          <Reveal className="split__media about-home__media">
            <Img src={IMG.lobby} alt="The grand lobby at Royal Crest Hotel" className="about-home__img about-home__img--a" w={1200} />
            <Img src={IMG.bath} alt="Marble bathroom in a Royal Crest suite" className="about-home__img about-home__img--b" w={800} />
          </Reveal>
          <div className="split__text">
            <SectionHeading
              align="left"
              light
              eyebrow="About Royal Crest"
              title="Hospitality, perfected over 28 years"
              text="Founded in 1998 as a twelve-room boutique hotel, Royal Crest has grown into one of West Africa’s most admired addresses without ever losing its personal touch. Our team of more than 140 people takes pride in anticipating what you need before you ask."
            />
            <Reveal delay={150}>
              <StatsRow />
              <Link to="/about" className="btn btn--outline mt-md">Our Story</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Amenities */}
      <section className="section section--ivory" aria-labelledby="amenities-title">
        <div className="container">
          <SectionHeading
            eyebrow="Hotel Amenities"
            title="Everything, beautifully considered"
            text="From sunrise swims to midnight room service, our facilities are designed around the way you want to spend your time."
          />
          <div className="amenities">
            {AMENITIES.map((a, i) => (
              <Reveal key={a.title} delay={(i % 4) * 90} className="amenity">
                <span className="amenity__icon"><Icon name={a.icon} size={28} /></span>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="center mt-lg">
            <Link to="/facilities" className="btn btn--outline-dark">Discover All Facilities</Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- Dining */}
      <section className="section section--dark dining-home">
        <div className="container split split--reverse">
          <Reveal className="split__media dining-home__media">
            <Img src={IMG.restaurant} alt="Crest Dining restaurant" className="dining-home__img" w={1400} />
            <div className="dining-home__badge">
              <strong>6:30am</strong>
              <span>until late, every day</span>
            </div>
          </Reveal>
          <div className="split__text">
            <SectionHeading
              align="left"
              light
              eyebrow="Restaurant & Bar"
              title="Dine at Crest, drink at Aurum"
              text="Our chefs pair West African produce with classical technique, from a leisurely breakfast to a candlelit tasting menu. Afterwards, the Aurum Bar pours rare spirits and original cocktails to the sound of live jazz."
            />
            <Reveal delay={150}>
              <ul className="ticks ticks--light">
                <li><Icon name="check" size={16} /> Seasonal à la carte and chef’s tasting menu</li>
                <li><Icon name="check" size={16} /> Private dining room for up to 14 guests</li>
                <li><Icon name="check" size={16} /> Live jazz every Friday evening</li>
              </ul>
              <div className="row-actions mt-md">
                <Link to="/restaurant" className="btn btn--gold">View Menus &amp; Book a Table</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Offers */}
      <section className="section section--paper" aria-labelledby="offers-title">
        <div className="container">
          <SectionHeading eyebrow="Special Offers" title="Curated packages, thoughtfully priced" text="Every package is added to your stay at the standard room rate, with the extras on us." />
          <div className="grid grid--3">
            {OFFERS.map((o, i) => (
              <Reveal as="article" key={o.key} delay={i * 100} className="offer">
                <Img src={o.image} alt="" className="offer__bg" w={1000} />
                <div className="offer__shade" />
                <div className="offer__body">
                  <span className="offer__tag">{o.tag}</span>
                  <h3>{o.title}</h3>
                  <p>{o.text}</p>
                  <ul>
                    {o.includes.map((inc) => (
                      <li key={inc}><Icon name="check" size={14} /> {inc}</li>
                    ))}
                  </ul>
                  <Link to={`/reservations?type=${o.type}&offer=${encodeURIComponent(o.key)}`} className="btn btn--gold btn--sm">
                    Book This Offer
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- Testimonials */}
      <section className="section section--ivory testimonials-section">
        <div className="container">
          <SectionHeading eyebrow="Guest Stories" title="Words from our guests" />
          <Testimonials />
        </div>
      </section>

      {/* ---------------------------------------------------------- Gallery */}
      <section className="section section--dark" aria-labelledby="gallery-title">
        <div className="container">
          <SectionHeading light eyebrow="Gallery" title="A glimpse inside" text="Step into Royal Crest, from our rooftop pool to the candlelit spa." />
          <div className="mosaic">
            {[GALLERY[0], GALLERY[5], GALLERY[1], GALLERY[3], GALLERY[8], GALLERY[2]].map((g, i) => (
              <Reveal key={g.src} delay={i * 70} className={`mosaic__item mosaic__item--${i + 1}`}>
                <Link to="/gallery" aria-label={`${g.alt}. Open the gallery`}>
                  <Img src={g.thumb} alt={g.alt} w={900} />
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="center mt-lg">
            <Link to="/gallery" className="btn btn--outline">Explore the Full Gallery</Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ Location */}
      <section className="section section--ivory" aria-labelledby="visit-title">
        <div className="container location">
          <div className="location__info">
            <SectionHeading align="left" eyebrow="Visit Us" title="Find us on Victoria Island" text="Minutes from the business district, beaches and Lagos’s best shopping, and 35 minutes from Murtala Muhammed International Airport." />
            <Reveal delay={120}>
              <ul className="contact-list">
                <li><Icon name="pin" size={20} /><span>{HOTEL.address.join(', ')}</span></li>
                <li><Icon name="phone" size={20} /><a href={HOTEL.phoneHref}>{HOTEL.phone}</a></li>
                <li><Icon name="mail" size={20} /><a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a></li>
                <li><Icon name="clock" size={20} /><span>Reception open 24 hours · Check-in {HOTEL.checkInTime} · Check-out {HOTEL.checkOutTime}</span></li>
              </ul>
              <div className="row-actions mt-md">
                <Link to="/contact" className="btn btn--dark">Contact Us</Link>
                <Link to="/reservations" className="btn btn--outline-dark">Reserve a Room</Link>
              </div>
            </Reveal>
          </div>
          <Reveal className="location__map"><MapEmbed /></Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
