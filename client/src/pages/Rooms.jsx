import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CtaBand from '../components/CtaBand';
import PageHero from '../components/PageHero';
import RoomCard from '../components/RoomCard';
import Seo from '../components/Seo';
import { EmptyState, ErrorState, RoomSkeletons } from '../components/States';
import { IMG } from '../data/images';
import { useApi } from '../hooks/useApi';

const SORTS = {
  recommended: { label: 'Recommended', fn: (a, b) => a.order - b.order },
  priceAsc: { label: 'Price: low to high', fn: (a, b) => a.pricePerNight - b.pricePerNight },
  priceDesc: { label: 'Price: high to low', fn: (a, b) => b.pricePerNight - a.pricePerNight },
  capacity: { label: 'Largest capacity', fn: (a, b) => b.maxGuests - a.maxGuests },
};

export default function Rooms() {
  const { data, loading, error, reload } = useApi('/room-types');
  const [sort, setSort] = useState('recommended');
  const [guests, setGuests] = useState('1');

  const rooms = useMemo(() => {
    const list = (data?.roomTypes || []).filter((r) => r.maxGuests >= Number(guests));
    return [...list].sort(SORTS[sort].fn);
  }, [data, sort, guests]);

  return (
    <>
      <Seo
        title="Rooms & Suites"
        description="Choose from Standard and Deluxe Rooms, Executive Suites and the 160 m² Presidential Suite at Royal Crest Hotel & Suites, Lagos. View photos, facilities and nightly rates."
      />
      <PageHero
        eyebrow="Accommodation"
        title="Rooms & Suites"
        subtitle="Four categories of refined accommodation, each with plush bedding, marble bathrooms and a view worth waking up to."
        image={IMG.room2}
        crumb="Rooms & Suites"
      />

      <section className="section section--paper">
        <div className="container">
          <div className="toolbar">
            <p className="toolbar__count" aria-live="polite">
              {loading ? 'Loading rooms…' : `${rooms.length} ${rooms.length === 1 ? 'category' : 'categories'} available`}
            </p>
            <div className="toolbar__filters">
              <label>
                <span>Guests</span>
                <select className="input input--sm" value={guests} onChange={(e) => setGuests(e.target.value)}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n === 1 ? 'Any' : `${n}+`}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Sort by</span>
                <select className="input input--sm" value={sort} onChange={(e) => setSort(e.target.value)}>
                  {Object.entries(SORTS).map(([key, s]) => (
                    <option key={key} value={key}>{s.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {loading && <RoomSkeletons count={2} />}
          {error && <ErrorState error={error} onRetry={reload} title="We couldn’t load our rooms" />}
          {!loading && !error && rooms.length === 0 && (
            <EmptyState title="No rooms match those filters">
              Try a smaller party size, or <Link to="/contact" className="link">contact our team</Link> to arrange connecting rooms.
            </EmptyState>
          )}
          <div className="stack">
            {!loading && !error && rooms.map((room, i) => <RoomCard key={room._id} room={room} layout="row" index={i} />)}
          </div>
        </div>
      </section>

      <CtaBand title="Not sure which room is right for you?" text="Our reservations team is on hand day and night to help you choose, arrange connecting rooms or plan a special occasion." />
    </>
  );
}
