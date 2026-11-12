import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { clearPersistedSession, persistSession, restoreSession } from './authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        if (active) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const restoredUser = await restoreSession(api);
        if (active) {
          setUser(restoredUser);
          setToken(savedToken);
        }
      } catch {
        if (active) {
          clearPersistedSession(localStorage);
          setUser(null);
          setToken(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restore();

    return () => {
      active = false;
    };
  }, []);

  const login = (userData, authToken) => {
    const nextUser = { ...userData, rol: userData.rol ?? userData.role };
    persistSession(localStorage, nextUser, authToken);
    setUser(nextUser);
    setToken(authToken);
  };

  const logout = () => {
    clearPersistedSession(localStorage);
    setUser(null);
    setToken(null);
  };

  const value = useMemo(() => ({ user, token, login, logout, loading }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}