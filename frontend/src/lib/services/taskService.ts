import { api } from '../api';
import type { Task } from '../../types';

export type TaskPayload = Partial<{
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  color: string;
  assignee_id: number | null;
  depends_on_task_id: number | null;
  sort_order: number;
}>;

export const taskService = {
  list(projectId: number) {
    return api.get<Task[]>(`/projects/${projectId}/tasks`).then((r) => r.data);
  },
  create(projectId: number, payload: TaskPayload) {
    return api.post<Task>(`/projects/${projectId}/tasks`, payload).then((r) => r.data);
  },
  update(taskId: number, payload: TaskPayload) {
    return api.put<Task>(`/tasks/${taskId}`, payload).then((r) => r.data);
  },
  remove(taskId: number) {
    return api.delete(`/tasks/${taskId}`);
  },
};
