import { api } from "@/shared/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface StudentGroup {
  id: string;
  name: string | null;
}

export interface AssignableStudent {
  id: string;
  full_name: string;
  email: string;
  groupId: string | null;
  groupName: string | null;
}

export interface AssignableUsers {
  groups: StudentGroup[];
  students: AssignableStudent[];
}

export interface UpdateStudentPayload {
  studentId: string;
  full_name?: string;
  email?: string;
  groupId?: string | null;
}

const QUERY_KEY = ["teacher", "assignable-users"];

export const useAssignableUsers = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<AssignableUsers> => {
      const { data } = await api.get<AssignableUsers>(
        "/api/teacher/assignable-users",
      );
      return data;
    },
  });

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<StudentGroup> => {
      const { data } = await api.post<StudentGroup>("/api/teacher/groups", {
        name,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, ...payload }: UpdateStudentPayload) => {
      const { data } = await api.patch(
        `/api/teacher/students/${studentId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
