import Icon from './Icon';

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'Something went wrong' }) {
  return (
    <div className="state state--error" role="alert">
      <Icon name="alert" size={28} />
      <h3>{title}</h3>
      <p>{error?.message || 'Please try again in a moment.'}</p>
      {onRetry && (
        <button type="button" className="btn btn--outline-dark btn--sm" onClick={onRetry}>
          <Icon name="refresh" size={16} /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="state state--empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function RoomSkeletons({ count = 3 }) {
  return (
    <div className="grid grid--3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="room-card room-card--skeleton" key={i}>
          <div className="skeleton skeleton--img" />
          <div className="room-card__body">
            <div className="skeleton skeleton--line" style={{ width: '60%' }} />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line" style={{ width: '80%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
