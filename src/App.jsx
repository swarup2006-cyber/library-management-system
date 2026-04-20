import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AdminPanel from "./pages/AdminPanel";
import Books from "./pages/Books";
import Borrow from "./pages/Borrow";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";

function AppFrame() {
  const location = useLocation();
  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className={`app-shell ${isAuthRoute ? "auth-app-shell" : "workspace-app-shell"}`}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />
      <div className="page-wrap">
        {!isAuthRoute && <Navbar />}
        <main className={`page-shell ${isAuthRoute ? "auth-page-shell" : "workspace-page-shell"}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
                  <AdminPanel />
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
