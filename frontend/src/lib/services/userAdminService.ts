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
  getUserProjects(userId: number) {
    return api.get<any[]>(`/admin/users/${userId}/projects`).then((r) => r.data);
  },
  attachProjectToUser(userId: number, projectId: number, role: string) {
    return api.post(`/admin/users/${userId}/projects`, { project_id: projectId, role }).then((r) => r.data);
  },
  detachProjectFromUser(userId: number, projectId: number) {
    return api.delete(`/admin/users/${userId}/projects/${projectId}`).then((r) => r.data);
  },
  updateUserProjectRole(userId: number, projectId: number, role: string) {
    return api.put(`/admin/users/${userId}/projects/${projectId}`, { role }).then((r) => r.data);
  },
  getAllProjects() {
    return api.get<{ id: number; name: string }[]>('/admin/projects').then((r) => r.data);
  },
};
