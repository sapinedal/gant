import { api } from '../api';
import type { User } from '../../types';

export interface UserPayload {
  name: string;
  email: string;
  is_admin: boolean;
  password?: string;
}

export const userAdminService = {
  list() {
    return api.get<User[]>('/users').then((r) => r.data);
  },
  create(payload: UserPayload & { password: string }) {
    return api.post<User>('/users', payload).then((r) => r.data);
  },
  update(id: number, payload: UserPayload) {
    return api.put<User>(`/users/${id}`, payload).then((r) => r.data);
  },
  remove(id: number) {
    return api.delete(`/users/${id}`);
  },
};
