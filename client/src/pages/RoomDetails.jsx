import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import Icon from '../components/Icon';
import Img from '../components/Img';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import RoomCard from '../components/RoomCard';
import SectionHeading from '../components/SectionHeading';
import Seo from '../components/Seo';
import { ErrorState, Spinner } from '../components/States';
import { IMG } from '../data/images';
import { useApi } from '../hooks/useApi';
import { addDaysISO, money, plural, todayISO } from '../utils/format';

/** Sticky card: pick dates, see live availability and the exact total, then continue to booking. */
function AvailabilityCard({ room }) {
  const navigate = useNavigate();
  const today = todayISO();
  const [form, setForm] = useState({ checkIn: today, checkOut: addDaysISO(today, 2), guests: '2' });
  const [state, setState] = useState({ loading: false, error: '', result: null });

  const update = (field) => (e) => {
    const value = e.target.value;
    setState((s) => ({ ...s, result: null, error: '' }));
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'checkIn' && value && next.checkOut <= value) next.checkOut = addDaysISO(value, 1);
      return next;
    });
  };

  async function check(e) {
    e.preventDefault();
    if (!form.checkIn || !form.checkOut) return setState({ loading: false, error: 'Please choose both dates.', result: null });
    if (form.checkIn < today) return setState({ loading: false, error: 'Check-in cannot be in the past.', result: null });
    if (form.checkOut <= form.checkIn) return setState({ loading: false, error: 'Check-out must be after check-in.', result: null });

    setState({ loading: true, error: '', result: null });
    try {
      const data = await api.get('/availability', { params: form });
      const mine = data.rooms.find((r) => r._id === room._id);
      setState({ loading: false, error: '', result: mine ? { ...mine, nights: data.nights } : null });
    } catch (err) {
      setState({ loading: false, error: err.message, result: null });
    }
  }

  const { loading, error, result } = state;
  const qs = new URLSearchParams({ ...form, type: room.slug }).toString();

  return (
    <aside className="book-card" aria-label="Check availability">
      <p className="book-card__price">
        <span>From</span> <strong>{money(room.pricePerNight)}</strong> <span>/ night</span>
      </p>
      <form onSubmit={check} noValidate>
        <div className="book-card__grid">
          <label className="field">
            <span className="field__label">Check-in</span>
            <input className="input" type="date" min={today} value={form.checkIn} onChange={update('checkIn')} />
          </label>
          <label className="field">
            <span className="field__label">Check-out</span>
            <input className="input" type="date" min={addDaysISO(form.checkIn || today, 1)} value={form.checkOut} onChange={update('checkOut')} />
          </label>
        </div>
        <label className="field">
          <span className="field__label">Guests</span>
          <select className="input" value={form.guests} onChange={update('guests')}>
            {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{plural(n, 'guest')}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn--dark btn--block" disabled={loading}>
          {loading ? 'Checking…' : 'Check Availability'}
        </button>
      </form>

      {error && <p className="alert alert--error" role="alert">{error}</p>}

      {result && (
        <div className="book-card__result" role="status">
          {result.bookable ? (
            <>
              <p className="avail avail--yes">
                <Icon name="check" size={18} />
                {result.available <= 2 ? `Only ${plural(result.available, 'room')} left` : 'Available for your dates'}
              </p>
              <dl className="breakdown">
                <div><dt>{money(result.pricing.pricePerNight)} × {plural(result.nights, 'night')}</dt><dd>{money(result.pricing.subtotal)}</dd></div>
                <div><dt>Service charge (5%)</dt><dd>{money(result.pricing.serviceCharge)}</dd></div>
                <div><dt>VAT (7.5%)</dt><dd>{money(result.pricing.vat)}</dd></div>
                <div className="breakdown__total"><dt>Total</dt><dd>{money(result.pricing.total)}</dd></div>
              </dl>
              <button type="button" className="btn btn--gold btn--block" onClick={() => navigate(`/reservations?${qs}`)}>
                Book Now
              </button>
            </>
          ) : !result.fitsGuests ? (
            <p className="avail avail--no">
              <Icon name="alert" size={18} /> {room.name} sleeps up to {room.maxGuests} guests. Try a larger room.
            </p>
          ) : (
            <>
              <p className="avail avail--no"><Icon name="alert" size={18} /> Sold out for those dates.</p>
              <Link to="/rooms" className="btn btn--outline-dark btn--block">See other rooms</Link>
            </>
          )}
        </div>
      )}
      <p className="book-card__note">No payment is taken online. Pay at the hotel on arrival.</p>
    </aside>
  );
}

