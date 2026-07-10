import { api } from '../api';
import type { InvitationPreview } from '../../types';

export const invitationService = {
  preview(token: string) {
    return api.get<InvitationPreview>(`/invitations/${token}`).then((r) => r.data);
  },
  accept(token: string) {
    return api.post<{ message: string; project_id: number }>(`/invitations/${token}/accept`).then((r) => r.data);
  },
};
