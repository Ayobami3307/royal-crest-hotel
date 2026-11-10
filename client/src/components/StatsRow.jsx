import CountUp from './CountUp';
import { STATS } from '../data/content';

export default function StatsRow() {
  return (
    <dl className="stats">
      {STATS.map((s) => (
        <div key={s.label} className="stats__item">
          <dt>
            <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
          </dt>
          <dd>{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}
