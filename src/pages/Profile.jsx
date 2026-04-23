import StudentProfilePage from "./student/StudentProfilePage";
import AdminProfilePage from "./admin/AdminProfilePage";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Loading profile..." />;
  }

  return user?.role === "admin" ? <AdminProfilePage /> : <StudentProfilePage />;
}
