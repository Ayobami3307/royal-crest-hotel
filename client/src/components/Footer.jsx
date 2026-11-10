import { Link } from 'react-router-dom';
import Icon from './Icon';
import Logo from './Logo';
import { HOTEL, NAV_LINKS } from '../config';

export default function Footer() {
  const socials = Object.entries(HOTEL.social).filter(([, url]) => url);

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>
            A five-star address on Victoria Island, where warm Nigerian hospitality meets understated, modern luxury.
          </p>
          {socials.length > 0 && (
            <div className="footer__social">
              {socials.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${HOTEL.short} on ${name}`}>
                  <Icon name={name} size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Explore" className="footer__col">
          <h4>Explore</h4>
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to}>{l.label}</Link>
          ))}
        </nav>

        <div className="footer__col">
          <h4>Contact</h4>
          <p><Icon name="pin" size={16} /> <span>{HOTEL.address.join(', ')}</span></p>
          <p><Icon name="phone" size={16} /> <a href={HOTEL.phoneHref}>{HOTEL.phone}</a></p>
          <p><Icon name="mail" size={16} /> <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a></p>
          <p><Icon name="clock" size={16} /> <span>Reception open 24 hours</span></p>
        </div>

        <nav aria-label="Guest services" className="footer__col">
          <h4>Guest Services</h4>
          <Link to="/reservations">Make a reservation</Link>
          <Link to="/manage-booking">Manage my booking</Link>
          <Link to="/contact">Contact reservations</Link>
          <Link to="/contact?subject=Events%20%26%20Conferences">Events &amp; weddings</Link>
          <Link to="/admin/login" className="footer__staff">Staff login</Link>
        </nav>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} {HOTEL.name}. All rights reserved.</p>
          <p>Check-in from {HOTEL.checkInTime} · Check-out by {HOTEL.checkOutTime}</p>
        </div>
      </div>
    </footer>
  );
}
