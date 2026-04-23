import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateEmail, validatePassword } from "../../utils/validators";

export default function AdminProfilePage() {
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

    try {
      if (!validateEmail(profileForm.email)) {
        throw new Error("Enter a valid email address.");
      }

      const response = await updateProfile(profileForm);
      showToast({
        title: "Profile updated",
        message: response.message,
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: "Update failed",
        message: error.response?.data?.message || error.message || "Unable to update profile.",
        variant: "danger",
      });
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();

    try {
      if (!validatePassword(passwordForm.newPassword)) {
        throw new Error("New password must be at least 8 characters.");
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

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
        message: error.response?.data?.message || error.message || "Unable to change password.",
        variant: "danger",
      });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin Profile"
        title="Manage admin account"
        description="Update administrator details and change the portal password."
      />

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h5 mb-3">Admin details</h3>
              <form className="row g-3" onSubmit={handleProfileSave}>
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    value={profileForm.email}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Department</label>
                  <input
                    className="form-control"
                    value={profileForm.department}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, department: event.target.value }))
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <input
                    className="form-control"
                    value={profileForm.address}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, address: event.target.value }))
                    }
                  />
                </div>
                <div className="col-12">
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
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    Save admin profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h3 className="h5 mb-3">Change password</h3>
              <form className="row g-3" onSubmit={handlePasswordSave}>
                <div className="col-12">
                  <label className="form-label">Current password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">New password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Confirm password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-outline-primary">
                    Change password
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="d-grid gap-2">
                <div className="border rounded-3 p-3">
                  <p className="text-body-secondary small mb-1">Unread alerts</p>
                  <strong>{user?.unreadCount || 0}</strong>
                </div>
                <div className="border rounded-3 p-3">
                  <p className="text-body-secondary small mb-1">Active circulation</p>
                  <strong>{user?.activeLoanCount || 0}</strong>
                </div>
                <div className="border rounded-3 p-3">
                  <p className="text-body-secondary small mb-1">Fine exposure snapshot</p>
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
