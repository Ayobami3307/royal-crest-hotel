import { useEffect } from 'react';
import { HOTEL } from '../config';

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Per-page <title>, description and social tags. Renders nothing. */
export default function Seo({ title, description, image, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${HOTEL.name}` : `${HOTEL.name} | Five-Star Luxury Hotel in Lagos`;
    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    if (image) setMeta('property', 'og:image', image);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, image, noindex]);
  return null;
}
