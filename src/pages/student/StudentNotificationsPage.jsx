import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import libraryService from "../../services/libraryService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/formatters";

export default function StudentNotificationsPage() {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadNotifications = async () => {
    try {
      setError("");
      const response = await libraryService.getNotifications();
      setNotifications(response.notifications);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId) => {
    try {
      setBusyId(notificationId);
      await libraryService.markNotificationRead(notificationId);
      await loadNotifications();
      await refreshUser();
      showToast({
        title: "Notification updated",
        message: "The alert was marked as read.",
        variant: "success",
      });
    } catch (requestError) {
      showToast({
        title: "Update failed",
        message: requestError.response?.data?.message || "Unable to update notification.",
        variant: "danger",
      });
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return <Loader label="Loading notifications..." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Notifications"
        title="Due alerts and messages"
        description="Read and clear reminders related to borrowing activity."
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body d-flex flex-column flex-lg-row justify-content-between gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <StatusBadge status={notification.type} />
                    {!notification.read ? (
                      <span className="badge text-bg-primary">Unread</span>
                    ) : null}
                  </div>
                  <h3 className="h6 mb-1">{notification.title}</h3>
                  <p className="text-body-secondary mb-1">{notification.message}</p>
                  <p className="small text-body-secondary mb-0">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <div className="d-flex align-items-start">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={notification.read || busyId === notification.id}
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    {busyId === notification.id ? "Saving..." : "Mark read"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!notifications.length ? (
          <div className="col-12">
            <div className="alert alert-light border">No notifications available.</div>
          </div>
        ) : null}
      </div>
    </>
  );
}
