import { api } from "@/shared/api/axios";

export type LoginDto = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
};

export async function loginRequest(data: LoginDto) {
  const res = await api.post<LoginResponse>("/api/auth/login", data);

  return res.data;
}
