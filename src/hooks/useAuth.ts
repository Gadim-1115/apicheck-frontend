export interface AuthUser {
  email: string;
  role: string;
  token: string;
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', user.token);
}

export function clearAuth(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

export function isAdmin(): boolean {
  const user = getAuthUser();
  return user?.role === 'ADMIN';
}
