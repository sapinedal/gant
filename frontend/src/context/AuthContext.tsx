import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../lib/services/authService';
import type { User } from '../types';

const TOKEN_KEY = 'trazalo_gantt_token';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { user, token } = await authService.login({ email, password });
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  }

  async function register(name: string, email: string, password: string, passwordConfirmation: string) {
    const { user, token } = await authService.register({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, setUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
