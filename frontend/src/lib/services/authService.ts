import { api } from '../api';
import type { User } from '../../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  register(payload: { name: string; email: string; password: string; password_confirmation: string }) {
    return api.post<AuthResponse>('/register', payload).then((r) => r.data);
  },
  login(payload: { email: string; password: string }) {
    return api.post<AuthResponse>('/login', payload).then((r) => r.data);
  },
  logout() {
    return api.post('/logout');
  },
  me() {
    return api.get<User>('/me').then((r) => r.data);
  },
};
