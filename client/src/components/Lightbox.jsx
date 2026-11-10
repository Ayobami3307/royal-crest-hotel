import { useEffect, useRef } from 'react';
import Icon from './Icon';

/** Full-screen image viewer with keyboard (Esc, ←, →) and button navigation. */
export default function Lightbox({ items, index, onClose, onChange }) {
  const closeRef = useRef(null);
  const item = items[index];
  const count = items.length;

  useEffect(() => {
    const prev = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onChange((index - 1 + count) % count);
      if (e.key === 'ArrowRight') onChange((index + 1) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, count, onChange, onClose]);

  if (!item) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}>
      <button ref={closeRef} type="button" className="lightbox__btn lightbox__close" onClick={onClose} aria-label="Close">
        <Icon name="close" size={26} />
      </button>
      <button type="button" className="lightbox__btn lightbox__prev" onClick={(e) => { e.stopPropagation(); onChange((index - 1 + count) % count); }} aria-label="Previous image">
        <Icon name="left" size={28} />
      </button>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={item.full} alt={item.alt} />
        <figcaption>
          {item.alt} <span>{index + 1} / {count}</span>
        </figcaption>
      </figure>
      <button type="button" className="lightbox__btn lightbox__next" onClick={(e) => { e.stopPropagation(); onChange((index + 1) % count); }} aria-label="Next image">
        <Icon name="right" size={28} />
      </button>
    </div>
  );
}
