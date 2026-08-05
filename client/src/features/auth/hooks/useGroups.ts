import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/shared/api/axios";

export interface Group {
  id: string;
  name: string;
}

export function useGroups() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get<Group[]>("/api/auth/groups")
      .then((res) => {
        if (!cancelled) setGroups(res.data);
      })
      .catch(() => {
        if (!cancelled) setError(t("auth.errors.loadGroupsFailed"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { groups, isLoading, error };
}
