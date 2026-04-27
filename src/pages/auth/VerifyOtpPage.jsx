import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { required } from "../../utils/validators";

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const { showToast } = useToast();
  const mode = location.state?.mode || "register";
  const role = location.state?.role === "admin" ? "admin" : "student";
  const loginRoute = role === "admin" ? "/admin/login" : "/student/login";
  const copy = useMemo(
    () =>
      mode === "reset"
        ? {
            badge: "Verify Reset OTP",
            title: "Confirm the password reset",
            description:
              "Enter the demo OTP generated on the previous screen to save the new password.",
          }
        : {
            badge: "Verify Account",
            title: "Activate the student account",
            description:
              "Enter the OTP generated during signup to activate the student profile.",
          },
    [mode]
  );
  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!required(form.email)) {
      nextErrors.email = "Email is required.";
    }

    if (!required(form.otp)) {
      nextErrors.otp = "OTP is required.";
    }

    if (mode === "reset" && !location.state?.password) {
      nextErrors.otp = "Restart the password reset flow to set a new password.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      await verifyOtp({
        email: form.email,
        otp: form.otp,
        mode,
        role,
        password: location.state?.password,
      });

      showToast({
        title: mode === "reset" ? "Password reset complete" : "Account verified",
        message:
          mode === "reset"
            ? "You can sign in with the new password now."
            : "The student account is active and ready to use.",
        variant: "success",
      });

      navigate(loginRoute, {
        replace: true,
      });
    } catch (error) {
      setFormError(error.response?.data?.message || "Unable to verify OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badge={copy.badge}
      title={copy.title}
      description={copy.description}
      accent={role === "admin" ? "admin" : "student"}
      asideTitle={
        mode === "reset"
          ? "Use the demo OTP shown below."
          : "OTP verification is still mocked for account signup."
      }
      asideCopy={
        mode === "reset"
          ? "This password reset flow is mocked, so you can use the demo OTP to finish setting the new password."
          : "This keeps the student registration flow working with a visible demo OTP."
      }
    >
      {mode === "reset" && location.state?.otpCode ? (
        <div className="alert alert-warning">
          <strong>Demo OTP:</strong> {location.state.otpCode}
        </div>
      ) : null}

      {mode !== "reset" && location.state?.otpCode ? (
        <div className="alert alert-warning">
          <strong>Demo OTP:</strong> {location.state.otpCode}
        </div>
      ) : null}

      {formError ? <div className="alert alert-danger">{formError}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-field full-width">
          <label className="form-label">Email</label>
          <input
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
        </div>

        <div className="form-field full-width">
          <label className="form-label">OTP</label>
          <input
            className={`form-control ${errors.otp ? "is-invalid" : ""}`}
            value={form.otp}
            onChange={(event) => setForm((current) => ({ ...current, otp: event.target.value }))}
          />
          {errors.otp ? <div className="invalid-feedback">{errors.otp}</div> : null}
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Verifying..." : "Verify OTP"}
          </button>
          <Link to={loginRoute} className="btn btn-outline-secondary">
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
