import { api } from "@/shared/api/axios";

export interface ProfileGroup {
  id: string;
  name: string | null;
}

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string | null;
  avatar_url: string | null;
  group: ProfileGroup | null;
}

export interface ApiErrorPayload {
  error: string;
  code?: string;
}

export const getProfile = async (): Promise<ProfileData> => {
  const { data } = await api.get<ProfileData>("/api/profile");
  return data;
};

export const updateProfile = async (payload: {
  fullName?: string;
  groupId?: string;
  avatarUrl?: string;
}): Promise<ProfileData> => {
  const { data } = await api.patch<ProfileData>("/api/profile", payload);
  return data;
};

export const uploadAvatarFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post<{ success: true; url: string }>(
    "/api/upload/image",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return data.url;
};

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean }> => {
  const { data } = await api.post<{ success: boolean }>(
    "/api/profile/change-password",
    payload,
  );
  return data;
};
