import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import Icon from '../components/Icon';
import MapEmbed from '../components/MapEmbed';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Seo from '../components/Seo';
import { HOTEL } from '../config';
import { FAQ } from '../data/content';
import { IMG } from '../data/images';
import { EMAIL_RE } from '../utils/validate';

const SUBJECTS = ['General enquiry', 'Reservations', 'Events & Conferences', 'Restaurant', 'Spa & Wellness', 'Feedback'];

export default function Contact() {
  const [params] = useSearchParams();
  const requested = params.get('subject');
  const subjects = requested && !SUBJECTS.includes(requested) ? [requested, ...SUBJECTS] : SUBJECTS;

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: requested || SUBJECTS[0], message: '' });
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
    if (!EMAIL_RE.test(form.email.trim())) er.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 10) er.message = 'Please write a message of at least 10 characters.';
    setErrors(er);
    if (Object.keys(er).length) return;

    setStatus({ sending: true, done: '', error: '' });
    try {
      const res = await api.post('/contact', { body: form });
      setStatus({ sending: false, error: '', done: res.message });
      setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors);
      setStatus({ sending: false, done: '', error: err.message });
    }
  }

  return (
    <>
      <Seo
        title="Contact Us"
        description="Contact Royal Crest Hotel & Suites in Victoria Island, Lagos. Call, email or send us a message for reservations, events and enquiries. Reception is open 24 hours."
      />
      <PageHero eyebrow="Get in touch" title="Contact Us" subtitle="Our guest relations team replies to every message within one working day." image={IMG.lobby} crumb="Contact" />

      <section className="section section--ivory">
        <div className="container contact-grid">
          <div className="contact-info">
            <SectionHeading align="left" eyebrow="Reach us" title="We would love to hear from you" />
            <Reveal className="info-cards">
              <div className="info-card"><Icon name="pin" size={22} /><div><h3>Address</h3><p>{HOTEL.address.join(', ')}</p></div></div>
              <div className="info-card"><Icon name="phone" size={22} /><div><h3>Reservations</h3><p><a href={HOTEL.phoneHref}>{HOTEL.phone}</a></p></div></div>
              <div className="info-card"><Icon name="mail" size={22} /><div><h3>Email</h3><p><a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a></p></div></div>
              <div className="info-card"><Icon name="clock" size={22} /><div><h3>Hours</h3><p>Reception and room service: 24 hours<br />Reservations desk: 7:00 am – 10:00 pm</p></div></div>
            </Reveal>
          </div>

          <Reveal delay={120} className="panel">
            {status.done ? (
              <div className="form-success" role="status">
                <Icon name="check" size={32} />
                <h3>Message sent</h3>
                <p>{status.done}</p>
                <button type="button" className="btn btn--outline-dark btn--sm" onClick={() => setStatus({ sending: false, done: '', error: '' })}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="form" aria-label="Contact form">
                <h2 className="h3">Send us a message</h2>
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
                <div className="form__row">
                  <label className="field">
                    <span className="field__label">Phone (optional)</span>
                    <input className="input" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
                  </label>
                  <label className="field">
                    <span className="field__label">Subject</span>
                    <select className="input" value={form.subject} onChange={set('subject')}>
                      {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
                <label className={`field ${errors.message ? 'field--error' : ''}`}>
                  <span className="field__label">Message</span>
                  <textarea className="input" rows="6" value={form.message} onChange={set('message')} />
                  {errors.message && <span className="field__error">{errors.message}</span>}
                </label>
                {status.error && <p className="alert alert--error" role="alert">{status.error}</p>}
                <button type="submit" className="btn btn--gold btn--block" disabled={status.sending}>
                  {status.sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <section className="section section--paper">
        <div className="container container--narrow">
          <SectionHeading eyebrow="Find us" title="Location & directions" text="Royal Crest sits on Crest Avenue in the heart of Victoria Island, 35 minutes from Murtala Muhammed International Airport (subject to traffic)." />
          <Reveal><MapEmbed className="map--tall" /></Reveal>
        </div>
      </section>

      <section className="section section--ivory">
        <div className="container container--narrow">
          <SectionHeading eyebrow="Good to know" title="Frequently asked questions" />
          <Reveal className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}<Icon name="down" size={20} /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
