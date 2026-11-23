import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, getToken, saveToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    let active = true;
    if (!getToken()) {
      setLoading(false);
      return () => { active = false; };
    }
    apiRequest('/auth/me')
      .then((data) => { if (active) setUser(data.user); })
      .catch(() => { saveToken(null); if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await apiRequest('/auth/register', { method: 'POST', body: { name, email, password } });
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    saveToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
