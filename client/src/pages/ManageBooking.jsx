import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import BookingDetails from '../components/BookingDetails';
import Seo from '../components/Seo';
import { EMAIL_RE } from '../utils/validate';

export default function ManageBooking() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ reference: params.get('reference') || '', email: params.get('email') || '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ loading: false, error: '', booking: null });
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState('');
  const autoRan = useRef(false);

  async function lookup(values = form) {
    const er = {};
    if (!values.reference.trim()) er.reference = 'Enter the reference from your confirmation, e.g. RC-AB12CD.';
    if (!EMAIL_RE.test(values.email.trim())) er.email = 'Enter the email address used for the booking.';
    setErrors(er);
    if (Object.keys(er).length) return;

    setState({ loading: true, error: '', booking: null });
    setConfirming(false);
    setNotice('');
    try {
      const res = await api.get('/bookings/lookup', { params: { reference: values.reference.trim(), email: values.email.trim() } });
      setState({ loading: false, error: '', booking: res.booking });
    } catch (err) {
      setState({ loading: false, error: err.message, booking: null });
    }
  }

  useEffect(() => {
    // Arriving from the confirmation page with both values already known
    if (!autoRan.current && form.reference && form.email) {
      autoRan.current = true;
      lookup(form);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cancel() {
    setCancelling(true);
    try {
      const res = await api.post('/bookings/cancel', { body: { reference: state.booking.reference, email: form.email.trim() } });
      setState((s) => ({ ...s, booking: res.booking }));
      setNotice('Your booking has been cancelled. We hope to welcome you another time.');
      setConfirming(false);
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
      setConfirming(false);
    } finally {
      setCancelling(false);
    }
  }

  const { booking, loading, error } = state;
  const cancellable = booking && ['pending', 'confirmed'].includes(booking.status) && new Date(booking.checkIn) >= new Date(new Date().toDateString());

  return (
    <>
      <Seo title="Manage Booking" description="Look up or cancel your Royal Crest Hotel reservation with your booking reference and email address." noindex />
      <header className="res-head">
        <div className="container">
          <p className="eyebrow eyebrow--light">Guest services</p>
          <h1>Manage your booking</h1>
          <p>Enter your reference and email to view or cancel an upcoming reservation.</p>
        </div>
      </header>

      <section className="section section--ivory res">
        <div className="container container--narrow">
          <form className="panel" noValidate onSubmit={(e) => { e.preventDefault(); lookup(); }}>
            <div className="form__row">
              <label className={`field ${errors.reference ? 'field--error' : ''}`}>
                <span className="field__label">Booking reference</span>
                <input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value.toUpperCase() })} placeholder="RC-AB12CD" autoCapitalize="characters" />
                {errors.reference && <span className="field__error">{errors.reference}</span>}
              </label>
              <label className={`field ${errors.email ? 'field--error' : ''}`}>
                <span className="field__label">Email address</span>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                {errors.email && <span className="field__error">{errors.email}</span>}
              </label>
            </div>
            {error && <p className="alert alert--error" role="alert">{error}</p>}
            <button type="submit" className="btn btn--gold btn--block" disabled={loading}>{loading ? 'Searching…' : 'Find My Booking'}</button>
          </form>

          {booking && (
            <div className="panel mt-md">
              {notice && <p className="alert alert--success" role="status">{notice}</p>}
              <BookingDetails booking={booking} />
              {cancellable && !confirming && (
                <button type="button" className="btn btn--outline-dark mt-md" onClick={() => setConfirming(true)}>Cancel this booking</button>
              )}
              {confirming && (
                <div className="confirm-box" role="alertdialog" aria-label="Confirm cancellation">
                  <p><strong>Cancel booking {booking.reference}?</strong> This cannot be undone.</p>
                  <div className="row-actions">
                    <button type="button" className="btn btn--danger btn--sm" onClick={cancel} disabled={cancelling}>{cancelling ? 'Cancelling…' : 'Yes, cancel booking'}</button>
                    <button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setConfirming(false)} disabled={cancelling}>Keep my booking</button>
                  </div>
                </div>
              )}
              {!cancellable && !['cancelled'].includes(booking.status) && (
                <p className="muted mt-md">To change this booking, please <Link to="/contact?subject=Reservations" className="link">contact our reservations team</Link>.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
