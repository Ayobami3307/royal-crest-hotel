import { useState } from 'react';
import { ErrorState, Spinner } from '../../components/States';
import Icon from '../../components/Icon';
import { Modal, PageHeader, useDebounced } from '../../components/admin/ui';
import { useApi } from '../../hooks/useApi';
import { formatDate, money, plural, STATUS_LABEL } from '../../utils/format';

function History({ customer, onClose }) {
  const { data, loading, error, reload } = useApi('/admin/customers/bookings', { auth: true, params: { email: customer.email } });
  return (
    <Modal title={`${customer.firstName} ${customer.lastName}`} onClose={onClose} wide>
      <dl className="detail-grid detail-grid--adm">
        <div><dt>Email</dt><dd><a className="link" href={`mailto:${customer.email}`}>{customer.email}</a></dd></div>
        <div><dt>Phone</dt><dd><a className="link" href={`tel:${customer.phone}`}>{customer.phone}</a>{customer.country && <small>{customer.country}</small>}</dd></div>
        <div><dt>Lifetime spend</dt><dd>{money(customer.totalSpent)}<small>{plural(customer.nights, 'night')} across {plural(customer.bookings, 'booking')}</small></dd></div>
      </dl>
      <h3 className="adm-sub">Booking history</h3>
      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <ul className="mini-list">
          {data.bookings.map((b) => (
            <li key={b._id}>
              <div>
                <strong>{b.reference} · {b.roomType?.name}</strong>
                <small>{formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {money(b.pricing?.total)}</small>
              </div>
              <span className={`badge badge--${b.status}`}>{STATUS_LABEL[b.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export default function Customers() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const search = useDebounced(q);
  const { data, loading, error, reload } = useApi('/admin/customers', { auth: true, params: { q: search } });
  const customers = data?.customers || [];

  return (
    <>
      <PageHeader title="Guests" subtitle="Everyone who has booked with you, with their stay history and spend." />
      <div className="adm-filters">
        <label className="adm-search">
          <Icon name="search" size={18} />
          <input type="search" placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search guests" />
        </label>
      </div>
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Spinner label="Loading guests" />}
      {data && (
        <div className={`card card--flush ${loading ? 'is-loading' : ''}`}>
          <div className="table-wrap table-wrap--adm">
            <table className="adm-table">
              <thead><tr><th>Guest</th><th>Phone</th><th>Country</th><th className="num">Bookings</th><th className="num">Nights</th><th className="num">Total spent</th><th>Last stay</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.email}>
                    <td data-label="Guest"><strong>{c.firstName} {c.lastName}</strong><small>{c.email}</small></td>
                    <td data-label="Phone">{c.phone}</td>
                    <td data-label="Country">{c.country || '-'}</td>
                    <td data-label="Bookings" className="num">{c.bookings}</td>
                    <td data-label="Nights" className="num">{c.nights}</td>
                    <td data-label="Total spent" className="num">{money(c.totalSpent)}</td>
                    <td data-label="Last stay">{formatDate(c.lastStay)}</td>
                    <td><button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setOpen(c)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 && <p className="adm-empty">No guests found.</p>}
          </div>
        </div>
      )}
      {open && <History customer={open} onClose={() => setOpen(null)} />}
    </>
  );
}
