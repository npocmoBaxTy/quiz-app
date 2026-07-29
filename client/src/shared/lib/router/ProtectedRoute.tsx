import { Navigate } from "react-router-dom";
import { useAuthCtx } from "@/app/providers/auth/useAuthContext";
import type { JSX } from "react";
import { Loader } from "@/widgets/Loader/Loader";
import { useAuthStore } from "@/features/auth/store/authstore";

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) => {
  const { isLoading } = useAuthCtx();
  const user = useAuthStore((s) => s.user);

  if (isLoading) return <Loader />;

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role.toUpperCase())) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};
