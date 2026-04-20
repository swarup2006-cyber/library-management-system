import { Navigate, useLocation } from "react-router-dom";

export default function VerifyOTP() {
  const location = useLocation();
  return (
    <Navigate
      to="/"
      replace
      state={{ ...location.state, showOtpPanel: true }}
    />
  );
}
