import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader label="Checking session..." />;
  }

  if (!user) {
    const loginPath = allowedRoles?.includes("admin")
      ? "/admin-login"
      : "/student-login";

    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/"
        replace
        state={{ warningMessage: "Your account does not have access to that module." }}
      />
    );
  }

  return children;
}
