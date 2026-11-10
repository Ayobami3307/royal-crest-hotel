import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import BookingDetails from '../components/BookingDetails';
import Icon from '../components/Icon';
import Img from '../components/Img';
import Seo from '../components/Seo';
import { HOTEL } from '../config';
import { addDaysISO, formatDateLong, money, nightsBetween, plural, todayISO } from '../utils/format';
import { EMAIL_RE, PHONE_RE } from '../utils/validate';

const STEPS = ['Dates & guests', 'Choose your room', 'Your details'];
const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Canada', 'United Arab Emirates', 'France', 'Germany'];
const MAX_NIGHTS = 30;

function validateStayFields(s, today) {
  const e = {};
  if (!s.checkIn) e.checkIn = 'Please choose a check-in date.';
  else if (s.checkIn < today) e.checkIn = 'Check-in cannot be in the past.';
  if (!s.checkOut) e.checkOut = 'Please choose a check-out date.';
  else if (s.checkIn && s.checkOut <= s.checkIn) e.checkOut = 'Check-out must be after check-in.';
  else if (s.checkIn && nightsBetween(s.checkIn, s.checkOut) > MAX_NIGHTS) e.checkOut = `Online stays are limited to ${MAX_NIGHTS} nights. Please contact us for longer stays.`;
  return e;
}

function validateGuest(g) {
  const e = {};
  if (!g.firstName.trim()) e.firstName = 'Please enter your first name.';
  if (!g.lastName.trim()) e.lastName = 'Please enter your last name.';
  if (!EMAIL_RE.test(g.email.trim())) e.email = 'Please enter a valid email address.';
  if (!PHONE_RE.test(g.phone.trim())) e.phone = 'Please enter a valid phone number, e.g. +234 800 000 0000.';
  if (!g.terms) e.terms = 'Please accept the booking conditions to continue.';
  return e;
}

/* ------------------------------------------------------------ pieces */

