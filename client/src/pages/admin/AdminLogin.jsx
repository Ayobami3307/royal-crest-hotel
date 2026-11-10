import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { EMAIL_RE } from '../../utils/validate';

export default function AdminLogin() {
  const { user, checking, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, error: '' });
  const [show, setShow] = useState(false);

  if (!checking && user) return <Navigate to={location.state?.from || '/admin'} replace />;

  const set = (f) => (e) => {
    setForm((s) => ({ ...s, [f]: e.target.value }));
    setErrors((er) => ({ ...er, [f]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (!EMAIL_RE.test(form.email.trim())) er.email = 'Enter your staff email address.';
    if (!form.password) er.password = 'Enter your password.';
    setErrors(er);
    if (Object.keys(er).length) return;

    setStatus({ loading: true, error: '' });
    try {
      await login(form.email.trim(), form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  return (
    <div className="login">
      <div className="login__art" aria-hidden="true" />
      <div className="login__card">
        <Logo />
        <h1>Staff sign in</h1>
        <p className="muted">Manage reservations, rooms and rates.</p>
        <form onSubmit={submit} noValidate className="form">
          <label className={`field ${errors.email ? 'field--error' : ''}`}>
            <span className="field__label">Email</span>
            <input className="input" type="email" autoComplete="username" value={form.email} onChange={set('email')} autoFocus />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </label>
          <label className={`field ${errors.password ? 'field--error' : ''}`}>
            <span className="field__label">Password</span>
            <span className="login__pw">
              <input className="input" type={show ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={set('password')} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
                <Icon name="eye" size={20} />
              </button>
            </span>
            {errors.password && <span className="field__error">{errors.password}</span>}
          </label>
          {status.error && <p className="alert alert--error" role="alert"><Icon name="alert" size={16} /> {status.error}</p>}
          <button type="submit" className="btn btn--gold btn--block" disabled={status.loading}>
            {status.loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <Link to="/" className="login__back"><Icon name="left" size={16} /> Back to website</Link>
      </div>
    </div>
  );
}
