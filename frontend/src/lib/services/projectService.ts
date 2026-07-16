import { api } from '../api';
import type { Project, Role, User } from '../../types';

export const projectService = {
  list() {
    return api.get<Project[]>('/projects').then((r) => r.data);
  },
  get(id: number) {
    return api.get<Project>(`/projects/${id}`).then((r) => r.data);
  },
  create(payload: { name: string; description?: string; color?: string; status?: string }) {
    return api.post<Project>('/projects', payload).then((r) => r.data);
  },
  update(id: number, payload: Partial<{ name: string; description: string; color: string; status: string }>) {
    return api.put<Project>(`/projects/${id}`, payload).then((r) => r.data);
  },
  remove(id: number) {
    return api.delete(`/projects/${id}`);
  },
  members(id: number) {
    return api.get<User[]>(`/projects/${id}/members`).then((r) => r.data);
  },
  invite(id: number, payload: { email: string; role: Role }) {
    return api.post(`/projects/${id}/invite`, payload).then((r) => r.data);
  },
  removeMember(id: number, userId: number) {
    return api.delete(`/projects/${id}/members/${userId}`);
  },
  updateMemberRole(id: number, userId: number, role: Role) {
    return api.patch(`/projects/${id}/members/${userId}`, { role });
  },
  enableInviteLink(id: number) {
    return api.post<{ invite_code: string; invite_enabled: boolean }>(`/projects/${id}/invite-link/enable`).then((r) => r.data);
  },
  disableInviteLink(id: number) {
    return api.post<{ invite_enabled: boolean }>(`/projects/${id}/invite-link/disable`).then((r) => r.data);
  },
  resetInviteLink(id: number) {
    return api.post<{ invite_code: string; invite_enabled: boolean }>(`/projects/${id}/invite-link/reset`).then((r) => r.data);
  },
  previewInvite(inviteCode: string) {
    return api.get<{ id: number; name: string; description: string | null; owner_name: string; status: string; is_member: boolean }>(`/invitations/project/${inviteCode}`).then((r) => r.data);
  },
  joinProject(inviteCode: string) {
    return api.post<{ message: string; project_id: number }>(`/invitations/project/${inviteCode}/accept`).then((r) => r.data);
  },
};
