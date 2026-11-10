import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import Logo from '../../components/Logo';
import { ToastProvider } from '../../components/admin/ui';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: 'chart', end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: 'calendar' },
  { to: '/admin/rooms', label: 'Rooms & Rates', icon: 'bed' },
  { to: '/admin/availability', label: 'Availability', icon: 'grid' },
  { to: '/admin/customers', label: 'Guests', icon: 'users' },
  { to: '/admin/messages', label: 'Messages', icon: 'message' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.title = 'Dashboard | Royal Crest Hotel & Suites';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const signOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <ToastProvider>
      <div className="adm">
        <aside className={`adm-side ${open ? 'is-open' : ''}`} aria-label="Dashboard navigation">
          <Link to="/admin" className="adm-side__brand"><Logo /></Link>
          <nav>
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
                <Icon name={l.icon} size={19} /> {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="adm-side__foot">
            <Link to="/" target="_blank" rel="noopener noreferrer"><Icon name="eye" size={18} /> View website</Link>
            <div className="adm-user">
              <span className="adm-user__avatar" aria-hidden="true">{(user?.name || '?')[0]}</span>
              <span>
                <strong>{user?.name}</strong>
                <small>{user?.role === 'admin' ? 'Administrator' : 'Manager'}</small>
              </span>
            </div>
            <button type="button" className="adm-signout" onClick={signOut}><Icon name="logout" size={18} /> Sign out</button>
          </div>
        </aside>
        {open && <button type="button" className="adm-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

        <div className="adm-main">
          <header className="adm-top">
            <button type="button" className="adm-top__menu" onClick={() => setOpen(true)} aria-label="Open menu">
              <Icon name="menu" size={24} />
            </button>
            <span className="adm-top__title">Royal Crest · Management</span>
          </header>
          <main className="adm-content" id="main">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
