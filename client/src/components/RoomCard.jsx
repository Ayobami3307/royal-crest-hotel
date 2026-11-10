import { Link } from 'react-router-dom';
import Icon from './Icon';
import Img from './Img';
import Reveal from './Reveal';
import { money } from '../utils/format';

/** layout="card" for grids, layout="row" for the full-width alternating list on /rooms. */
export default function RoomCard({ room, layout = 'card', index = 0 }) {
  const details = `/rooms/${room.slug}`;
  const book = `/reservations?type=${room.slug}`;

  return (
    <Reveal
      as="article"
      delay={(index % 3) * 100}
      className={`room-card room-card--${layout} ${layout === 'row' && index % 2 === 1 ? 'room-card--flip' : ''}`}
    >
      <Link to={details} className="room-card__media" aria-label={`View ${room.name}`} tabIndex={-1}>
        <Img src={room.images?.[0]} alt={`${room.name} at Royal Crest Hotel`} w={1200} />
        <span className="room-card__price">
          <small>From</small>
          <strong>{money(room.pricePerNight)}</strong>
          <small>/ night</small>
        </span>
      </Link>

      <div className="room-card__body">
        <p className="eyebrow eyebrow--small">{room.view || 'Luxury accommodation'}</p>
        <h3 className="room-card__title">
          <Link to={details}>{room.name}</Link>
        </h3>
        <p className="room-card__text">{room.shortDescription || room.description}</p>

        <ul className="room-card__meta">
          <li><Icon name="bed" size={18} /> {room.bedType}</li>
          <li><Icon name="users" size={18} /> Up to {room.maxGuests} guests</li>
          <li><Icon name="size" size={18} /> {room.sizeSqm} m²</li>
        </ul>

        {layout === 'row' && room.facilities?.length > 0 && (
          <ul className="chips">
            {room.facilities.slice(0, 6).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}

        <div className="room-card__actions">
          <Link to={details} className="btn btn--outline-dark btn--sm">View Details</Link>
          <Link to={book} className="btn btn--gold btn--sm">Book Now</Link>
        </div>
      </div>
    </Reveal>
  );
}
