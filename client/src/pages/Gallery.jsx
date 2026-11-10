import { useMemo, useState } from 'react';
import CtaBand from '../components/CtaBand';
import Img from '../components/Img';
import Lightbox from '../components/Lightbox';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { GALLERY, GALLERY_CATEGORIES } from '../data/content';
import { IMG } from '../data/images';

export default function Gallery() {
  const [category, setCategory] = useState('All');
  const [open, setOpen] = useState(null);
  const items = useMemo(() => (category === 'All' ? GALLERY : GALLERY.filter((g) => g.category === category)), [category]);

  return (
    <>
      <Seo
        title="Gallery"
        description="Photo gallery of Royal Crest Hotel & Suites: rooms and suites, the rooftop pool, Crest Dining, the spa, event spaces and our Victoria Island home."
      />
      <PageHero eyebrow="Gallery" title="A closer look" subtitle="Rooms, dining, the spa and the pool. Browse by category and tap any image to enlarge." image={IMG.hero[0]} crumb="Gallery" />

      <section className="section section--paper">
        <div className="container">
          <div className="tabs tabs--light" role="tablist" aria-label="Filter photos">
            {GALLERY_CATEGORIES.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={category === c} className={category === c ? 'is-active' : ''} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>

          <ul className="masonry">
            {items.map((g, i) => (
              <li key={g.src} className="masonry__item">
                <button type="button" onClick={() => setOpen(i)} aria-label={`Enlarge: ${g.alt}`}>
                  <Img src={g.thumb} alt={g.alt} w={900} />
                  <span className="masonry__cap">{g.category}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {open !== null && <Lightbox items={items} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
      <CtaBand title="See it for yourself" />
    </>
  );
}
