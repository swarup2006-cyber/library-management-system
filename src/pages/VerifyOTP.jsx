import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

const pendingVerificationKey = "pendingVerificationEmail";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const loginRoute = location.state?.loginRoute || "/student-login";
  const returnPath = location.state?.from || "/";
  const [email, setEmail] = useState(
    location.state?.email || localStorage.getItem(pendingVerificationKey) || ""
  );
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message] = useState(
    location.state?.message || "Enter the OTP to verify your account."
  );
  const [devOtp] = useState(location.state?.devOtp || "");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !otp.trim()) {
      setError("Enter the registered email and OTP to continue.");
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();

      setSubmitting(true);
      setError("");

      await API.post("/verify-otp", {
        email: normalizedEmail,
        otp: otp.trim(),
      });

      localStorage.removeItem(pendingVerificationKey);
      setOtp("");

      navigate(loginRoute, {
        replace: true,
        state: {
          from: returnPath,
          verifiedEmail: normalizedEmail,
          message: "Account verified. Sign in to continue.",
        },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to verify OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <article className="auth-aside accent">
        <span className="eyebrow">Account Verification</span>
        <h1>Verify your library account before signing in.</h1>
        <p>
          OTP verification now lives on its own page, keeping the main dashboard
          clean while preserving account activation.
        </p>
      </article>

      <article className="auth-panel">
        <span className="eyebrow">Verify OTP</span>
        <h2>Enter your verification code</h2>
        <p className="section-copy">{message}</p>

        {error && <p className="form-message error">{error}</p>}
        {devOtp && (
          <p className="form-message success">
            Development OTP: <span className="otp-code">{devOtp}</span>
          </p>
        )}

        <form onSubmit={submit} className="form-grid">
          <label>
            <span>Registered email</span>
            <input
              type="email"
              value={email}
              placeholder="reader@example.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span>One-time password</span>
            <input
              value={otp}
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        <div className="auth-inline-actions">
          <Link to={loginRoute} className="ghost-button">
            Back to Login
          </Link>
          <Link to="/register" className="text-link">
            Register Again
          </Link>
        </div>
      </article>
    </section>
  );
}
