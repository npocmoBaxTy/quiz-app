// ─── Domain ───────────────────────────────────────────────────────────────────

export type UserRole = "student" | "teacher";

export interface AuthUser {
  id:       string;
  email:    string;
  fullName: string;
  role:     UserRole;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface AuthResponse {
  user:   AuthUser;
  tokens: AuthTokens;
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export interface LoginFormData {
  email:    string;
  password: string;
}

export interface RegisterFormData {
  fullName:        string;
  email:           string;
  role:            UserRole;
  group:           string;
  password:        string;
  confirmPassword: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export type FormErrors<T> = Partial<Record<keyof T, string>>;

// ─── UI state ─────────────────────────────────────────────────────────────────

export type RegisterStep = 1 | 2;

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface RoleOption {
  value: UserRole;
  label: string;
  desc:  string;
}

export interface DemoAccount {
  label:    string;
  email:    string;
  password: string;
}

// ─── API error ────────────────────────────────────────────────────────────────

export interface ApiError {
  success: false;
  code:    string;
  message: string;
}