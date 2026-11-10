import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Icon from '../components/Icon';
import Img from '../components/Img';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Seo from '../components/Seo';
import { DINING_HOURS, MENU } from '../data/content';
import { IMG } from '../data/images';
import { EMAIL_RE } from '../utils/validate';
import { formatDateLong, money, todayISO } from '../utils/format';

const TIMES = ['12:00', '12:30', '13:00', '13:30', '14:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

function TableForm() {
  const today = todayISO();
  const empty = { name: '', email: '', phone: '', date: '', time: '19:30', guests: '2', notes: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ sending: false, done: '', error: '' });

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = 'Please enter your name.';
    if (!EMAIL_RE.test(form.email)) er.email = 'Please enter a valid email address.';
    if (!form.date) er.date = 'Please choose a date.';
    else if (form.date < today) er.date = 'Please choose a date in the future.';
    setErrors(er);
    if (Object.keys(er).length) return;

    setStatus({ sending: true, done: '', error: '' });
    try {
      const message = [
        `Table reservation request for ${form.guests} ${Number(form.guests) === 1 ? 'guest' : 'guests'}`,
        `Date: ${formatDateLong(form.date)} at ${form.time}`,
        form.notes.trim() && `Notes: ${form.notes.trim()}`,
      ].filter(Boolean).join('\n');
      await api.post('/contact', { body: { name: form.name, email: form.email, phone: form.phone, subject: 'Table reservation', message } });
      setStatus({ sending: false, error: '', done: `Thank you, ${form.name.split(' ')[0]}. Our restaurant team will confirm your table by email shortly.` });
      setForm(empty);
    } catch (err) {
      setStatus({ sending: false, done: '', error: err.message });
    }
  }

  if (status.done) {
    return (
      <div className="form-success" role="status">
        <Icon name="check" size={32} />
        <h3>Request received</h3>
        <p>{status.done}</p>
        <button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setStatus({ sending: false, done: '', error: '' })}>Make another request</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="form">
      <div className="form__row">
        <label className={`field ${errors.name ? 'field--error' : ''}`}>
          <span className="field__label">Full name</span>
          <input className="input" value={form.name} onChange={set('name')} autoComplete="name" />
          {errors.name && <span className="field__error">{errors.name}</span>}
        </label>
        <label className={`field ${errors.email ? 'field--error' : ''}`}>
          <span className="field__label">Email</span>
          <input className="input" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </label>
      </div>
      <div className="form__row form__row--3">
        <label className={`field ${errors.date ? 'field--error' : ''}`}>
          <span className="field__label">Date</span>
          <input className="input" type="date" min={today} value={form.date} onChange={set('date')} />
          {errors.date && <span className="field__error">{errors.date}</span>}
        </label>
        <label className="field">
          <span className="field__label">Time</span>
          <select className="input" value={form.time} onChange={set('time')}>
            {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Guests</span>
          <select className="input" value={form.guests} onChange={set('guests')}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <label className="field">
        <span className="field__label">Phone (optional)</span>
        <input className="input" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
      </label>
      <label className="field">
        <span className="field__label">Dietary needs or occasion (optional)</span>
        <textarea className="input" rows="3" value={form.notes} onChange={set('notes')} />
      </label>
      {status.error && <p className="alert alert--error" role="alert">{status.error}</p>}
      <button type="submit" className="btn btn--gold btn--block" disabled={status.sending}>
        {status.sending ? 'Sending…' : 'Request a Table'}
      </button>
    </form>
  );
}

export default function Restaurant() {
  const categories = Object.keys(MENU);
  const [tab, setTab] = useState(categories[0]);

  return (
    <>
      <Seo
        title="Restaurant & Bar"
        description="Dine at Crest, our contemporary West African and European restaurant, or enjoy handcrafted cocktails at the Aurum Bar. View our menus and request a table at Royal Crest Hotel, Lagos."
      />
      <PageHero
        eyebrow="Restaurant & Bar"
        title="Crest Dining & Aurum Bar"
        subtitle="Seasonal cooking, rare spirits and an atmosphere made for lingering."
        image={IMG.diningRoom}
        crumb="Restaurant"
      />

      <section className="section section--ivory">
        <div className="container two-up">
          <Reveal className="venue">
            <Img src={IMG.restaurant} alt="Crest Dining restaurant" w={1200} />
            <div className="venue__body">
              <p className="eyebrow eyebrow--small">Fine dining</p>
              <h2 className="h3">Crest Dining</h2>
              <p>Our chefs celebrate West African produce through a contemporary European lens: suya-spiced tuna tartare, lamb with jollof barley and soufflés finished at the table. The cellar holds over 400 labels.</p>
            </div>
          </Reveal>
          <Reveal delay={120} className="venue">
            <Img src={IMG.bar} alt="Aurum Bar" w={1200} />
            <div className="venue__body">
              <p className="eyebrow eyebrow--small">Cocktails &amp; lounge</p>
              <h2 className="h3">Aurum Bar</h2>
              <p>A moody, gold-flecked lounge pouring rare whiskies and original cocktails built on local ingredients such as zobo, tamarind and grains of selim. Live jazz every Friday from 8:00 pm.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--dark menu-section" id="menu">
        <div className="container container--narrow">
          <SectionHeading light eyebrow="Signature menu" title="A taste of Crest" text="A selection from our current menus. Dishes change with the seasons. V indicates vegetarian." />
          <div className="tabs" role="tablist" aria-label="Menu categories">
            {categories.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={tab === c} className={tab === c ? 'is-active' : ''} onClick={() => setTab(c)}>
                {c}
              </button>
            ))}
          </div>
          <ul className="menu" role="tabpanel" key={tab}>
            {MENU[tab].map((item) => (
              <li key={item.name} className="menu__item">
                <div className="menu__head">
                  <h3>{item.name}{item.tag && <sup>{item.tag}</sup>}</h3>
                  <span className="menu__dots" aria-hidden="true" />
                  <strong>{money(item.price)}</strong>
                </div>
                <p>{item.desc}</p>
              </li>
            ))}
          </ul>
          <p className="menu__note">Please inform your server of any allergies or dietary requirements.</p>
        </div>
      </section>

      <section className="section section--paper">
        <div className="container reserve-grid">
          <div>
            <SectionHeading align="left" eyebrow="Opening hours" title="When to join us" />
            <Reveal>
              <ul className="hours">
                {DINING_HOURS.map((h) => (
                  <li key={h.label}><span>{h.label}</span><span className="hours__line" aria-hidden="true" /><strong>{h.time}</strong></li>
                ))}
              </ul>
              <div className="callout">
                <Icon name="wine" size={22} />
                <p><strong>Private dining.</strong> Our private dining room seats up to 14 guests, perfect for celebrations and business dinners. <Link to="/contact?subject=Restaurant" className="link">Enquire here</Link>.</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={120} className="panel">
            <h2 className="h3">Reserve a table</h2>
            <p className="muted">Tell us when you would like to dine and we will confirm by email.</p>
            <TableForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
