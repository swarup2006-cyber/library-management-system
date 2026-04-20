import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

const portalContent = {
  admin: {
    asideEyebrow: "Admin Portal Login",
    asideTitle:
      "Control books, users, issue returns, reports, and alerts from one professional command desk.",
    asideBody:
      "Administrators get a focused entry point for inventory, circulation, account status, analytics, and system security without mixing staff tools into the student experience.",
    panelEyebrow: "Admin Login",
    panelTitle: "Sign in as administrator",
    panelBody:
      "Use an admin account to open the full library management dashboard.",
    submitLabel: "Sign in to Admin Portal",
    emailPlaceholder: "admin@library.com",
    mismatch:
      "This portal is for administrators only. Please use Student Login for reader accounts.",
    highlights: [
      {
        title: "Inventory control",
        body: "Add, update, delete, and monitor book stock from the admin portal.",
      },
      {
        title: "User management",
        body: "Manage roles, active or blocked status, profiles, and borrowing records.",
      },
      {
        title: "Reports and alerts",
        body: "Track due dates, overdue notifications, activity logs, and analytics.",
      },
    ],
  },
  student: {
    asideEyebrow: "Student Login",
    asideTitle:
      "Enter a clean student workspace for catalog search, borrowing, returns, and profile access.",
    asideBody:
      "Students get a simpler library journey with book discovery, OTP activation, loan history, due dates, and profile management separated from staff-only controls.",
    panelEyebrow: "Student Login",
    panelTitle: "Access your library dashboard",
    panelBody:
      "Use your verified student account to browse books, issue available titles, and track returns.",
    submitLabel: "Sign in as Student",
    emailPlaceholder: "student@example.com",
    mismatch:
      "This portal is for students only. Please use Admin Login for administrator accounts.",
    highlights: [
      {
        title: "Book discovery",
        body: "Search by title, author, ISBN, category, and availability.",
      },
      {
        title: "Borrowing history",
        body: "Review issued books, due dates, return status, and fine signals.",
      },
      {
        title: "Dashboard OTP",
        body: "Activate new accounts directly inside the front dashboard.",
      },
    ],
  },
};

export default function Login({ loginType = "student" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const isAdminLogin = loginType === "admin";
  const content = isAdminLogin ? portalContent.admin : portalContent.student;
  const expectedRole = isAdminLogin ? "admin" : "user";
  const fallbackRedirect = isAdminLogin ? "/admin" : "/";
  const [email, setEmail] = useState(location.state?.verifiedEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const redirectPath = location.state?.from || fallbackRedirect;
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

      if (data.user.role !== expectedRole) {
        await API.post("/logout").catch(() => {});
        setUser(null);
        setError(content.mismatch);
        return;
      }

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
            loginRoute: isAdminLogin ? "/admin-login" : "/student-login",
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
    <section className={`auth-shell auth-shell-login ${isAdminLogin ? "admin-login-shell" : ""}`}>
      <article className="auth-aside login-aside">
        <span className="eyebrow">{content.asideEyebrow}</span>
        <h1>{content.asideTitle}</h1>
        <p>
          {content.asideBody}
        </p>

        <div className="login-highlight-grid">
          {content.highlights.map((item) => (
            <article key={item.title} className="login-highlight-card">
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-number">01</span>
            <div>
              <h3>{isAdminLogin ? "Admin-only route" : "Verified student access"}</h3>
              <p>
                {isAdminLogin
                  ? "The portal checks role access before opening the staff dashboard."
                  : "Only activated student accounts can enter borrowing and profile tools."}
              </p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-number">02</span>
            <div>
              <h3>Separated experience</h3>
              <p>
                Admin and student journeys stay distinct, cleaner, and easier to understand.
              </p>
            </div>
          </div>
        </div>
      </article>

      <article className="auth-panel login-panel">
        <span className="eyebrow">{content.panelEyebrow}</span>
        <h2>{content.panelTitle}</h2>
        <p className="section-copy">
          {content.panelBody}
        </p>

        <div className="portal-switch" aria-label="Choose login portal">
          <Link
            to="/student-login"
            className={isAdminLogin ? "portal-tab" : "portal-tab active"}
          >
            Student Login
          </Link>
          <Link
            to="/admin-login"
            className={isAdminLogin ? "portal-tab active" : "portal-tab"}
          >
            Admin Login
          </Link>
        </div>

        {statusMessage && <p className="form-message success">{statusMessage}</p>}
        {error && <p className="form-message error">{error}</p>}

        <form onSubmit={submit} className="form-grid">
          <label>
            <span>Email address</span>
            <input
              value={email}
              placeholder={content.emailPlaceholder}
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
            {submitting ? "Signing in..." : content.submitLabel}
          </button>
        </form>

        <div className="auth-inline-actions">
          {isAdminLogin ? (
            <Link to="/admin-signup" className="ghost-button">
              Create Admin Account
            </Link>
          ) : (
            <Link to="/register" className="ghost-button">
              Create Student Account
            </Link>
          )}
          <Link to="/" className="text-link">
            Open Front Dashboard
          </Link>
        </div>

        <p className="auth-footnote">
          {isAdminLogin
            ? "Student account? Switch to Student Login for catalog and borrowing access."
            : "Admin account? Switch to Admin Login for staff-only controls."}
        </p>
      </article>
    </section>
  );
}
