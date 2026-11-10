import { useEffect, useRef, useState } from 'react';
import { photo } from '../data/images';

/**
 * Responsive image with a graceful fallback: while loading (or if the URL fails) a champagne-gold
 * crest on a dark gradient is shown, so a broken photo never leaves an ugly hole in the layout.
 * `src` may be a full URL or an Unsplash photo id from data/images.js.
 */
export default function Img({ src, alt = '', className = '', w = 1200, eager = false, ...rest }) {
  const url = !src ? '' : src.startsWith('photo-') ? photo(src, w) : src;
  const [status, setStatus] = useState(url ? 'loading' : 'failed');
  const ref = useRef(null);

  useEffect(() => {
    setStatus(url ? 'loading' : 'failed');
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) setStatus('ok');
  }, [url]);

  return (
    <div className={`img ${className}`} data-status={status}>
      {status !== 'ok' && (
        <div className="img__placeholder" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M12 44h40l-3-20-9 9-8-14-8 14-9-9z" />
            <path d="M14 50h36" />
          </svg>
        </div>
      )}
      {url && status !== 'failed' && (
        <img
          ref={ref}
          src={url}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('failed')}
          {...rest}
        />
      )}
    </div>
  );
}
