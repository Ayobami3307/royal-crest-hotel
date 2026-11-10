import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="The page you are looking for could not be found." noindex />
      <section className="section section--dark notfound">
        <div className="container center">
          <p className="notfound__code">404</p>
          <h1 className="h2">This page has checked out</h1>
          <p className="lead">The page you are looking for does not exist or has moved. Let us help you find your way back.</p>
          <div className="row-actions row-actions--center">
            <Link to="/" className="btn btn--gold">Return Home</Link>
            <Link to="/rooms" className="btn btn--outline">View Rooms &amp; Suites</Link>
          </div>
        </div>
      </section>
    </>
  );
}
