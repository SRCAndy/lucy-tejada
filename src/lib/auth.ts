// Funciones para manejo de sesión del usuario

export interface UserSession {
  userId: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  name: string;
  token: string;
}

export function getSessionFromStorage(): UserSession | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('user_id');
  const email = localStorage.getItem('user_email');
  const role = localStorage.getItem('user_role') as any;
  const name = localStorage.getItem('user_name');

  if (!token || !userId || !email || !role || !name) {
    return null;
  }

  return { token, userId, email, role, name };
}

export function isSessionValid(): boolean {
  return getSessionFromStorage() !== null;
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_id');
}

export function getCurrentUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_role');
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('student_id');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_email');
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}
