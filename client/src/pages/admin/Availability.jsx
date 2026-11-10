import { useState } from 'react';
import Icon from '../../components/Icon';
import { ErrorState, Spinner } from '../../components/States';
import { PageHeader } from '../../components/admin/ui';
import { useApi } from '../../hooks/useApi';
import { addDaysISO, todayISO } from '../../utils/format';

const DAYS = 14;
const fmt = (iso, opts) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });

export default function Availability() {
  const [from, setFrom] = useState(todayISO());
  const { data, loading, error, reload } = useApi('/admin/availability', { auth: true, params: { from, days: DAYS } });

  return (
    <>
      <PageHeader
        title="Availability"
        subtitle="Rooms still free to sell, per category, for the next two weeks. Rooms in maintenance are excluded."
        actions={
          <div className="adm-datenav">
            <button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setFrom((f) => addDaysISO(f, -DAYS))} aria-label="Previous 14 days"><Icon name="left" size={16} /></button>
            <input className="input input--sm" type="date" value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} aria-label="Start date" />
            <button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setFrom(todayISO())}>Today</button>
            <button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setFrom((f) => addDaysISO(f, DAYS))} aria-label="Next 14 days"><Icon name="right" size={16} /></button>
          </div>
        }
      />

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Spinner label="Loading availability" />}

      {data && (
        <div className={`card card--flush ${loading ? 'is-loading' : ''}`}>
          <div className="table-wrap table-wrap--adm">
            <table className="avail-grid">
              <thead>
                <tr>
                  <th scope="col" className="avail-grid__type">Category</th>
                  {data.days.map((d) => (
                    <th scope="col" key={d} className={[0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay()) ? 'is-weekend' : ''}>
                      <span>{fmt(d, { weekday: 'short' })}</span>
                      <strong>{fmt(d, { day: 'numeric' })}</strong>
                      <small>{fmt(d, { month: 'short' })}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.roomTypes.map((t) => (
                  <tr key={t.id}>
                    <th scope="row" className="avail-grid__type">
                      {t.name}
                      <small>{t.sellable} sellable{t.unavailable ? ` · ${t.unavailable} out of service` : ''}</small>
                    </th>
                    {t.days.map((d) => {
                      const tone = t.sellable === 0 ? 'none' : d.available === 0 ? 'full' : d.available <= 1 || d.available / t.sellable <= 0.34 ? 'low' : 'ok';
                      return (
                        <td key={d.date} className={`cell cell--${tone}`} title={`${t.name}, ${fmt(d.date, { day: 'numeric', month: 'short' })}: ${d.available} free, ${d.booked} booked`}>
                          <strong>{d.available}</strong>
                          <small>{d.booked} booked</small>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="legend" aria-label="Legend">
            <li><i className="cell--ok" /> Good availability</li>
            <li><i className="cell--low" /> Limited</li>
            <li><i className="cell--full" /> Sold out</li>
          </ul>
        </div>
      )}
    </>
  );
}
