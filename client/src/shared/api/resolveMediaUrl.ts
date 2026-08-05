import { api } from "@/shared/api/axios";

export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${api.defaults.baseURL}${url}`;
}
