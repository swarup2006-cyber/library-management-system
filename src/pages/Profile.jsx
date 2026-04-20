import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setError("");
      setProfileMessage("");
      const { data } = await API.put("/me", profileForm);
      setUser(data.user);
      setProfileMessage(data.message || "Profile updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    try {
      setChangingPassword(true);
      setError("");
      setPasswordMessage("");
      const { data } = await API.put("/change-password", passwordForm);
      setPasswordMessage(data.message || "Password changed.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <section className="page-hero compact">
        <div className="hero-copy">
          <span className="eyebrow">Profile Management</span>
          <h1>Manage identity, access, and security from one cleaner account hub.</h1>
          <p>
            Update your member profile, keep credentials secure, and review role-based
            access without leaving the LMS workspace.
          </p>
        </div>
        <div className="hero-panel">
          <div className="metric-strip two-up">
            <article className="metric-tile">
              <span>Account role</span>
              <strong>{user?.role === "admin" ? "Admin" : "Student"}</strong>
            </article>
            <article className="metric-tile">
              <span>Verification</span>
              <strong>{user?.isVerified ? "Active" : "Pending"}</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section profile-grid">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Member Details</span>
              <h2>Update profile</h2>
            </div>
          </div>

          {profileMessage && <p className="form-message success">{profileMessage}</p>}
          {error && <p className="form-message error">{error}</p>}

          <form onSubmit={saveProfile} className="form-grid">
            <label>
              <span>Full name</span>
              <input
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((current) => ({
                    ...current,
                    name: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span>Email address</span>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((current) => ({
                    ...current,
                    email: e.target.value,
                  }))
                }
              />
            </label>
            <button type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </article>

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Security</span>
              <h2>Change password</h2>
            </div>
          </div>

          {passwordMessage && (
            <p className="form-message success">{passwordMessage}</p>
          )}

          <form onSubmit={changePassword} className="form-grid">
            <label>
              <span>Current password</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span>New password</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: e.target.value,
                  }))
                }
              />
            </label>
            <button type="submit" disabled={changingPassword}>
              {changingPassword ? "Updating..." : "Change Password"}
            </button>
          </form>
        </article>

        <article className="surface-card profile-status-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Access Snapshot</span>
              <h2>Account status</h2>
            </div>
          </div>

          <div className="mini-list">
            <article className="mini-row">
              <div>
                <h3>Role-based access</h3>
                <p>{user?.role === "admin" ? "Administrator" : "Student / Reader"}</p>
              </div>
              <span className="status-pill success">Enabled</span>
            </article>
            <article className="mini-row">
              <div>
                <h3>Authentication</h3>
                <p>Session-backed login with protected routes.</p>
              </div>
              <span className="status-pill success">Protected</span>
            </article>
            <article className="mini-row">
              <div>
                <h3>Notifications</h3>
                <p>Overdue alerts and reminders appear in the dashboard modules.</p>
              </div>
              <span className="status-pill warning">Live</span>
            </article>
          </div>
        </article>
      </section>
    </>
  );
}
