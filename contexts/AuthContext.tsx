
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { API } from '../lib/api';
import { signInWithGoogle as firebaseSignInWithGoogle } from '../lib/firebase';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  bio?: string;
  skills?: string[];
  creatorStatus?: string;
  tier?: string;
  emailVerified: boolean;
  mobileVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; mobile?: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'cenner_token';
const USER_KEY = 'cenner_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const [loading, setLoading] = useState(false);

  // On startup: if a token exists, silently fetch fresh user data from the DB
  // so CRM changes (tier, verification status, avatar) are reflected immediately
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) return;

    API.me()
      .then((freshUser: AuthUser) => {
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(() => {
        // Token expired or invalid — clear the stale session
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persistSession = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token: newToken, user: newUser } = await API.login(email, password);
      persistSession(newToken, newUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: Parameters<typeof API.register>[0]) => {
    setLoading(true);
    try {
      const { token: newToken, user: newUser } = await API.register(data);
      persistSession(newToken, newUser);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const idToken = await firebaseSignInWithGoogle();
      const CRM_BASE = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';
      const res = await fetch(`${CRM_BASE}/api/v1/portal/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Google sign-in failed');
      }
      const { token: newToken, user: newUser } = await res.json();
      persistSession(newToken, newUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
