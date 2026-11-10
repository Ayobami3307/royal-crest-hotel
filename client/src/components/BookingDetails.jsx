import { formatDateLong, money, plural, STATUS_LABEL } from '../utils/format';

/** Read-only booking summary used on the confirmation screen and the "Manage booking" page. */
export default function BookingDetails({ booking }) {
  const p = booking.pricing || {};
  return (
    <div className="booking-details">
      <div className="booking-details__top">
        <div>
          <span className="muted">Booking reference</span>
          <strong className="booking-details__ref">{booking.reference}</strong>
        </div>
        <span className={`badge badge--${booking.status}`}>{STATUS_LABEL[booking.status] || booking.status}</span>
      </div>

      <dl className="detail-grid">
        <div><dt>Guest</dt><dd>{booking.guest.firstName} {booking.guest.lastName}</dd></div>
        <div><dt>Room</dt><dd>{booking.roomType}</dd></div>
        <div><dt>Check-in</dt><dd>{formatDateLong(booking.checkIn)}<small>from 2:00 PM</small></dd></div>
        <div><dt>Check-out</dt><dd>{formatDateLong(booking.checkOut)}<small>by 12:00 noon</small></dd></div>
        <div><dt>Stay</dt><dd>{plural(booking.nights, 'night')}, {plural(booking.guests, 'guest')}</dd></div>
        <div><dt>Contact</dt><dd>{booking.guest.email}<small>{booking.guest.phone}</small></dd></div>
        {booking.specialRequests && <div className="detail-grid__wide"><dt>Special requests</dt><dd>{booking.specialRequests}</dd></div>}
      </dl>

      <dl className="breakdown">
        <div><dt>{money(p.pricePerNight)} × {plural(p.nights || booking.nights, 'night')}</dt><dd>{money(p.subtotal)}</dd></div>
        <div><dt>Service charge (5%)</dt><dd>{money(p.serviceCharge)}</dd></div>
        <div><dt>VAT (7.5%)</dt><dd>{money(p.vat)}</dd></div>
        <div className="breakdown__total"><dt>Total payable at the hotel</dt><dd>{money(p.total)}</dd></div>
      </dl>
    </div>
  );
}
