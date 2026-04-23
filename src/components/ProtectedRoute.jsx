import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Checking access..." />;
  }

  if (!user) {
    const loginPath = allowedRoles?.includes("admin")
      ? "/admin/login"
      : "/student/login";

    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
        replace
      />
    );
  }

  return children || <Outlet />;
}
