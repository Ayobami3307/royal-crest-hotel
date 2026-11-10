import { Link } from 'react-router-dom';
import Img from './Img';
import Reveal from './Reveal';
import { IMG } from '../data/images';
import { HOTEL } from '../config';

export default function CtaBand({ title = 'Your stay awaits', text = 'Book direct for our best available rates, complimentary Wi-Fi and a welcome drink on arrival.' }) {
  return (
    <section className="cta-band">
      <Img src={IMG.exterior} alt="" className="cta-band__bg" w={2000} />
      <div className="cta-band__shade" />
      <Reveal className="container cta-band__inner">
        <p className="eyebrow eyebrow--light">Reserve</p>
        <h2 className="h2">{title}</h2>
        <p className="lead">{text}</p>
        <div className="cta-band__actions">
          <Link to="/reservations" className="btn btn--gold">Book Your Stay</Link>
          <a href={HOTEL.phoneHref} className="btn btn--outline">Call {HOTEL.phone}</a>
        </div>
      </Reveal>
    </section>
  );
}
