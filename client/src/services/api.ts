// ============================================================================
// CENTRAL API SERVICE (Fetch API + async/await)
// Handles all communication between the React frontend and Express backend
// ============================================================================

import { Assignment, AssignmentFormData, Subject, DashboardStats, User, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Retrieves the stored JWT authentication token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('taskora_token');
}

/**
 * Stores JWT authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('taskora_token', token);
}

/**
 * Clears stored JWT token upon logout
 */
export function clearAuthToken(): void {
  localStorage.removeItem('taskora_token');
}

/**
 * Core generic fetch wrapper with centralized error handling and auth headers
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // If unauthorized, token may be expired or invalid
  if (response.status === 401) {
    clearAuthToken();
    // Dispatch a custom event so AuthContext can automatically redirect
    window.dispatchEvent(new Event('taskora_unauthorized'));
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).errors = data?.errors;
    throw error;
  }

  return data as T;
}

// ----------------------------------------------------------------------------
// AUTHENTICATION API
// ----------------------------------------------------------------------------
export const authApi = {
  login: (credentials: { email: string; password: string }): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: (): Promise<{ user: User }> =>
    request<{ user: User }>('/auth/me'),
};

// ----------------------------------------------------------------------------
// ASSIGNMENTS API
// ----------------------------------------------------------------------------
export const assignmentsApi = {
  getAll: (params?: { search?: string; subject?: string; status?: string; priority?: string; sort?: string }): Promise<{ assignments: Assignment[] }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.subject && params.subject !== 'all') query.append('subject', params.subject);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params?.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    return request<{ assignments: Assignment[] }>(`/assignments${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string): Promise<{ assignment: Assignment }> =>
    request<{ assignment: Assignment }>(`/assignments/${id}`),

  create: (data: AssignmentFormData): Promise<{ assignment: Assignment; message: string }> =>
    request<{ assignment: Assignment; message: string }>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<AssignmentFormData>): Promise<{ assignment: Assignment; message: string }> =>
    request<{ assignment: Assignment; message: string }>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string): Promise<{ assignment: Assignment; message: string }> =>
    request<{ assignment: Assignment; message: string }>(`/assignments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`/assignments/${id}`, {
      method: 'DELETE',
    }),
};

// ----------------------------------------------------------------------------
// SUBJECTS API
// ----------------------------------------------------------------------------
export const subjectsApi = {
  getAll: (): Promise<{ subjects: Subject[] }> =>
    request<{ subjects: Subject[] }>('/subjects'),

  create: (data: { name: string; code?: string; description?: string }): Promise<{ subject: Subject; message: string }> =>
    request<{ subject: Subject; message: string }>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name: string; code?: string; description?: string }): Promise<{ subject: Subject; message: string }> =>
    request<{ subject: Subject; message: string }>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`/subjects/${id}`, {
      method: 'DELETE',
    }),
};

// ----------------------------------------------------------------------------
// DASHBOARD API
// ----------------------------------------------------------------------------
export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    request<DashboardStats>('/dashboard/stats'),
};
