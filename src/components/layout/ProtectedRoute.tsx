import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles: ("Administrator" | "Client" | "Mediator")[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  console.log("ProtectedRoute - user:", user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

    if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;