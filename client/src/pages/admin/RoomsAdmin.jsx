import { useState } from 'react';
import { api } from '../../api/client';
import Icon from '../../components/Icon';
import { ErrorState, Spinner } from '../../components/States';
import { ConfirmModal, Modal, PageHeader, useToast } from '../../components/admin/ui';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { money } from '../../utils/format';

const ROOM_STATUS = { available: 'In service', maintenance: 'Maintenance', out_of_service: 'Out of service' };
const lines = (v) => (Array.isArray(v) ? v.join('\n') : v || '');

/* ------------------------------------------------------- category form */

function CategoryForm({ initial, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(initial?._id);
  const [f, setF] = useState({
    name: initial?.name || '',
    shortDescription: initial?.shortDescription || '',
    description: initial?.description || '',
    pricePerNight: initial?.pricePerNight ?? '',
    bedType: initial?.bedType || '',
    maxGuests: initial?.maxGuests ?? 2,
    sizeSqm: initial?.sizeSqm ?? 30,
    view: initial?.view || '',
    facilities: lines(initial?.facilities),
    images: lines(initial?.images),
    order: initial?.order ?? 0,
    featured: initial?.featured || false,
    isActive: initial?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Enter a category name.';
    if (!f.description.trim()) er.description = 'Enter a description.';
    if (!(Number(f.pricePerNight) > 0)) er.pricePerNight = 'Enter a price above zero.';
    if (!f.bedType.trim()) er.bedType = 'Enter the bed type.';
    if (!(Number(f.maxGuests) >= 1 && Number(f.maxGuests) <= 12)) er.maxGuests = 'Between 1 and 12.';
    const badImage = f.images.split('\n').map((s) => s.trim()).filter(Boolean).find((u) => !/^https?:\/\//i.test(u));
    if (badImage) er.images = 'Each image must be a full URL starting with https://';
    setErrors(er);
    if (Object.keys(er).length) return;

    setBusy(true);
    setFormError('');
    try {
      const body = { ...f, pricePerNight: Number(f.pricePerNight), maxGuests: Number(f.maxGuests), sizeSqm: Number(f.sizeSqm), order: Number(f.order) };
      if (editing) await api.put(`/admin/room-types/${initial._id}`, { body, auth: true });
      else await api.post('/admin/room-types', { body, auth: true });
      toast(editing ? 'Category updated.' : 'Category created.');
      onSaved();
      onClose();
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  }

  const text = (k, label, props = {}) => (
    <label className={`field ${errors[k] ? 'field--error' : ''}`}>
      <span className="field__label">{label}</span>
      <input className="input" value={f[k]} onChange={set(k)} {...props} />
      {errors[k] && <span className="field__error">{errors[k]}</span>}
    </label>
  );

  return (
    <Modal
      title={editing ? `Edit ${initial.name}` : 'New room category'}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn--outline-dark btn--sm" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" form="category-form" className="btn btn--gold btn--sm" disabled={busy}>{busy ? 'Saving…' : 'Save category'}</button>
        </>
      }
    >
      <form id="category-form" className="form" onSubmit={submit} noValidate>
        <div className="form__row">
          {text('name', 'Category name', { maxLength: 80 })}
          {text('bedType', 'Bed type', { placeholder: '1 King bed' })}
        </div>
        <div className="form__row form__row--4">
          {text('pricePerNight', 'Price / night', { type: 'number', min: 1, step: '0.01', inputMode: 'decimal' })}
          {text('maxGuests', 'Max guests', { type: 'number', min: 1, max: 12 })}
          {text('sizeSqm', 'Size (m²)', { type: 'number', min: 10 })}
          {text('order', 'Display order', { type: 'number' })}
        </div>
        {text('view', 'View', { placeholder: 'City skyline view' })}
        {text('shortDescription', 'Short description (shown on cards)', { maxLength: 220 })}
        <label className={`field ${errors.description ? 'field--error' : ''}`}>
          <span className="field__label">Full description</span>
          <textarea className="input" rows="4" maxLength={2000} value={f.description} onChange={set('description')} />
          {errors.description && <span className="field__error">{errors.description}</span>}
        </label>
        <div className="form__row">
          <label className="field">
            <span className="field__label">Facilities (one per line)</span>
            <textarea className="input" rows="6" value={f.facilities} onChange={set('facilities')} />
          </label>
          <label className={`field ${errors.images ? 'field--error' : ''}`}>
            <span className="field__label">Image URLs (one per line)</span>
            <textarea className="input" rows="6" value={f.images} onChange={set('images')} placeholder="https://…" />
            {errors.images ? <span className="field__error">{errors.images}</span> : <span className="field__hint">The first image is the cover photo.</span>}
          </label>
        </div>
        <div className="adm-checks">
          <label className="check"><input type="checkbox" checked={f.featured} onChange={set('featured')} /><span>Feature on the homepage</span></label>
          <label className="check"><input type="checkbox" checked={f.isActive} onChange={set('isActive')} /><span>Visible and bookable on the website</span></label>
        </div>
        {formError && <p className="alert alert--error" role="alert">{formError}</p>}
      </form>
    </Modal>
  );
}

/* ---------------------------------------------------------- room form */

function RoomForm({ initial, types, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(initial?._id);
  const [f, setF] = useState({
    number: initial?.number || '',
    floor: initial?.floor ?? 1,
    roomType: initial?.roomType?._id || initial?.roomType || types[0]?._id || '',
    status: initial?.status || 'available',
    notes: initial?.notes || '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (!f.number.trim()) er.number = 'Enter the room number.';
    if (!f.roomType) er.roomType = 'Choose a category.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setFormError('');
    try {
      const body = { ...f, floor: Number(f.floor) };
      if (editing) await api.put(`/admin/rooms/${initial._id}`, { body, auth: true });
      else await api.post('/admin/rooms', { body, auth: true });
      toast(editing ? 'Room updated.' : 'Room added.');
      onSaved();
      onClose();
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal
      title={editing ? `Edit room ${initial.number}` : 'Add a room'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--outline-dark btn--sm" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" form="room-form" className="btn btn--gold btn--sm" disabled={busy}>{busy ? 'Saving…' : 'Save room'}</button>
        </>
      }
    >
      <form id="room-form" className="form" onSubmit={submit} noValidate>
        <div className="form__row">
          <label className={`field ${errors.number ? 'field--error' : ''}`}>
            <span className="field__label">Room number</span>
            <input className="input" value={f.number} onChange={set('number')} maxLength={20} />
            {errors.number && <span className="field__error">{errors.number}</span>}
          </label>
          <label className="field">
            <span className="field__label">Floor</span>
            <input className="input" type="number" min="0" max="60" value={f.floor} onChange={set('floor')} />
          </label>
        </div>
        <div className="form__row">
          <label className={`field ${errors.roomType ? 'field--error' : ''}`}>
            <span className="field__label">Category</span>
            <select className="input" value={f.roomType} onChange={set('roomType')}>
              {types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            {errors.roomType && <span className="field__error">{errors.roomType}</span>}
          </label>
          <label className="field">
            <span className="field__label">Status</span>
            <select className="input" value={f.status} onChange={set('status')}>
              {Object.entries(ROOM_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span className="field__label">Notes (internal)</span>
          <textarea className="input" rows="3" maxLength={300} value={f.notes} onChange={set('notes')} placeholder="e.g. Connecting door to 305" />
        </label>
        {formError && <p className="alert alert--error" role="alert">{formError}</p>}
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------ price edit */

function PriceCell({ type, canEdit, onSaved }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(type.pricePerNight));
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    const n = Number(value);
    if (!(n > 0)) return toast('Enter a price above zero.', 'error');
    if (n === type.pricePerNight) return setEditing(false);
    setBusy(true);
    try {
      await api.patch(`/admin/room-types/${type._id}/price`, { body: { pricePerNight: n }, auth: true });
      toast(`${type.name} is now ${money(n)} per night.`);
      setEditing(false);
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <span className="price-cell">
        <strong>{money(type.pricePerNight)}</strong>
        {canEdit && (
          <button type="button" className="icon-btn" onClick={() => { setValue(String(type.pricePerNight)); setEditing(true); }} aria-label={`Change price for ${type.name}`}>
            <Icon name="edit" size={16} />
          </button>
        )}
      </span>
    );
  }
  return (
    <form className="price-cell price-cell--edit" onSubmit={save}>
      <input className="input input--sm" type="number" min="1" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} aria-label={`New price for ${type.name}`} autoFocus />
      <button type="submit" className="icon-btn icon-btn--ok" disabled={busy} aria-label="Save price"><Icon name="check" size={16} /></button>
      <button type="button" className="icon-btn" onClick={() => setEditing(false)} disabled={busy} aria-label="Cancel"><Icon name="close" size={16} /></button>
    </form>
  );
}

/* ----------------------------------------------------------------- page */

export default function RoomsAdmin() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('categories');
  const types = useApi('/admin/room-types', { auth: true });
  const rooms = useApi('/admin/rooms', { auth: true });
  const [modal, setModal] = useState(null); // {kind:'category'|'room', item?}
  const [del, setDel] = useState(null); // {kind, item}
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');

  const typeList = types.data?.roomTypes || [];
  const roomList = (rooms.data?.rooms || []).filter((r) => !filter || String(r.roomType?._id) === filter);
  const reloadAll = () => {
    types.reload();
    rooms.reload();
  };

  async function remove() {
    setBusy(true);
    try {
      await api.del(`/admin/${del.kind === 'category' ? 'room-types' : 'rooms'}/${del.item._id}`, { auth: true });
      toast(del.kind === 'category' ? 'Category deleted.' : 'Room deleted.');
      setDel(null);
      reloadAll();
    } catch (err) {
      toast(err.message, 'error');
      setDel(null);
    } finally {
      setBusy(false);
    }
  }

  async function quickStatus(room, status) {
    try {
      await api.put(`/admin/rooms/${room._id}`, { body: { number: room.number, floor: room.floor, roomType: room.roomType._id, status, notes: room.notes }, auth: true });
      toast(`Room ${room.number} set to ${ROOM_STATUS[status].toLowerCase()}.`);
      rooms.reload();
    } catch (err) {
      toast(err.message, 'error');
      rooms.reload();
    }
  }

  return (
    <>
      <PageHeader
        title="Rooms & Rates"
        subtitle={isAdmin ? 'Manage categories, individual rooms and nightly prices.' : 'View categories and rooms. Only administrators can make changes.'}
        actions={
          isAdmin && (
            <button type="button" className="btn btn--gold btn--sm" onClick={() => setModal({ kind: tab === 'categories' ? 'category' : 'room' })} disabled={tab === 'rooms' && typeList.length === 0}>
              <Icon name="plus" size={16} /> {tab === 'categories' ? 'New category' : 'Add room'}
            </button>
          )
        }
      />

      <div className="adm-pills adm-pills--tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'categories'} className={tab === 'categories' ? 'is-active' : ''} onClick={() => setTab('categories')}>Categories ({typeList.length})</button>
        <button type="button" role="tab" aria-selected={tab === 'rooms'} className={tab === 'rooms' ? 'is-active' : ''} onClick={() => setTab('rooms')}>Individual rooms ({rooms.data?.rooms.length ?? 0})</button>
      </div>

      {tab === 'categories' && (
        <>
          {types.error && <ErrorState error={types.error} onRetry={types.reload} />}
          {types.loading && !types.data && <Spinner label="Loading categories" />}
          {types.data && (
            <div className="card card--flush">
              <div className="table-wrap table-wrap--adm">
                <table className="adm-table">
                  <thead><tr><th>Category</th><th>Bed</th><th className="num">Guests</th><th className="num">Rooms</th><th>Price / night</th><th>Website</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {typeList.map((t) => (
                      <tr key={t._id}>
                        <td data-label="Category"><strong>{t.name}</strong><small>{t.sizeSqm} m² · {t.view || 'No view set'}</small></td>
                        <td data-label="Bed">{t.bedType}</td>
                        <td data-label="Guests" className="num">{t.maxGuests}</td>
                        <td data-label="Rooms" className="num">{t.roomCount}</td>
                        <td data-label="Price / night"><PriceCell type={t} canEdit={isAdmin} onSaved={types.reload} /></td>
                        <td data-label="Website">
                          <span className={`badge ${t.isActive ? 'badge--confirmed' : 'badge--cancelled'}`}>{t.isActive ? 'Live' : 'Hidden'}</span>
                          {t.featured && <span className="badge badge--pending adm-gap">Featured</span>}
                        </td>
                        <td className="adm-actions">
                          {isAdmin && (
                            <>
                              <button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setModal({ kind: 'category', item: t })}>Edit</button>
                              <button type="button" className="icon-btn icon-btn--danger" aria-label={`Delete ${t.name}`} onClick={() => setDel({ kind: 'category', item: t })}><Icon name="trash" size={17} /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {typeList.length === 0 && <p className="adm-empty">No categories yet.</p>}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'rooms' && (
        <>
          <div className="adm-filters">
            <label className="field adm-select">
              <span className="field__label">Category</span>
              <select className="input input--sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">All categories</option>
                {typeList.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </label>
          </div>
          {rooms.error && <ErrorState error={rooms.error} onRetry={rooms.reload} />}
          {rooms.loading && !rooms.data && <Spinner label="Loading rooms" />}
          {rooms.data && (
            <div className="card card--flush">
              <div className="table-wrap table-wrap--adm">
                <table className="adm-table">
                  <thead><tr><th>Room</th><th>Category</th><th className="num">Floor</th><th>Tonight</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {roomList.map((r) => (
                      <tr key={r._id}>
                        <td data-label="Room"><strong>{r.number}</strong>{r.notes && <small>{r.notes}</small>}</td>
                        <td data-label="Category">{r.roomType?.name}</td>
                        <td data-label="Floor" className="num">{r.floor}</td>
                        <td data-label="Tonight">
                          {r.status !== 'available' ? <span className="muted">-</span> : r.occupiedToday ? <>Occupied<small>{r.currentGuest} · until {r.departsOn}</small></> : <span className="ok-text">Vacant</span>}
                        </td>
                        <td data-label="Status">
                          {isAdmin ? (
                            <select className={`input input--sm status-select status-select--${r.status}`} value={r.status} onChange={(e) => quickStatus(r, e.target.value)} aria-label={`Status of room ${r.number}`}>
                              {Object.entries(ROOM_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                          ) : ROOM_STATUS[r.status]}
                        </td>
                        <td className="adm-actions">
                          {isAdmin && (
                            <>
                              <button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setModal({ kind: 'room', item: r })}>Edit</button>
                              <button type="button" className="icon-btn icon-btn--danger" aria-label={`Delete room ${r.number}`} onClick={() => setDel({ kind: 'room', item: r })}><Icon name="trash" size={17} /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {roomList.length === 0 && <p className="adm-empty">No rooms found.</p>}
              </div>
            </div>
          )}
        </>
      )}

      {modal?.kind === 'category' && <CategoryForm initial={modal.item} onClose={() => setModal(null)} onSaved={reloadAll} />}
      {modal?.kind === 'room' && <RoomForm initial={modal.item} types={typeList} onClose={() => setModal(null)} onSaved={reloadAll} />}
      {del && (
        <ConfirmModal
          title={del.kind === 'category' ? `Delete ${del.item.name}?` : `Delete room ${del.item.number}?`}
          message={del.kind === 'category' ? 'This permanently removes the category. Categories with rooms or booking history cannot be deleted.' : 'This permanently removes the room. Rooms with booking history cannot be deleted; set them out of service instead.'}
          confirmLabel="Delete"
          danger
          busy={busy}
          onConfirm={remove}
          onClose={() => setDel(null)}
        />
      )}
    </>
  );
}
