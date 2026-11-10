import { Link } from 'react-router-dom';
import CtaBand from '../components/CtaBand';
import Icon from '../components/Icon';
import Img from '../components/Img';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Seo from '../components/Seo';
import { FACILITIES } from '../data/content';
import { IMG } from '../data/images';

const EVENT_SPACES = [
  { space: 'Crest Ballroom', size: '520 m²', use: 'Weddings, galas, conferences', capacity: 'Up to 400 seated · 500 theatre' },
  { space: 'Aurum Room', size: '180 m²', use: 'Receptions, product launches', capacity: 'Up to 120 seated · 150 theatre' },
  { space: 'Boardrooms I–III', size: '40–70 m²', use: 'Meetings, interviews, workshops', capacity: '8–24 boardroom style' },
];

export default function Facilities() {
  return (
    <>
      <Seo
        title="Hotel Facilities"
        description="Rooftop infinity pool, restaurant and bar, 24-hour fitness centre, spa and wellness, conference and event halls, free Wi-Fi, 24-hour room service and airport transfers at Royal Crest Hotel, Lagos."
      />
      <PageHero
        eyebrow="Facilities & Services"
        title="Everything within reach"
        subtitle="Eight reasons to linger a little longer, from the rooftop pool to the 24-hour concierge."
        image={IMG.poolWide}
        crumb="Facilities"
      />

      <nav className="quick-nav" aria-label="Jump to a facility">
        <div className="container">
          {FACILITIES.map((f) => (
            <a key={f.id} href={`#${f.id}`}>
              <Icon name={f.icon} size={18} /> {f.title}
            </a>
          ))}
        </div>
      </nav>

      {FACILITIES.map((f, i) => (
        <section key={f.id} id={f.id} className={`section facility ${i % 2 === 0 ? 'section--ivory' : 'section--paper'}`}>
          <div className={`container split ${i % 2 === 1 ? 'split--reverse' : ''}`}>
            <Reveal className="split__media facility__media">
              <Img src={f.image} alt={f.title} w={1400} />
            </Reveal>
            <div className="split__text">
              <Reveal>
                <span className="facility__icon"><Icon name={f.icon} size={28} /></span>
                <h2 className="h2">{f.title}</h2>
                <p className="facility__hours"><Icon name="clock" size={16} /> {f.hours}</p>
                <p className="prose">{f.text}</p>
                <ul className="ticks">
                  {f.features.map((feat) => (
                    <li key={feat}><Icon name="check" size={16} /> {feat}</li>
                  ))}
                </ul>
                {f.cta && <Link to={f.cta.to} className="btn btn--dark mt-md">{f.cta.label}</Link>}
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      <section className="section section--dark">
        <div className="container container--narrow">
          <SectionHeading light eyebrow="Meetings & celebrations" title="Event spaces at a glance" text="Our events team will tailor layout, catering, décor and technology to your occasion." />
          <Reveal>
            <div className="table-wrap">
              <table className="table table--dark">
                <thead>
                  <tr><th scope="col">Space</th><th scope="col">Size</th><th scope="col">Ideal for</th><th scope="col">Capacity</th></tr>
                </thead>
                <tbody>
                  {EVENT_SPACES.map((s) => (
                    <tr key={s.space}>
                      <th scope="row">{s.space}</th>
                      <td>{s.size}</td>
                      <td>{s.use}</td>
                      <td>{s.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="center mt-md">
              <Link to="/contact?subject=Events%20%26%20Conferences" className="btn btn--gold">Plan Your Event</Link>
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Stay with us and enjoy it all" />
    </>
  );
}
