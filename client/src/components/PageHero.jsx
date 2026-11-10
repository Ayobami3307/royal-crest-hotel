import { Link } from 'react-router-dom';
import Img from './Img';

export default function PageHero({ eyebrow, title, subtitle, image, crumb }) {
  return (
    <header className="page-hero">
      <Img src={image} alt="" className="page-hero__bg" w={2000} eager />
      <div className="page-hero__shade" />
      <div className="container page-hero__inner">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{crumb || title}</span>
        </nav>
        {eyebrow && <p className="eyebrow eyebrow--light">{eyebrow}</p>}
        <h1 className="page-hero__title">{title}</h1>
        {subtitle && <p className="page-hero__sub">{subtitle}</p>}
      </div>
    </header>
  );
}
