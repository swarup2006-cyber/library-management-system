import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      const { data } = await API.post("/register", form);
      localStorage.setItem(
        "pendingVerificationEmail",
        form.email.trim().toLowerCase()
      );
      navigate("/", {
        replace: true,
        state: {
          message:
            "Registration complete. Enter the OTP below to activate the account.",
          devOtp: data.devOtp,
          email: form.email.trim().toLowerCase(),
          showOtpPanel: true,
        },
      });
    } catch (error) {
      setError(error.response?.data?.message || "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <article className="auth-aside warm">
        <span className="eyebrow">New Member</span>
        <h1>Set up a reader account with a cleaner activation flow.</h1>
        <p>
          Registration now feeds directly into dashboard OTP verification so onboarding feels like one professional journey.
        </p>
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-number">01</span>
            <div>
              <h3>Fast verification path</h3>
              <p>Register once, receive your code, and complete activation inside the main dashboard.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-number">02</span>
            <div>
              <h3>Built for repeat visits</h3>
              <p>Once verified, your account is ready for borrowing, returns, and catalog access.</p>
            </div>
          </div>
        </div>
      </article>

      <article className="auth-panel">
        <span className="eyebrow">Create Account</span>
        <h2>Register a library member</h2>
        <p className="section-copy">
          Start with the basics and we will open the dashboard OTP panel next.
        </p>
        {error && <p className="form-message error">{error}</p>}

        <form onSubmit={submit} className="form-grid">
          <label>
            <span>Full name</span>
            <input
              value={form.name}
              placeholder="Aarav Sharma"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            <span>Email address</span>
            <input
              value={form.email}
              placeholder="reader@example.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              value={form.password}
              type="password"
              placeholder="Choose a secure password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Continue to Verification"}
          </button>
        </form>

        <p className="auth-footnote">
          Already registered? <Link to="/login">Sign in instead</Link>.
        </p>
      </article>
    </section>
  );
}
