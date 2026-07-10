import { api } from '../api';
import type { TaskComment } from '../../types';

export const taskCommentService = {
  list(taskId: number) {
    return api.get<TaskComment[]>(`/tasks/${taskId}/comments`).then((r) => r.data);
  },
  create(taskId: number, body: string) {
    return api.post<TaskComment>(`/tasks/${taskId}/comments`, { body }).then((r) => r.data);
  },
  remove(taskId: number, commentId: number) {
    return api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },
};
