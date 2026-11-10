export default function Logo({ className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <svg className="logo__mark" viewBox="0 0 64 64" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
        <path d="M10 44h44l-3.500-22-10 10L32 14l-8.500 18-10-10z" />
        <path d="M13 51h38" />
      </svg>
      <span className="logo__text">
        <strong>Royal Crest</strong>
        <small>Hotel &amp; Suites</small>
      </span>
    </span>
  );
}
