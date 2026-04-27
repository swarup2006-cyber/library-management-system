import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateEmail, validatePassword } from "../../utils/validators";

function PasswordVisibilityIcon({ visible }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="password-toggle-symbol"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.8-6 9.5-6 9.5 6 9.5 6-3.8 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.8" />
      {visible ? null : <path d="M4 4 20 20" />}
    </svg>
  );
}

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
            description: "Generate a demo reset OTP for the admin portal and verify it on the next screen.",
            asideTitle: "Admin recovery stays separate from student authentication.",
            asideCopy:
              "The reset flow is mocked here, so the demo OTP will be shown on the next screen.",
            accent: "admin",
            loginRoute: "/admin/login",
          }
        : {
            badge: "Student Reset",
            title: "Reset the student password",
            description:
              "Generate a demo reset OTP for the student portal and verify it on the next screen.",
            asideTitle: "Password recovery is built into the student access flow.",
            asideCopy:
              "Students can use the demo OTP shown on the next screen before setting a new password.",
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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getResetErrorMessage = (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.request) {
      return "Password reset service is not reachable. Start the backend server on port 4000 and try again.";
    }

    if (error.message) {
      return error.message;
    }

    return "Unable to start password reset.";
  };

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
        title: "Demo OTP ready",
        message: "Use the demo OTP on the verification screen to finish the password reset.",
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
      setFormError(getResetErrorMessage(error));
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
          <div className="password-input-group has-icon-toggle">
            <input
              type={showNewPassword ? "text" : "password"}
              className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
              value={form.newPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, newPassword: event.target.value }))
              }
            />
            <button
              type="button"
              className="password-toggle password-toggle-icon"
              onClick={() => setShowNewPassword((current) => !current)}
              aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              aria-pressed={showNewPassword}
            >
              <PasswordVisibilityIcon visible={showNewPassword} />
            </button>
          </div>
          {errors.newPassword ? (
            <div className="invalid-feedback">{errors.newPassword}</div>
          ) : null}
        </div>

        <div className="form-field">
          <label className="form-label">Confirm password</label>
          <div className="password-input-group has-icon-toggle">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
            />
            <button
              type="button"
              className="password-toggle password-toggle-icon"
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              aria-pressed={showConfirmPassword}
            >
              <PasswordVisibilityIcon visible={showConfirmPassword} />
            </button>
          </div>
          {errors.confirmPassword ? (
            <div className="invalid-feedback">{errors.confirmPassword}</div>
          ) : null}
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Sending OTP..." : "Send reset OTP"}
          </button>
          <Link to={copy.loginRoute} className="btn btn-outline-secondary">
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
