import { api } from '../api';
import type { User } from '../../types';

export const profileService = {
  update(payload: { name: string; email: string }) {
    return api.put<User>('/profile', payload).then((r) => r.data);
  },
  updatePassword(payload: { current_password: string; password: string; password_confirmation: string }) {
    return api.put<{ message: string }>('/profile/password', payload).then((r) => r.data);
  },
};
