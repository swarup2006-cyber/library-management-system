import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const registerContent = {
  admin: {
    shellClass: "admin-register-shell",
    asideClass: "accent",
    asideEyebrow: "Admin Signup",
    asideTitle: "Create an administrator account for the library control room.",
    asideBody:
      "Admin signup opens the staff portal for book management, user control, issue-return records, reports, alerts, and access settings.",
    panelEyebrow: "Create Admin",
    panelTitle: "Register an admin account",
    panelBody:
      "The first admin can be created directly. After that, use an admin invite code if your backend has one configured.",
    emailPlaceholder: "admin@library.com",
    namePlaceholder: "Library Administrator",
    submitLabel: "Continue to Admin Verification",
    loadingLabel: "Creating admin...",
    successMessage:
      "Admin registration complete. Enter the OTP below to activate the administrator account.",
    loginRoute: "/admin-login",
    footnote: "Already an admin?",
    footnoteLink: "/admin-login",
    footnoteLabel: "Sign in to Admin Login",
  },
  student: {
    shellClass: "",
    asideClass: "warm",
    asideEyebrow: "New Member",
    asideTitle: "Set up a reader account with a cleaner activation flow.",
    asideBody:
      "Registration now feeds directly into dashboard OTP verification so onboarding feels like one professional journey.",
    panelEyebrow: "Create Account",
    panelTitle: "Register a library member",
    panelBody:
      "Start with the basics and we will open the dashboard OTP panel next.",
    emailPlaceholder: "reader@example.com",
    namePlaceholder: "Aarav Sharma",
    submitLabel: "Continue to Verification",
    loadingLabel: "Creating account...",
    successMessage:
      "Registration complete. Enter the OTP below to activate the account.",
    loginRoute: "/student-login",
    footnote: "Already registered?",
    footnoteLink: "/student-login",
    footnoteLabel: "Sign in instead",
  },
};

export default function Register({ accountType = "student" }) {
  const navigate = useNavigate();
  const isAdminSignup = accountType === "admin";
  const content = isAdminSignup ? registerContent.admin : registerContent.student;
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    adminInviteCode: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: isAdminSignup ? "admin" : "user",
        adminInviteCode: form.adminInviteCode,
      };
      const { data } = await API.post("/register", payload);
      localStorage.setItem(
        "pendingVerificationEmail",
        form.email.trim().toLowerCase()
      );
      navigate("/", {
        replace: true,
        state: {
          message: content.successMessage,
          devOtp: data.devOtp,
          email: form.email.trim().toLowerCase(),
          loginRoute: content.loginRoute,
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
    <section className={`auth-shell ${content.shellClass}`}>
      <article className={`auth-aside ${content.asideClass}`}>
        <span className="eyebrow">{content.asideEyebrow}</span>
        <h1>{content.asideTitle}</h1>
        <p>
          {content.asideBody}
        </p>
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-number">01</span>
            <div>
              <h3>{isAdminSignup ? "Staff access setup" : "Fast verification path"}</h3>
              <p>
                {isAdminSignup
                  ? "Create the admin account, verify by OTP, then enter the admin portal."
                  : "Register once, receive your code, and complete activation inside the main dashboard."}
              </p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-number">02</span>
            <div>
              <h3>{isAdminSignup ? "Protected by role" : "Built for repeat visits"}</h3>
              <p>
                {isAdminSignup
                  ? "Admin accounts are separated from student login and routed to staff controls."
                  : "Once verified, your account is ready for borrowing, returns, and catalog access."}
              </p>
            </div>
          </div>
        </div>
      </article>

      <article className="auth-panel">
        <span className="eyebrow">{content.panelEyebrow}</span>
        <h2>{content.panelTitle}</h2>
        <p className="section-copy">
          {content.panelBody}
        </p>
        <div className="portal-switch" aria-label="Choose signup type">
          <Link
            to="/register"
            className={isAdminSignup ? "portal-tab" : "portal-tab active"}
          >
            Student Signup
          </Link>
          <Link
            to="/admin-signup"
            className={isAdminSignup ? "portal-tab active" : "portal-tab"}
          >
            Admin Signup
          </Link>
        </div>
        {error && <p className="form-message error">{error}</p>}

        <form onSubmit={submit} className="form-grid">
          <label>
            <span>Full name</span>
            <input
              value={form.name}
              placeholder={content.namePlaceholder}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            <span>Email address</span>
            <input
              value={form.email}
              placeholder={content.emailPlaceholder}
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
          {isAdminSignup && (
            <label>
              <span>Admin invite code</span>
              <input
                value={form.adminInviteCode}
                placeholder="Required after first admin"
                onChange={(e) =>
                  setForm({ ...form, adminInviteCode: e.target.value })
                }
              />
            </label>
          )}
          <button type="submit" disabled={submitting}>
            {submitting ? content.loadingLabel : content.submitLabel}
          </button>
        </form>

        <p className="auth-footnote">
          {content.footnote} <Link to={content.footnoteLink}>{content.footnoteLabel}</Link>.
        </p>
      </article>
    </section>
  );
}
