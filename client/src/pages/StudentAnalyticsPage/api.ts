import { api } from "@/shared/api/axios";
import { useQuery } from "@tanstack/react-query";
import type { StudentAnalytics } from "./types";

export const fetchStudentAnalytics = async (): Promise<StudentAnalytics> => {
  const res = await api.get("/api/student/analytics");
  return res.data;
};

export const useStudentAnalytics = () => {
  return useQuery({
    queryKey: ["student-analytics"],
    queryFn: fetchStudentAnalytics,
  });
};
