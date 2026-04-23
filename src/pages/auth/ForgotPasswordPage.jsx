import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { required, validateEmail, validatePassword } from "../../utils/validators";

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const { showToast } = useToast();
  const role = searchParams.get("role") === "admin" ? "admin" : "student";
  const copy = useMemo(
    () =>
      role === "admin"
        ? {
            badge: "Admin Reset",
            title: "Reset the admin password",
            description: "Generate a reset OTP for the admin portal and verify it on the next screen.",
            asideTitle: "Admin recovery stays separate from student authentication.",
            asideCopy:
              "Reset admin credentials without changing the backend. The OTP flow is mocked and kept entirely in the frontend.",
            accent: "admin",
            loginRoute: "/admin/login",
          }
        : {
            badge: "Student Reset",
            title: "Reset the student password",
            description:
              "Generate a reset OTP for the student portal and verify it on the next screen.",
            asideTitle: "Password recovery is built into the student access flow.",
            asideCopy:
              "Students can request an OTP, verify it, and set a new password without leaving the LMS interface.",
            accent: "student",
            loginRoute: "/student/login",
          },
    [role]
  );
  const [form, setForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!validateEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!validatePassword(form.newPassword)) {
      nextErrors.newPassword = "New password must be at least 8 characters.";
    }

    if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      const response = await requestPasswordReset({
        email: form.email,
        role,
      });

      showToast({
        title: "OTP generated",
        message: "Use the OTP on the verification screen to finish the password reset.",
        variant: "success",
      });

      navigate("/verify-otp", {
        replace: true,
        state: {
          mode: "reset",
          role,
          email: response.email,
          password: form.newPassword,
          otpCode: response.otpCode,
        },
      });
    } catch (error) {
      setFormError(error.response?.data?.message || "Unable to start password reset.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout {...copy}>
      {formError ? <div className="alert alert-danger">{formError}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-field full-width">
          <label className="form-label">Portal email</label>
          <input
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
        </div>

        <div className="form-field">
          <label className="form-label">New password</label>
          <input
            type="password"
            className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
            value={form.newPassword}
            onChange={(event) =>
              setForm((current) => ({ ...current, newPassword: event.target.value }))
            }
          />
          {errors.newPassword ? (
            <div className="invalid-feedback">{errors.newPassword}</div>
          ) : null}
        </div>

        <div className="form-field">
          <label className="form-label">Confirm password</label>
          <input
            type="password"
            className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((current) => ({ ...current, confirmPassword: event.target.value }))
            }
          />
          {errors.confirmPassword ? (
            <div className="invalid-feedback">{errors.confirmPassword}</div>
          ) : null}
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Generating OTP..." : "Generate reset OTP"}
          </button>
          <Link to={copy.loginRoute} className="btn btn-outline-secondary">
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
