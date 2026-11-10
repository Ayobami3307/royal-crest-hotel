import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../Icon';

/* ------------------------------------------------------------------ Toasts */

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const seq = useRef(0);

  const push = useCallback((message, type = 'success') => {
    const id = ++seq.current;
    setItems((list) => [...list, { id, message, type }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), type === 'error' ? 6500 : 3800);
  }, []);

  const value = useMemo(() => push, [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <Icon name={t.type === 'error' ? 'alert' : 'check'} size={18} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------- Modal */

/** Accessible dialog: focus moves in, Esc / backdrop click closes, focus returns to the trigger. */
export function Modal({ title, onClose, children, footer, wide = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    document.body.style.overflow = 'hidden';
    const first = ref.current?.querySelector('input, select, textarea, button:not(.modal__close)') || ref.current;
    first?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !ref.current) return;
      // keep Tab inside the dialog
      const focusable = ref.current.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)');
      if (!focusable.length) return;
      const [a, z] = [focusable[0], focusable[focusable.length - 1]];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={ref} tabIndex={-1}>
        <header className="modal__head">
          <h2>{title}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={22} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onClose }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--outline-dark btn--sm" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className={`btn btn--sm ${danger ? 'btn--danger' : 'btn--gold'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}

/* ----------------------------------------------------------------- Layout bits */

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="adm-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="adm-head__actions">{actions}</div>}
    </div>
  );
}

export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <button type="button" className="btn btn--outline-dark btn--sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <Icon name="left" size={16} /> Previous
      </button>
      <span>Page {page} of {pages}</span>
      <button type="button" className="btn btn--outline-dark btn--sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next <Icon name="right" size={16} />
      </button>
    </nav>
  );
}

export function StatCard({ label, value, hint, icon }) {
  return (
    <div className="stat-card">
      <span className="stat-card__icon"><Icon name={icon} size={22} /></span>
      <div>
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
        {hint && <small>{hint}</small>}
      </div>
    </div>
  );
}

/** Simple accessible bar chart (SVG-free, so it scales and prints well). */
export function BarChart({ data, format, label }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bars" role="img" aria-label={label}>
      {data.map((d) => (
        <div className="bars__col" key={d.label} title={`${d.label}: ${format(d.value)}`}>
          <span className="bars__value">{d.value ? format(d.value) : ''}</span>
          <span className="bars__bar" style={{ '--h': `${Math.max((d.value / max) * 100, d.value ? 3 : 0)}%` }} />
          <span className="bars__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** Compact money for chart labels: 1.2M, 340K. */
export const compactMoney = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);
