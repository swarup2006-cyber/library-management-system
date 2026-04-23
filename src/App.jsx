import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";
import { useAuth } from "./context/AuthContext";
import StudentLoginPage from "./pages/auth/StudentLoginPage";
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import StudentRegisterPage from "./pages/auth/StudentRegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import StudentBooksPage from "./pages/student/StudentBooksPage";
import BookDetailsPage from "./pages/student/BookDetailsPage";
import StudentHistoryPage from "./pages/student/StudentHistoryPage";
import StudentNotificationsPage from "./pages/student/StudentNotificationsPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminBooksPage from "./pages/admin/AdminBooksPage";
import AdminTaxonomyPage from "./pages/admin/AdminTaxonomyPage";
import AdminStudentsPage from "./pages/admin/AdminStudentsPage";
import AdminCirculationPage from "./pages/admin/AdminCirculationPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import Profile from "./pages/Profile";

const studentNavItems = [
  {
    to: "/student/dashboard",
    label: "Dashboard",
    description: "Summary, due dates, and fines",
  },
  {
    to: "/student/books",
    label: "Books",
    description: "Search, filter, and issue books",
  },
  {
    to: "/student/history",
    label: "Issued History",
    description: "Request returns and review history",
  },
  {
    to: "/student/notifications",
    label: "Notifications",
    description: "Due alerts and messages",
  },
  {
    to: "/student/profile",
    label: "Profile",
    description: "Update profile and password",
  },
];

const adminNavItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    description: "Library statistics and activity",
  },
  {
    to: "/admin/books",
    label: "Manage Books",
    description: "Add, edit, and delete books",
  },
  {
    to: "/admin/taxonomy",
    label: "Categories & Authors",
    description: "Manage taxonomy and metadata",
  },
  {
    to: "/admin/students",
    label: "Manage Students",
    description: "Search, inspect, and delete students",
  },
  {
    to: "/admin/circulation",
    label: "Issue / Return",
    description: "Issue books and approve returns",
  },
  {
    to: "/admin/reports",
    label: "Reports",
    description: "Issued books, overdue, and fines",
  },
  {
    to: "/admin/profile",
    label: "Profile",
    description: "Admin details and password",
  },
];

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Opening LMS..." />;
  }

  if (!user) {
    return <Navigate to="/student/login" replace />;
  }

  return (
    <Navigate
      to={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
      replace
    />
  );
}

function LegacyProfileRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Opening profile..." />;
  }

  return (
    <Navigate
      to={user?.role === "admin" ? "/admin/profile" : "/student/profile"}
      replace
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Public authentication routes */}
      <Route path="/student/login" element={<StudentLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/student/register" element={<StudentRegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />

      {/* Compatibility redirects for the older route names already in the repo */}
      <Route path="/login" element={<Navigate to="/student/login" replace />} />
      <Route path="/student-login" element={<Navigate to="/student/login" replace />} />
      <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
      <Route path="/register" element={<Navigate to="/student/register" replace />} />
      <Route path="/verify" element={<Navigate to="/verify-otp" replace />} />
      <Route path="/books" element={<Navigate to="/student/books" replace />} />
      <Route path="/borrow" element={<Navigate to="/student/history" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route element={<AppShell role="student" navItems={studentNavItems} />}>
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/student/books" element={<StudentBooksPage />} />
          <Route path="/student/books/:bookId" element={<BookDetailsPage />} />
          <Route path="/student/history" element={<StudentHistoryPage />} />
          <Route path="/student/notifications" element={<StudentNotificationsPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AppShell role="admin" navItems={adminNavItems} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/books" element={<AdminBooksPage />} />
          <Route path="/admin/taxonomy" element={<AdminTaxonomyPage />} />
          <Route path="/admin/students" element={<AdminStudentsPage />} />
          <Route path="/admin/circulation" element={<AdminCirculationPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["student", "admin"]} />}>
        <Route path="/profile" element={<LegacyProfileRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
