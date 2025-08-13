import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth";

const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div style={{ padding: 24 }}>확인 중…</div>;
  if (!user)
    return <Navigate to="/admin-login" replace state={{ from: loc }} />;
  return children;
};
export default RequireAuth;
