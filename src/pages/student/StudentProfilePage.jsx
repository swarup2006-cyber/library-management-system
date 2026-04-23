import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateEmail, validatePassword } from "../../utils/validators";

export default function StudentProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    bio: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        department: user.department || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!profileForm.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!validateEmail(profileForm.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    setProfileErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      setSavingProfile(true);
      const response = await updateProfile(profileForm);
      showToast({
        title: "Profile updated",
        message: response.message,
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: "Update failed",
        message: error.response?.data?.message || "Unable to update profile.",
        variant: "danger",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!passwordForm.currentPassword) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!validatePassword(passwordForm.newPassword)) {
      nextErrors.newPassword = "New password must be at least 8 characters.";
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setPasswordErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      setChangingPassword(true);
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      showToast({
        title: "Password updated",
        message: response.message,
        variant: "success",
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showToast({
        title: "Password change failed",
        message: error.response?.data?.message || "Unable to change password.",
        variant: "danger",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Manage your account"
        description="Update student details, contact information, and password settings."
      />

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h5 mb-3">Student details</h3>
              <form className="form-grid" onSubmit={handleProfileSave}>
                <div className="form-field">
                  <label className="form-label">Name</label>
                  <input
                    className={`form-control ${profileErrors.name ? "is-invalid" : ""}`}
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  {profileErrors.name ? (
                    <div className="invalid-feedback">{profileErrors.name}</div>
                  ) : null}
                </div>
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input
                    className={`form-control ${profileErrors.email ? "is-invalid" : ""}`}
                    value={profileForm.email}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                  {profileErrors.email ? (
                    <div className="invalid-feedback">{profileErrors.email}</div>
                  ) : null}
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Department</label>
                  <input
                    className="form-control"
                    value={profileForm.department}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, department: event.target.value }))
                    }
                  />
                </div>
                <div className="form-field full-width">
                  <label className="form-label">Address</label>
                  <input
                    className="form-control"
                    value={profileForm.address}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, address: event.target.value }))
                    }
                  />
                </div>
                <div className="form-field full-width">
                  <label className="form-label">Bio</label>
                  <textarea
                    rows="4"
                    className="form-control"
                    value={profileForm.bio}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, bio: event.target.value }))
                    }
                  />
                </div>
                <div className="form-actions full-width">
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h3 className="h5 mb-3">Change password</h3>
              <form className="form-grid" onSubmit={handlePasswordChange}>
                <div className="form-field full-width">
                  <label className="form-label">Current password</label>
                  <input
                    type="password"
                    className={`form-control ${
                      passwordErrors.currentPassword ? "is-invalid" : ""
                    }`}
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                  />
                  {passwordErrors.currentPassword ? (
                    <div className="invalid-feedback">
                      {passwordErrors.currentPassword}
                    </div>
                  ) : null}
                </div>
                <div className="form-field full-width">
                  <label className="form-label">New password</label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.newPassword ? "is-invalid" : ""}`}
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                  {passwordErrors.newPassword ? (
                    <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                  ) : null}
                </div>
                <div className="form-field full-width">
                  <label className="form-label">Confirm new password</label>
                  <input
                    type="password"
                    className={`form-control ${
                      passwordErrors.confirmPassword ? "is-invalid" : ""
                    }`}
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                  {passwordErrors.confirmPassword ? (
                    <div className="invalid-feedback">
                      {passwordErrors.confirmPassword}
                    </div>
                  ) : null}
                </div>
                <div className="form-actions full-width">
                  <button
                    type="submit"
                    className="btn btn-outline-primary"
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Updating..." : "Change password"}
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="d-grid gap-2">
                <div className="border rounded-3 p-3">
                  <p className="text-body-secondary small mb-1">Student ID</p>
                  <strong>{user?.studentId || "Auto-generated"}</strong>
                </div>
                <div className="border rounded-3 p-3">
                  <p className="text-body-secondary small mb-1">Unread notifications</p>
                  <strong>{user?.unreadCount || 0}</strong>
                </div>
                <div className="border rounded-3 p-3">
                  <p className="text-body-secondary small mb-1">Fine due</p>
                  <strong>Rs {user?.fineDue || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
