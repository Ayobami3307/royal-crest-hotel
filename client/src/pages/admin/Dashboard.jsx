import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { ErrorState, Spinner } from '../../components/States';
import { BarChart, compactMoney, PageHeader, StatCard } from '../../components/admin/ui';
import { CURRENCY } from '../../config';
import { useApi } from '../../hooks/useApi';
import { formatDate, money, STATUS_LABEL } from '../../utils/format';

const monthLabel = (key) => new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });

function BookingList({ items, empty, showRoom = true }) {
  if (!items.length) return <p className="adm-empty">{empty}</p>;
  return (
    <ul className="mini-list">
      {items.map((b) => (
        <li key={b._id}>
          <div>
            <strong>{b.guest.firstName} {b.guest.lastName}</strong>
            <small>
              {b.roomType?.name}{showRoom && b.room?.number ? ` · Room ${b.room.number}` : ''} · {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
            </small>
          </div>
          <span className={`badge badge--${b.status}`}>{STATUS_LABEL[b.status]}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard() {
  const { data, loading, error, reload } = useApi('/admin/stats', { auth: true });

  if (loading && !data) return <Spinner label="Loading statistics" />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} title="We couldn’t load the dashboard" />;

  const { totals, byStatus, monthly, byRoomType, arrivals, departures, recent } = data;
  const statusTotal = Math.max(Object.values(byStatus).reduce((a, b) => a + b, 0), 1);
  const maxType = Math.max(...byRoomType.map((t) => t.revenue), 1);

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Today’s activity and booking performance at a glance."
        actions={<button type="button" className="btn btn--outline-dark btn--sm" onClick={reload}><Icon name="refresh" size={16} /> Refresh</button>}
      />

      <div className="stat-grid">
        <StatCard icon="chart" label="Revenue (confirmed stays)" value={money(totals.revenue)} hint={`${totals.nightsSold} nights sold`} />
        <StatCard icon="calendar" label="Total bookings" value={totals.bookings} hint={`${byStatus.pending} awaiting confirmation`} />
        <StatCard icon="bed" label="Occupancy today" value={`${totals.occupancyRate}%`} hint={`${totals.occupiedToday} of ${totals.totalRooms} rooms`} />
        <StatCard icon="message" label="Unread messages" value={totals.unreadMessages} hint={<Link to="/admin/messages" className="link link--small">Open inbox</Link>} />
      </div>

      <div className="adm-grid">
        <section className="card card--wide">
          <h2>Revenue, last 6 months <small>by arrival month</small></h2>
          <BarChart
            label={`Monthly revenue in ${CURRENCY}`}
            data={monthly.map((m) => ({ label: monthLabel(m.month), value: m.revenue }))}
            format={(v) => compactMoney(v, CURRENCY)}
          />
        </section>

        <section className="card">
          <h2>Bookings by status</h2>
          <ul className="status-bars">
            {Object.entries(byStatus).map(([s, n]) => (
              <li key={s}>
                <span>{STATUS_LABEL[s]}</span>
                <span className="status-bars__track"><i className={`fill--${s}`} style={{ width: `${(n / statusTotal) * 100}%` }} /></span>
                <strong>{n}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Revenue by room category</h2>
          {byRoomType.length === 0 ? (
            <p className="adm-empty">No confirmed stays yet.</p>
          ) : (
            <ul className="status-bars status-bars--type">
              {byRoomType.map((t) => (
                <li key={t.name}>
                  <span>{t.name}</span>
                  <span className="status-bars__track"><i className="fill--gold" style={{ width: `${(t.revenue / maxType) * 100}%` }} /></span>
                  <strong>{compactMoney(t.revenue, CURRENCY)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>Arriving in the next 7 days</h2>
          <BookingList items={arrivals} empty="No arrivals scheduled this week." />
        </section>
        <section className="card">
          <h2>Departing today</h2>
          <BookingList items={departures} empty="No departures today." />
        </section>
        <section className="card card--wide">
          <h2>Latest reservations <Link to="/admin/bookings" className="link link--small">View all</Link></h2>
          <BookingList items={recent} empty="No bookings yet." showRoom={false} />
        </section>
      </div>
    </>
  );
}
