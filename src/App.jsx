import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Books from "./pages/Books";
import Borrow from "./pages/Borrow";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MinimalAdminDashboard from "./pages/MinimalAdminDashboard";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";

function AppFrame() {
  const location = useLocation();
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/student-login" ||
    location.pathname === "/admin-login" ||
    location.pathname === "/admin-signup" ||
    location.pathname === "/verify" ||
    location.pathname === "/register";
  const isAdminRoute = location.pathname === "/admin";
  const isStandaloneRoute = isAuthRoute || isAdminRoute;

  return (
    <div
      className={`app-shell ${
        isAuthRoute
          ? "auth-app-shell"
          : isAdminRoute
            ? "admin-app-shell"
            : "workspace-app-shell"
      }`}
    >
      {!isAdminRoute && (
        <>
          <div className="ambient ambient-one" aria-hidden="true" />
          <div className="ambient ambient-two" aria-hidden="true" />
          <div className="ambient ambient-three" aria-hidden="true" />
        </>
      )}
      <div className="page-wrap">
        {!isStandaloneRoute && <Navbar />}
        <main
          className={`page-shell ${
            isAuthRoute
              ? "auth-page-shell"
              : isAdminRoute
                ? "admin-page-shell"
                : "workspace-page-shell"
          }`}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login loginType="student" />} />
            <Route path="/student-login" element={<Login loginType="student" />} />
            <Route path="/admin-login" element={<Login loginType="admin" />} />
            <Route path="/register" element={<Register accountType="student" />} />
            <Route path="/admin-signup" element={<Register accountType="admin" />} />
            <Route path="/verify" element={<VerifyOTP />} />
            <Route path="/books" element={<Books />} />
            <Route
              path="/borrow"
              element={
                <ProtectedRoute>
                  <Borrow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MinimalAdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppFrame />
    </BrowserRouter>
  );
}

export default App;
