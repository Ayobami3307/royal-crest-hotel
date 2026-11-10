import { Component } from 'react';

/** Last line of defence: a rendering bug shows a friendly screen instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error', error, info?.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="fatal" role="alert">
        <h1>Something went wrong</h1>
        <p>We hit an unexpected problem. Please reload the page. If it keeps happening, call us on +234 1 700 0100.</p>
        <button type="button" className="btn btn--gold" onClick={() => window.location.assign('/')}>Back to home</button>
      </div>
    );
  }
}
