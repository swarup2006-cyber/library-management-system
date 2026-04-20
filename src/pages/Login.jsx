import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState(location.state?.verifiedEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const redirectPath = location.state?.from || "/";
  const statusMessage =
    location.state?.message ||
    (location.state?.verifiedEmail
      ? "Account verified. Sign in to continue."
      : "");

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      const { data } = await API.post("/login", { email, password });
      setUser(data.user);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || "Unable to log in.";

      if (
        error.response?.status === 403 &&
        message.toLowerCase().includes("verify your account")
      ) {
        localStorage.setItem(
          "pendingVerificationEmail",
          email.trim().toLowerCase()
        );
        navigate("/", {
          replace: true,
          state: {
            email: email.trim().toLowerCase(),
            from: redirectPath,
            showOtpPanel: true,
            message:
              "Verify your account below to unlock sign-in and member access.",
          },
        });
        return;
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-shell auth-shell-login">
      <article className="auth-aside login-aside">
        <span className="eyebrow">Secure Access</span>
        <h1>Sign in to a sharper library operations workspace.</h1>
        <p>
          The login experience now matches the rest of the LMS: clearer session handling, cleaner account activation, and a more professional front desk for daily use.
        </p>

        <div className="login-highlight-grid">
          <article className="login-highlight-card">
            <strong>Live circulation</strong>
            <p>Move from sign-in to loans, returns, and catalog checks without friction.</p>
          </article>
          <article className="login-highlight-card">
            <strong>OTP inside dashboard</strong>
            <p>Unverified members are routed into the dashboard activation panel instead of a disconnected screen.</p>
          </article>
          <article className="login-highlight-card">
            <strong>Session clarity</strong>
            <p>Staff and members get a consistent, audit-friendly entry point into the LMS.</p>
          </article>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-number">01</span>
            <div>
              <h3>Verified sign-in</h3>
              <p>Only activated accounts can enter the borrowing workspace.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-number">02</span>
            <div>
              <h3>Professional member flow</h3>
              <p>Registration, OTP verification, and login now feel like one connected journey.</p>
            </div>
          </div>
        </div>
      </article>

      <article className="auth-panel login-panel">
        <span className="eyebrow">Member Login</span>
        <h2>Access the library dashboard</h2>
        <p className="section-copy">
          Use your verified account to continue into circulation, catalog review, and operations.
        </p>
        {statusMessage && <p className="form-message success">{statusMessage}</p>}
        {error && <p className="form-message error">{error}</p>}

        <form onSubmit={submit} className="form-grid">
          <label>
            <span>Email address</span>
            <input
              value={email}
              placeholder="reader@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              value={password}
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-inline-actions">
          <Link to="/register" className="ghost-button">
            Create Account
          </Link>
          <Link to="/" className="text-link">
            Open Dashboard
          </Link>
        </div>

        <p className="auth-footnote">
          Unverified account? The dashboard now includes OTP activation directly in the main workspace.
        </p>
      </article>
    </section>
  );
}