export default function RoomDetails() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useApi(`/room-types/${slug}`);
  const all = useApi('/room-types');
  const [active, setActive] = useState(0);
  const room = data?.roomType;

  useEffect(() => setActive(0), [slug]);

  if (loading) {
    return (
      <>
        <Seo title="Rooms & Suites" description="Loading room details." />
        <PageHero title="Rooms & Suites" image={IMG.room2} />
        <section className="section section--paper"><div className="container"><Spinner label="Loading room" /></div></section>
      </>
    );
  }

  if (error || !room) {
    return (
      <>
        <Seo title="Room not found" description="This room could not be found." noindex />
        <PageHero title="Rooms & Suites" image={IMG.room2} />
        <section className="section section--paper">
          <div className="container">
            <ErrorState
              error={error?.status === 404 ? { message: 'We could not find that room. It may have been renamed or retired.' } : error}
              onRetry={error?.status === 404 ? undefined : reload}
              title={error?.status === 404 ? 'Room not found' : 'We couldn’t load this room'}
            />
            <p className="center mt-md"><Link to="/rooms" className="btn btn--dark">Browse all rooms</Link></p>
          </div>
        </section>
      </>
    );
  }

  const images = room.images?.length ? room.images : [null];
  const others = (all.data?.roomTypes || []).filter((r) => r._id !== room._id).slice(0, 3);

  return (
    <>
      <Seo title={room.name} description={`${room.name} at Royal Crest Hotel & Suites. ${room.shortDescription || room.description}`.slice(0, 300)} image={room.images?.[0]} />
      <PageHero eyebrow={room.view} title={room.name} subtitle={room.shortDescription} image={room.images?.[0]} crumb={room.name} />

      <section className="section section--paper">
        <div className="container detail">
          <div className="detail__main">
            <Reveal className="gallery">
              <Img src={images[active]} alt={`${room.name}, photo ${active + 1}`} className="gallery__main" w={1600} eager />
              {images.length > 1 && (
                <div className="gallery__thumbs" role="tablist" aria-label="Room photos">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      role="tab"
                      aria-selected={i === active}
                      aria-label={`Show photo ${i + 1}`}
                      className={i === active ? 'is-active' : ''}
                      onClick={() => setActive(i)}
                    >
                      <Img src={src} alt="" w={400} />
                    </button>
                  ))}
                </div>
              )}
            </Reveal>

            <Reveal className="facts">
              <div><Icon name="bed" size={22} /><span>Bed</span><strong>{room.bedType}</strong></div>
              <div><Icon name="users" size={22} /><span>Occupancy</span><strong>Up to {room.maxGuests} guests</strong></div>
              <div><Icon name="size" size={22} /><span>Size</span><strong>{room.sizeSqm} m²</strong></div>
              <div><Icon name="eye" size={22} /><span>View</span><strong>{room.view || 'Hotel view'}</strong></div>
            </Reveal>

            <Reveal>
              <h2 className="h3">About this room</h2>
              <p className="prose">{room.description}</p>
            </Reveal>

            {room.facilities?.length > 0 && (
              <Reveal>
                <h2 className="h3">Facilities &amp; amenities</h2>
                <ul className="facility-list">
                  {room.facilities.map((f) => (
                    <li key={f}><Icon name="check" size={18} /> {f}</li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal className="policies">
              <h2 className="h3">Good to know</h2>
              <ul>
                <li>Check-in from 2:00 PM · Check-out by 12:00 noon</li>
                <li>Prices shown exclude 5% service charge and 7.5% VAT, which are added at checkout</li>
                <li>Free cancellation online before arrival</li>
                <li>Cots and extra beds on request</li>
              </ul>
            </Reveal>
          </div>

          <div className="detail__side">
            <AvailabilityCard room={room} />
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section section--ivory">
          <div className="container">
            <SectionHeading eyebrow="Also consider" title="Other rooms & suites" />
            <div className="grid grid--3">
              {others.map((r, i) => <RoomCard key={r._id} room={r} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
