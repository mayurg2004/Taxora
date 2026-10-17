// ============================================================================
// TASKORA TYPESCRIPT DEFINITIONS
// Clear, strongly typed interfaces for student assignment domain models
// ============================================================================

export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type AssignmentStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  dueDate: string; // ISO Date String
  priority: PriorityLevel;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  priority: PriorityLevel;
  status: AssignmentStatus;
}

export interface Subject {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  assignmentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionPercentage: number;
  upcomingDeadlines: Assignment[];
  recentAssignments: Assignment[];
}

export interface FilterOptions {
  search: string;
  subject: string;
  status: string;
  priority: string;
  sortBy: 'dueDate' | 'title' | 'createdAt' | 'priority';
  sortOrder: 'asc' | 'desc';
}
