import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';
import Logo from './Logo';
import { NAV_LINKS } from '../config';

// Pages that open with a photographic hero, so the bar starts transparent on them.
const HERO_PREFIXES = ['/about', '/rooms', '/restaurant', '/facilities', '/gallery', '/contact'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const hasHero = pathname === '/' || HERO_PREFIXES.some((p) => pathname.startsWith(p));
  const solid = scrolled || open || !hasHero;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={`nav ${solid ? 'nav--solid' : ''}`}>
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="container nav__inner">
        <Link to="/" className="nav__brand" aria-label="Royal Crest Hotel & Suites, home">
          <Logo />
        </Link>

        <nav className="nav__links" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/reservations" className="btn btn--gold btn--sm nav__cta">Book Now</Link>

        <button
          type="button"
          className="nav__toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <Icon name={open ? 'close' : 'menu'} size={26} />
        </button>
      </div>

      <div id="mobile-menu" className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              tabIndex={open ? 0 : -1}
              style={{ '--i': i }}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/reservations" tabIndex={open ? 0 : -1} className="btn btn--gold btn--block">Reserve Your Stay</Link>
      </div>
    </header>
  );
}