function Stepper({ step, canGo, onGo }) {
  return (
    <ol className="stepper" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n === step ? 'current' : n < step ? 'done' : 'todo';
        return (
          <li key={label} className={`stepper__item stepper__item--${state}`} aria-current={n === step ? 'step' : undefined}>
            <button type="button" disabled={!canGo(n)} onClick={() => onGo(n)}>
              <span className="stepper__num">{state === 'done' ? <Icon name="check" size={14} /> : n}</span>
              <span className="stepper__label">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Summary({ stay, selected, nights }) {
  return (
    <div className="summary">
      <h2 className="summary__title">Your stay</h2>
      <dl className="summary__rows">
        <div><dt>Check-in</dt><dd>{stay.checkIn ? formatDateLong(stay.checkIn) : '-'}</dd></div>
        <div><dt>Check-out</dt><dd>{stay.checkOut ? formatDateLong(stay.checkOut) : '-'}</dd></div>
        <div><dt>Length of stay</dt><dd>{nights > 0 ? plural(nights, 'night') : '-'}</dd></div>
        <div><dt>Guests</dt><dd>{plural(Number(stay.guests), 'guest')}</dd></div>
      </dl>

      {selected ? (
        <>
          <div className="summary__room">
            <Img src={selected.images?.[0]} alt="" w={500} />
            <div>
              <strong>{selected.name}</strong>
              <span>{selected.bedType}</span>
            </div>
          </div>
          <dl className="breakdown">
            <div><dt>{money(selected.pricing.pricePerNight)} × {plural(selected.pricing.nights, 'night')}</dt><dd>{money(selected.pricing.subtotal)}</dd></div>
            <div><dt>Service charge (5%)</dt><dd>{money(selected.pricing.serviceCharge)}</dd></div>
            <div><dt>VAT (7.5%)</dt><dd>{money(selected.pricing.vat)}</dd></div>
            <div className="breakdown__total"><dt>Total</dt><dd>{money(selected.pricing.total)}</dd></div>
          </dl>
        </>
      ) : (
        <p className="summary__hint">Choose a room to see your total, including taxes and charges.</p>
      )}

      <ul className="summary__perks">
        <li><Icon name="check" size={16} /> No payment needed to reserve</li>
        <li><Icon name="check" size={16} /> Free cancellation before arrival</li>
        <li><Icon name="check" size={16} /> Free Wi-Fi and welcome drink</li>
      </ul>
    </div>
  );
}

function Confirmation({ booking }) {
  const confirmed = booking.status === 'confirmed';
  return (
    <section className="section section--ivory res" aria-live="polite">
      <div className="container container--narrow">
        <div className="confirm">
          <span className="confirm__icon"><Icon name="check" size={38} /></span>
          <p className="eyebrow">{confirmed ? 'Reservation confirmed' : 'Request received'}</p>
          <h1 className="h2">Thank you, {booking.guest.firstName}</h1>
          <p className="lead">
            {confirmed
              ? `Your stay at ${HOTEL.name} is confirmed. We have reserved your room and look forward to welcoming you.`
              : 'Your reservation request has been received. Our team will confirm it with you by email shortly.'}
          </p>
          <BookingDetails booking={booking} />
          <p className="muted confirm__note">
            Please keep your reference <strong>{booking.reference}</strong>. You will need it with your email address to view or cancel your booking. Payment is made at the hotel on arrival.
          </p>
          <div className="confirm__actions">
            <button type="button" className="btn btn--dark" onClick={() => window.print()}>
              <Icon name="print" size={16} /> Print confirmation
            </button>
            <Link to={`/manage-booking?reference=${booking.reference}&email=${encodeURIComponent(booking.guest.email)}`} className="btn btn--outline-dark">
              Manage booking
            </Link>
            <Link to="/" className="btn btn--outline-dark">Back to home</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- page */

export default function Reservations() {
  const [params] = useSearchParams();
  const today = todayISO();
  const preType = params.get('type') || '';
  const offer = params.get('offer') || '';

  const initial = useMemo(() => {
    const ci = params.get('checkIn');
    const co = params.get('checkOut');
    const valid = Boolean(ci && co && ci >= today && co > ci);
    const guests = Math.min(Math.max(Number.parseInt(params.get('guests'), 10) || 2, 1), 6);
    const checkIn = valid ? ci : today;
    return { fromUrl: valid, stay: { checkIn, checkOut: valid ? co : addDaysISO(checkIn, 2), guests: String(guests) } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [step, setStep] = useState(1);
  const [stay, setStay] = useState(initial.stay);
  const [stayErrors, setStayErrors] = useState({});
  const [avail, setAvail] = useState(null); // availability response plus a snapshot of the stay it was run for
  const [availStatus, setAvailStatus] = useState({ loading: false, error: '' });
  const [notice, setNotice] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [guest, setGuest] = useState({ firstName: '', lastName: '', email: '', phone: '', country: 'Nigeria', specialRequests: '', terms: false });
  const [errors, setErrors] = useState({});
  const [submit, setSubmit] = useState({ loading: false, error: '' });
  const [booking, setBooking] = useState(null);
  const topRef = useRef(null);
  const autoSelect = useRef(Boolean(preType));
  const firstRender = useRef(true);

  const selected = avail?.rooms.find((r) => r._id === selectedId && r.bookable) || null;
  const stale = Boolean(avail) && JSON.stringify(avail.stay) !== JSON.stringify(stay);
  const shownStay = avail && !stale ? avail.stay : stay;
  const nights = shownStay.checkIn && shownStay.checkOut ? nightsBetween(shownStay.checkIn, shownStay.checkOut) : 0;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step, booking]);

  const search = useCallback(
    async (s) => {
      const errs = validateStayFields(s, today);
      setStayErrors(errs);
      if (Object.keys(errs).length) return false;

      setAvailStatus({ loading: true, error: '' });
      try {
        const data = await api.get('/availability', { params: s });
        setAvail({ ...data, stay: { ...s } });
        setAvailStatus({ loading: false, error: '' });

        let next = 2;
        if (autoSelect.current) {
          // Arrived from a specific room's "Book Now": jump straight to details if it is free.
          const wanted = data.rooms.find((r) => r.slug === preType && r.bookable);
          if (wanted) {
            setSelectedId(wanted._id);
            next = 3;
          }
          autoSelect.current = false;
        }
        setStep(next);
        return true;
      } catch (err) {
        setAvailStatus({ loading: false, error: err.message });
        return false;
      }
    },
    [today, preType]
  );

  useEffect(() => {
    if (initial.fromUrl) search(initial.stay);
    // run once on arrival from the hero booking bar or a room page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStayField = (field) => (e) => {
    const value = e.target.value;
    setStayErrors((er) => ({ ...er, [field]: undefined, checkOut: field === 'checkIn' ? undefined : er.checkOut }));
    setStay((s) => {
      const next = { ...s, [field]: value };
      if (field === 'checkIn' && value && next.checkOut <= value) next.checkOut = addDaysISO(value, 1);
      return next;
    });
  };

  const setGuestField = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setGuest((g) => ({ ...g, [field]: value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };
  const blurGuestField = (field) => () => setErrors((er) => ({ ...er, [field]: validateGuest(guest)[field] }));

  const canGo = (n) => n === 1 || (n === 2 && avail && !stale) || (n === 3 && avail && !stale && selected);

  async function confirm(e) {
    e.preventDefault();
    const errs = validateGuest(guest);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    setSubmit({ loading: true, error: '' });
    try {
      const requests = [offer && `Package: ${offer}`, guest.specialRequests.trim()].filter(Boolean).join('. ');
      const res = await api.post('/bookings', {
        body: {
          roomTypeId: selected._id,
          checkIn: avail.stay.checkIn,
          checkOut: avail.stay.checkOut,
          guests: Number(avail.stay.guests),
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          country: guest.country,
          specialRequests: requests,
        },
      });
      setBooking(res.booking);
      setSubmit({ loading: false, error: '' });
    } catch (err) {
      if (err.status === 409) {
        // Someone else took the last room. Refresh availability and send the guest back to choose again.
        setSubmit({ loading: false, error: '' });
        await search(avail.stay);
        setNotice(err.message);
        setStep(2);
        return;
      }
      if (err.fieldErrors && Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors);
      setSubmit({ loading: false, error: err.message });
    }
  }

  if (booking) {
    return (
      <>
        <Seo title="Reservation confirmed" description="Your reservation at Royal Crest Hotel & Suites." noindex />
        <div ref={topRef} />
        <Confirmation booking={booking} />
      </>
    );
  }

  const field = (name, label, props = {}) => (
    <label className={`field ${errors[name] ? 'field--error' : ''}`}>
      <span className="field__label">{label}</span>
      <input
        className="input"
        value={guest[name]}
        onChange={setGuestField(name)}
        onBlur={blurGuestField(name)}
        aria-invalid={errors[name] ? 'true' : undefined}
        aria-describedby={errors[name] ? `${name}-err` : undefined}
        {...props}
      />
      {errors[name] && <span className="field__error" id={`${name}-err`}>{errors[name]}</span>}
    </label>
  );

  return (
    <>
      <Seo title="Reservations" description="Reserve your stay at Royal Crest Hotel & Suites, Lagos. Choose your dates, see live availability and book direct with no booking fees." />
      <div ref={topRef} />
      <header className="res-head">
        <div className="container">
          <p className="eyebrow eyebrow--light">Reservations</p>
          <h1>Reserve your stay</h1>
          <p>Choose your dates, pick your room and confirm in minutes. No payment is taken online.</p>
        </div>
      </header>

      <section className="section section--ivory res">
        <div className="container">
          <Stepper step={step} canGo={canGo} onGo={setStep} />
          {offer && (
            <p className="alert alert--info"><Icon name="star" size={16} /> Package selected: <strong>{offer}</strong>. We will add the inclusions to your booking.</p>
          )}

          <div className="res__grid">
            <div className="res__main">
              {/* ------------------------------------------------ Step 1 */}
              {step === 1 && (
                <form
                  className="panel"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    search(stay);
                  }}
                >
                  <h2 className="h3">When would you like to stay?</h2>
                  <div className="form__row">
                    <label className={`field ${stayErrors.checkIn ? 'field--error' : ''}`}>
                      <span className="field__label">Check-in</span>
                      <input className="input" type="date" min={today} value={stay.checkIn} onChange={setStayField('checkIn')} aria-invalid={stayErrors.checkIn ? 'true' : undefined} />
                      {stayErrors.checkIn && <span className="field__error">{stayErrors.checkIn}</span>}
                    </label>
                    <label className={`field ${stayErrors.checkOut ? 'field--error' : ''}`}>
                      <span className="field__label">Check-out</span>
                      <input className="input" type="date" min={addDaysISO(stay.checkIn || today, 1)} value={stay.checkOut} onChange={setStayField('checkOut')} aria-invalid={stayErrors.checkOut ? 'true' : undefined} />
                      {stayErrors.checkOut && <span className="field__error">{stayErrors.checkOut}</span>}
                    </label>
                  </div>
                  <label className="field">
                    <span className="field__label">Number of guests</span>
                    <select className="input" value={stay.guests} onChange={setStayField('guests')}>
                      {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{plural(n, 'guest')}</option>)}
                    </select>
                    <span className="field__hint">Travelling with more than six guests? <Link to="/contact?subject=Reservations" className="link">Contact us</Link> to arrange several rooms.</span>
                  </label>
                  {nights > 0 && !stayErrors.checkOut && <p className="panel__nights">{plural(nights, 'night')}</p>}
                  {availStatus.error && <p className="alert alert--error" role="alert">{availStatus.error}</p>}
                  <button type="submit" className="btn btn--gold btn--block" disabled={availStatus.loading}>
                    {availStatus.loading ? 'Checking availability…' : 'Check Availability'}
                  </button>
                </form>
              )}

              {/* ------------------------------------------------ Step 2 */}
              {step === 2 && avail && (
                <div>
                  <div className="res__intro">
                    <h2 className="h3">Choose your room</h2>
                    <p className="muted">
                      {formatDateLong(avail.stay.checkIn)} → {formatDateLong(avail.stay.checkOut)} · {plural(avail.nights, 'night')} · {plural(Number(avail.stay.guests), 'guest')}
                    </p>
                    <button type="button" className="link-btn" onClick={() => setStep(1)}>Change dates</button>
                  </div>
                  {notice && <p className="alert alert--error" role="alert">{notice}</p>}
                  {availStatus.error && <p className="alert alert--error" role="alert">{availStatus.error}</p>}
                  {!avail.rooms.some((r) => r.bookable) && (
                    <p className="alert alert--info" role="status">
                      We have no availability for those dates. Please try different dates, or <Link to="/contact?subject=Reservations" className="link">contact our team</Link>.
                    </p>
                  )}

                  <ul className="avail-list">
                    {avail.rooms.map((room) => {
                      const soldOut = room.available === 0;
                      const tooSmall = !room.fitsGuests;
                      return (
                        <li key={room._id} className={`avail-card ${room.bookable ? '' : 'is-disabled'} ${room.slug === preType ? 'is-preferred' : ''}`}>
                          <Img src={room.images?.[0]} alt={room.name} className="avail-card__img" w={700} />
                          <div className="avail-card__body">
                            <div className="avail-card__head">
                              <h3>{room.name}</h3>
                              {room.slug === preType && <span className="tag">Your choice</span>}
                            </div>
                            <p>{room.shortDescription}</p>
                            <ul className="avail-card__meta">
                              <li><Icon name="bed" size={16} /> {room.bedType}</li>
                              <li><Icon name="users" size={16} /> Up to {room.maxGuests}</li>
                              <li><Icon name="size" size={16} /> {room.sizeSqm} m²</li>
                            </ul>
                            <p className={`avail-card__status ${room.bookable ? (room.available <= 2 ? 'is-low' : 'is-ok') : 'is-no'}`}>
                              {tooSmall
                                ? `Sleeps up to ${room.maxGuests} guests. Choose a larger room.`
                                : soldOut
                                  ? 'Sold out for your dates'
                                  : room.available <= 2
                                    ? `Only ${plural(room.available, 'room')} left`
                                    : 'Available'}
                            </p>
                          </div>
                          <div className="avail-card__buy">
                            <span className="muted">{money(room.pricePerNight)} / night</span>
                            <strong>{money(room.pricing.total)}</strong>
                            <small>total for {plural(avail.nights, 'night')}, incl. taxes &amp; charges</small>
                            <button type="button" className="btn btn--gold btn--sm" disabled={!room.bookable} onClick={() => { setNotice(''); setSelectedId(room._id); setStep(3); }}>
                              {room.bookable ? 'Select Room' : 'Unavailable'}
                            </button>
                            <Link to={`/rooms/${room.slug}`} target="_blank" rel="noopener noreferrer" className="link link--small">View details</Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* ------------------------------------------------ Step 3 */}
              {step === 3 && selected && (
                <form className="panel" onSubmit={confirm} noValidate>
                  <h2 className="h3">Your details</h2>
                  <p className="muted">We will send your confirmation to the email address below.</p>
                  <div className="form__row">
                    {field('firstName', 'First name', { autoComplete: 'given-name' })}
                    {field('lastName', 'Last name', { autoComplete: 'family-name' })}
                  </div>
                  <div className="form__row">
                    {field('email', 'Email address', { type: 'email', autoComplete: 'email' })}
                    {field('phone', 'Phone number', { type: 'tel', autoComplete: 'tel', placeholder: '+234 800 000 0000' })}
                  </div>
                  <label className="field">
                    <span className="field__label">Country</span>
                    <input className="input" list="countries" value={guest.country} onChange={setGuestField('country')} autoComplete="country-name" />
                    <datalist id="countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
                  </label>
                  <label className="field">
                    <span className="field__label">Special requests (optional)</span>
                    <textarea className="input" rows="3" maxLength={400} value={guest.specialRequests} onChange={setGuestField('specialRequests')} placeholder="Late arrival, airport pick-up, celebrating something special…" />
                  </label>

                  <label className={`check ${errors.terms ? 'check--error' : ''}`}>
                    <input type="checkbox" checked={guest.terms} onChange={setGuestField('terms')} aria-invalid={errors.terms ? 'true' : undefined} />
                    <span>I agree to the booking conditions: check-in from {HOTEL.checkInTime}, check-out by {HOTEL.checkOutTime}, and payment at the hotel on arrival.</span>
                  </label>
                  {errors.terms && <span className="field__error">{errors.terms}</span>}

                  {submit.error && <p className="alert alert--error" role="alert">{submit.error}</p>}
                  <div className="panel__actions">
                    <button type="button" className="btn btn--outline-dark" onClick={() => setStep(2)} disabled={submit.loading}>
                      <Icon name="left" size={16} /> Back to rooms
                    </button>
                    <button type="submit" className="btn btn--gold" disabled={submit.loading}>
                      {submit.loading ? 'Confirming…' : `Confirm Reservation · ${money(selected.pricing.total)}`}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <aside className="res__side" aria-label="Booking summary">
              <Summary stay={shownStay} selected={step >= 3 || (step === 2 && selected) ? selected : null} nights={nights} />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
