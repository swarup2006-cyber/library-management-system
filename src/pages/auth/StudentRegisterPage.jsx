import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { required, validateEmail, validatePassword } from "../../utils/validators";

export default function StudentRegisterPage() {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    studentId: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!required(form.name)) {
      nextErrors.name = "Name is required.";
    }

    if (!validateEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!required(form.department)) {
      nextErrors.department = "Department is required.";
    }

    if (!validatePassword(form.password)) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      const response = await registerStudent(form);

      showToast({
        title: "Registration saved",
        message: "Verify the OTP to activate the student account.",
        variant: "success",
      });

      navigate("/verify-otp", {
        state: {
          mode: "register",
          role: "student",
          email: response.email,
          otpCode: response.otpCode,
        },
        replace: true,
      });
    } catch (error) {
      setFormError(error.response?.data?.message || "Unable to register student.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badge="Student Signup"
      title="Create a student library account"
      description="Register once, verify the OTP, and the student dashboard is ready to use."
      accent="student"
      asideTitle="Student onboarding is part of the same LMS flow."
      asideCopy="The registration screen connects directly to OTP verification, borrowing history, notifications, and the student dashboard."
    >
      {formError ? <div className="alert alert-danger">{formError}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Full name</label>
          <input
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          {errors.name ? <div className="invalid-feedback">{errors.name}</div> : null}
        </div>

        <div className="form-field">
          <label className="form-label">Email</label>
          <input
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
        </div>

        <div className="form-field">
          <label className="form-label">Phone</label>
          <input
            className="form-control"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </div>

        <div className="form-field">
          <label className="form-label">Department</label>
          <input
            className={`form-control ${errors.department ? "is-invalid" : ""}`}
            value={form.department}
            onChange={(event) =>
              setForm((current) => ({ ...current, department: event.target.value }))
            }
          />
          {errors.department ? (
            <div className="invalid-feedback">{errors.department}</div>
          ) : null}
        </div>

        <div className="form-field">
          <label className="form-label">Student ID</label>
          <input
            className="form-control"
            value={form.studentId}
            onChange={(event) =>
              setForm((current) => ({ ...current, studentId: event.target.value }))
            }
          />
        </div>

        <div className="form-field">
          <label className="form-label">Address</label>
          <input
            className="form-control"
            value={form.address}
            onChange={(event) =>
              setForm((current) => ({ ...current, address: event.target.value }))
            }
          />
        </div>

        <div className="form-field">
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
            {submitting ? "Saving..." : "Create student account"}
          </button>
          <Link to="/student/login" className="btn btn-outline-secondary">
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
