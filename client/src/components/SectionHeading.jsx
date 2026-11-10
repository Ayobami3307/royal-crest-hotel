import Reveal from './Reveal';

export default function SectionHeading({ eyebrow, title, text, align = 'center', light = false }) {
  return (
    <Reveal className={`section-heading section-heading--${align} ${light ? 'section-heading--light' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h2">{title}</h2>
      {text && <p className="lead">{text}</p>}
    </Reveal>
  );
}
