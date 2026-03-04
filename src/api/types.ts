export interface LoginResponse {
  success: boolean;
  message: string;
  email: string | null;
  role: string | null;
  token: string | null;
}

export interface UserResponse {
  id: number;
  email: string;
  active: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLoginStatsResponse {
  loginCount: number;
  lastLoginTime: string | null;
  lastLoginIp: string | null;
}

export interface AuditLogResponse {
  id: number;
  actorEmail: string;
  actorRole: string;
  method: string;
  path: string;
  queryString: string | null;
  statusCode: number;
  success: boolean;
  clientIp: string;
  userAgent: string;
  requestBody: string | null;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface EmailCheckResponse {
  exists: boolean;
  message: string;
}

export interface CredentialsCheckResponse {
  valid: boolean;
}
