import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { addDaysISO, todayISO } from '../utils/format';

/** Check-in / check-out / guests / room picker shown in the hero. Hands off to /reservations. */
export default function BookingBar({ roomTypes = [] }) {
  const navigate = useNavigate();
  const today = todayISO();
  const [form, setForm] = useState({ checkIn: today, checkOut: addDaysISO(today, 1), guests: '2', type: '' });
  const [error, setError] = useState('');

  const update = (field) => (e) => {
    const value = e.target.value;
    setError('');
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Keep check-out after check-in
      if (field === 'checkIn' && value && next.checkOut <= value) next.checkOut = addDaysISO(value, 1);
      return next;
    });
  };

  function submit(e) {
    e.preventDefault();
    if (!form.checkIn || !form.checkOut) return setError('Please choose your check-in and check-out dates.');
    if (form.checkIn < today) return setError('Check-in cannot be in the past.');
    if (form.checkOut <= form.checkIn) return setError('Check-out must be after check-in.');
    const params = new URLSearchParams({ checkIn: form.checkIn, checkOut: form.checkOut, guests: form.guests });
    if (form.type) params.set('type', form.type);
    navigate(`/reservations?${params}`);
  }

  return (
    <form className="bbar" onSubmit={submit} noValidate aria-label="Check room availability">
      <label className="bbar__field">
        <span>Check-in</span>
        <input type="date" value={form.checkIn} min={today} onChange={update('checkIn')} required />
      </label>
      <label className="bbar__field">
        <span>Check-out</span>
        <input type="date" value={form.checkOut} min={form.checkIn ? addDaysISO(form.checkIn, 1) : today} onChange={update('checkOut')} required />
      </label>
      <label className="bbar__field">
        <span>Guests</span>
        <select value={form.guests} onChange={update('guests')}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
          ))}
        </select>
      </label>
      <label className="bbar__field">
        <span>Room</span>
        <select value={form.type} onChange={update('type')}>
          <option value="">Any room</option>
          {roomTypes.map((r) => (
            <option key={r._id} value={r.slug}>{r.name}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn--gold bbar__submit">
        Check Availability <Icon name="arrow" size={16} />
      </button>
      {error && <p className="bbar__error" role="alert">{error}</p>}
    </form>
  );
}
