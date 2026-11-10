import { HOTEL } from '../config';

export default function MapEmbed({ className = '' }) {
  return (
    <div className={`map ${className}`}>
      <iframe
        title={`Map showing ${HOTEL.name}`}
        src={`https://www.google.com/maps?q=${encodeURIComponent(HOTEL.mapQuery)}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
