import { Link } from 'react-router-dom';
import CtaBand from '../components/CtaBand';
import Icon from '../components/Icon';
import Img from '../components/Img';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Seo from '../components/Seo';
import StatsRow from '../components/StatsRow';
import { TIMELINE, VALUES } from '../data/content';
import { IMG } from '../data/images';

export default function About() {
  return (
    <>
      <Seo
        title="About Us"
        description="The story of Royal Crest Hotel & Suites: 28 years of refined Nigerian hospitality, 27 rooms and suites and a team devoted to making every stay unforgettable."
      />
      <PageHero
        eyebrow="Our Story"
        title="About Royal Crest"
        subtitle="Twenty-eight years of quiet luxury, generous hospitality and a passion for getting the details right."
        image={IMG.lobby}
        crumb="About Us"
      />

      <section className="section section--ivory">
        <div className="container split">
          <Reveal className="split__media about-home__media">
            <Img src={IMG.exterior} alt="Royal Crest Hotel exterior" className="about-home__img about-home__img--a" w={1200} />
            <Img src={IMG.massage} alt="Spa treatment at Royal Crest" className="about-home__img about-home__img--b" w={800} />
          </Reveal>
          <div className="split__text">
            <SectionHeading
              align="left"
              eyebrow="Who we are"
              title="A family-run hotel with a world-class standard"
              text="Royal Crest began in 1998 with a simple idea from the Adeyemi family: build the hotel they wished existed in Lagos, one that felt like a beautifully run private home, with the service and polish of the world’s great hotels."
            />
            <Reveal delay={120}>
              <p className="prose">
                Today the hotel remains independently owned. We keep the property deliberately intimate, with just 27 rooms and
                suites, so that our team of more than 140 can know your name, your preferences and your favourite table.
                Whether you are with us for a board meeting, a wedding or a long-awaited weekend away, you will be cared for
                like family.
              </p>
              <Link to="/reservations" className="btn btn--dark mt-md">Reserve Your Stay</Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <SectionHeading light eyebrow="Our Philosophy" title="What we believe" />
          <div className="values">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 90} className="value">
                <span className="value__icon"><Icon name={v.icon} size={26} /></span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-lg"><StatsRow /></Reveal>
        </div>
      </section>

      <section className="section section--paper">
        <div className="container container--narrow">
          <SectionHeading eyebrow="Our Journey" title="Milestones along the way" />
          <ol className="timeline">
            {TIMELINE.map((t, i) => (
              <Reveal as="li" key={t.year} delay={i * 80} className="timeline__item">
                <span className="timeline__year">{t.year}</span>
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--ivory">
        <div className="container container--narrow center">
          <Reveal>
            <Icon name="star" size={28} className="gold" filled />
            <blockquote className="pull-quote">
              “Luxury is not about being noticed. It is about being looked after so well that you stop noticing anything but
              the people you are with.”
            </blockquote>
            <p className="pull-quote__by"><strong>Folake Adeyemi</strong><br />General Manager &amp; Second-generation Owner</p>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Come and experience Royal Crest" />
    </>
  );
}
