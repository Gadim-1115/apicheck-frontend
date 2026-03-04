const BASE = '';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(BASE + path, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login-olmaq-ucun-cetin-yol';
    throw new Error('Unauthorized');
  }

  return res as unknown as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await request<Response>(path, { method: 'GET' });
  if (!(res as unknown as Response).ok) {
    throw new Error(`GET ${path} failed: ${(res as unknown as Response).status}`);
  }
  return (res as unknown as Response).json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<{ data: T; status: number }> {
  const res = await request<Response>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = await (res as unknown as Response).json();
  return { data, status: (res as unknown as Response).status };
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await request<Response>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!(res as unknown as Response).ok) {
    throw new Error(`PATCH ${path} failed: ${(res as unknown as Response).status}`);
  }
  return (res as unknown as Response).json();
}

export async function apiDelete(path: string): Promise<void> {
  const res = await request<Response>(path, { method: 'DELETE' });
  if (!(res as unknown as Response).ok) {
    throw new Error(`DELETE ${path} failed: ${(res as unknown as Response).status}`);
  }
}
