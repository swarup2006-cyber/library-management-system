import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { required, validateEmail } from "../../utils/validators";

const contentByRole = {
  student: {
    badge: "Student Login",
    title: "Access your reading dashboard",
    description:
      "Sign in to search books, track due dates, return issued titles, and manage your profile.",
    asideTitle: "Everything a student needs for borrowing stays in one clean place.",
    asideCopy:
      "Browse the catalog, monitor fines, track notifications, and manage your library account from a responsive workspace.",
    accent: "student",
    forgotLink: "/forgot-password?role=student",
    signupLink: "/student/register",
    successRoute: "/student/dashboard",
  },
  admin: {
    badge: "Admin Login",
    title: "Open the library admin workspace",
    description:
      "Sign in to manage books, circulation, students, categories, authors, reports, and account settings.",
    asideTitle: "Run circulation, stock, and reporting from a single admin dashboard.",
    asideCopy:
      "The admin workspace covers book management, student records, issue/return workflows, overdue tracking, and fines.",
    accent: "admin",
    forgotLink: "/forgot-password?role=admin",
    signupLink: "",
    successRoute: "/admin/dashboard",
  },
};

export default function PortalLoginPage({ role = "student" }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const content = contentByRole[role];
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!required(form.email) || !validateEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!required(form.password)) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      const response = await login({
        email: form.email,
        password: form.password,
        role,
      });

      showToast({
        title: "Signed in",
        message: response.message,
        variant: "success",
      });

      navigate(location.state?.from || content.successRoute, { replace: true });
    } catch (error) {
      setFormError(error.response?.data?.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout {...content}>
      {formError ? <div className="alert alert-danger">{formError}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-field full-width">
          <label className="form-label">Email</label>
          <input
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
        </div>

        <div className="form-field full-width">
          <label className="form-label">Password</label>
          <input
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
          {errors.password ? (
            <div className="invalid-feedback">{errors.password}</div>
          ) : null}
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Signing in..." : role === "admin" ? "Login as Admin" : "Login as Student"}
          </button>
          <Link to={content.forgotLink} className="btn btn-outline-secondary">
            Forgot password
          </Link>
        </div>
      </form>

      <div className="d-flex flex-wrap gap-3 mt-4">
        {role === "student" ? (
          <Link to={content.signupLink} className="text-decoration-none">
            Create student account
          </Link>
        ) : (
          <Link to="/student/login" className="text-decoration-none">
            Switch to student login
          </Link>
        )}
        {role === "student" ? (
          <Link to="/admin/login" className="text-decoration-none">
            Go to admin login
          </Link>
        ) : null}
      </div>
    </AuthLayout>
  );
}
