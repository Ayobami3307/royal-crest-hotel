import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client';
import Icon from '../../components/Icon';
import { ErrorState, Spinner } from '../../components/States';
import { ConfirmModal, Modal, PageHeader, Pagination, useDebounced, useToast } from '../../components/admin/ui';
import { useApi } from '../../hooks/useApi';
import { formatDate, formatDateTime, money, plural, STATUS_LABEL } from '../../utils/format';

const STATUSES = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

// Which status changes make sense from each state (mirrors a real front-desk workflow).
const NEXT = {
  pending: [['confirmed', 'Confirm booking', 'gold'], ['cancelled', 'Cancel booking', 'danger']],
  confirmed: [['checked_in', 'Check in guest', 'gold'], ['cancelled', 'Cancel booking', 'danger']],
  checked_in: [['checked_out', 'Check out guest', 'gold']],
  checked_out: [],
  cancelled: [['pending', 'Reopen as pending', 'outline-dark']],
};

function BookingModal({ id, onClose, onChanged }) {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(`/admin/bookings/${id}`, { auth: true });
  const rooms = useApi('/admin/rooms', { auth: true });
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [roomId, setRoomId] = useState('');
  const b = data?.booking;

  async function patch(body, success) {
    setBusy(true);
    try {
      await api.patch(`/admin/bookings/${id}`, { body, auth: true });
      toast(success);
      setConfirm(null);
      setRoomId('');
      await reload();
      onChanged();
    } catch (err) {
      toast(err.message, 'error');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  const sameType = (rooms.data?.rooms || []).filter(
    (r) => b && String(r.roomType?._id) === String(b.roomType?._id) && r.status === 'available' && r._id !== b.room?._id
  );

  return (
    <>
      <Modal title={b ? `Booking ${b.reference}` : 'Booking'} onClose={onClose} wide>
        {loading && !b && <Spinner />}
        {error && !b && <ErrorState error={error} onRetry={reload} />}
        {b && (
          <>
            <div className="bk-top">
              <span className={`badge badge--${b.status}`}>{STATUS_LABEL[b.status]}</span>
              <span className="muted">Booked {formatDateTime(b.createdAt)}</span>
            </div>
            <dl className="detail-grid detail-grid--adm">
              <div><dt>Guest</dt><dd>{b.guest.firstName} {b.guest.lastName}</dd></div>
              <div><dt>Contact</dt><dd><a href={`mailto:${b.guest.email}`} className="link">{b.guest.email}</a><small>{b.guest.phone}{b.guest.country ? ` · ${b.guest.country}` : ''}</small></dd></div>
              <div><dt>Room</dt><dd>{b.roomType?.name}<small>Room {b.room?.number}{b.room?.floor !== undefined ? ` · Floor ${b.room.floor}` : ''}</small></dd></div>
              <div><dt>Stay</dt><dd>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}<small>{plural(b.nights, 'night')} · {plural(b.guests, 'guest')}</small></dd></div>
              <div><dt>Total</dt><dd>{money(b.pricing?.total)}<small>{money(b.pricing?.subtotal)} + {money(b.pricing?.serviceCharge)} service + {money(b.pricing?.vat)} VAT</small></dd></div>
              {b.specialRequests && <div className="detail-grid__wide"><dt>Special requests</dt><dd>{b.specialRequests}</dd></div>}
            </dl>

            {b.status !== 'cancelled' && b.status !== 'checked_out' && sameType.length > 0 && (
              <div className="bk-move">
                <label className="field">
                  <span className="field__label">Move to another {b.roomType?.name} room</span>
                  <span className="bk-move__row">
                    <select className="input input--sm" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                      <option value="">Choose a room…</option>
                      {sameType.map((r) => <option key={r._id} value={r._id}>Room {r.number} · Floor {r.floor}</option>)}
                    </select>
                    <button type="button" className="btn btn--outline-dark btn--sm" disabled={!roomId || busy} onClick={() => patch({ roomId }, 'Booking moved to the new room.')}>
                      Move
                    </button>
                  </span>
                </label>
              </div>
            )}

            <div className="bk-actions">
              {NEXT[b.status].map(([status, label, tone]) => (
                <button
                  key={status}
                  type="button"
                  className={`btn btn--sm btn--${tone}`}
                  disabled={busy}
                  onClick={() => (status === 'cancelled' ? setConfirm(status) : patch({ status }, `Booking marked as ${STATUS_LABEL[status].toLowerCase()}.`))}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </Modal>
      {confirm && (
        <ConfirmModal
          title="Cancel this booking?"
          message="The room will be released for these dates. The guest is not notified automatically."
          confirmLabel="Yes, cancel booking"
          danger
          busy={busy}
          onConfirm={() => patch({ status: 'cancelled' }, 'Booking cancelled.')}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

export default function Bookings() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const search = useDebounced(q);
  const { data, loading, error, reload } = useApi('/admin/bookings', { auth: true, params: { q: search, status, page, limit: 12 } });

  useEffect(() => setPage(1), [search, status]);
  const changed = useCallback(() => reload(), [reload]);
  const bookings = data?.bookings || [];

  return (
    <>
      <PageHeader title="Bookings" subtitle="Search, review and manage every reservation." />

      <div className="adm-filters">
        <label className="adm-search">
          <Icon name="search" size={18} />
          <input type="search" placeholder="Search reference, name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
        </label>
        <div className="adm-pills" role="group" aria-label="Filter by status">
          <button type="button" className={status === '' ? 'is-active' : ''} onClick={() => setStatus('')}>All</button>
          {STATUSES.map((s) => (
            <button key={s} type="button" className={status === s ? 'is-active' : ''} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>
          ))}
        </div>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Spinner label="Loading bookings" />}

      {data && (
        <div className={`card card--flush ${loading ? 'is-loading' : ''}`}>
          <div className="table-wrap table-wrap--adm">
            <table className="adm-table">
              <thead>
                <tr><th>Reference</th><th>Guest</th><th>Room</th><th>Stay</th><th className="num">Total</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td data-label="Reference"><strong>{b.reference}</strong></td>
                    <td data-label="Guest">{b.guest.firstName} {b.guest.lastName}<small>{b.guest.email}</small></td>
                    <td data-label="Room">{b.roomType?.name}<small>Room {b.room?.number}</small></td>
                    <td data-label="Stay">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}<small>{plural(b.nights, 'night')}</small></td>
                    <td data-label="Total" className="num">{money(b.pricing?.total)}</td>
                    <td data-label="Status"><span className={`badge badge--${b.status}`}>{STATUS_LABEL[b.status]}</span></td>
                    <td><button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setOpenId(b._id)}>Manage</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <p className="adm-empty">No bookings match those filters.</p>}
          </div>
          <div className="card__foot">
            <span className="muted">{data.total} {data.total === 1 ? 'booking' : 'bookings'}</span>
            <Pagination page={data.page} pages={data.pages} onPage={setPage} />
          </div>
        </div>
      )}

      {openId && <BookingModal id={openId} onClose={() => setOpenId(null)} onChanged={changed} />}
    </>
  );
}
