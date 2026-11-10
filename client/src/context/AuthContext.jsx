import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

/**
 * Staff authentication state. The JWT lives in localStorage (see api/client.js); on load we validate it
 * against /auth/me so an expired or revoked token never leaves the dashboard half-open.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!getToken()) return undefined;
    let cancelled = false;
    api
      .get('/auth/me', { auth: true })
      .then((res) => !cancelled && setUser(res.user))
      .catch(() => !cancelled && logout())
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { body: { email, password } });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const value = useMemo(() => ({ user, checking, login, logout, isAdmin: user?.role === 'admin' }), [user, checking, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
