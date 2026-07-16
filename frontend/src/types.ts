export type Role = 'owner' | 'editor' | 'viewer';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
  created_at?: string;
  owned_projects_count?: number;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  owner_id: number;
  owner?: User;
  members?: (User & { pivot?: { role: Role } })[];
  tasks_count?: number;
  invite_code?: string | null;
  invite_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  progress: number;
  status: TaskStatus;
  color: string;
  assignee_id: number | null;
  assignee?: User | null;
  depends_on_task_id: number | null;
  created_by: number;
  sort_order: number;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  body: string;
  user?: User;
  created_at: string;
}

export interface Invitation {
  id: number;
  project_id: number;
  email: string;
  role: Role;
  token: string;
}

export interface InvitationPreview {
  project_name: string;
  inviter_name: string;
  role: Role;
  email: string;
  expired: boolean;
  accepted: boolean;
}
