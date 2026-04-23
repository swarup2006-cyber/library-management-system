import { createContext, useContext, useEffect, useMemo, useState } from "react";
import libraryService from "../services/libraryService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await libraryService.getSessionUser();
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (payload) => {
    const data = await libraryService.login(payload);
    setUser(data.user);
    return data;
  };

  const registerStudent = async (payload) => libraryService.registerStudent(payload);

  const verifyOtp = async (payload) => {
    const data = await libraryService.verifyOtp(payload);

    if (data.user) {
      setUser(data.user);
    }

    return data;
  };

  const requestPasswordReset = async (payload) =>
    libraryService.requestPasswordReset(payload);

  const logout = async () => {
    await libraryService.logout();
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const data = await libraryService.updateProfile(payload);
    setUser(data.user);
    return data;
  };

  const changePassword = async (payload) => {
    const data = await libraryService.changePassword(payload);
    await refreshUser();
    return data;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshUser,
      registerStudent,
      verifyOtp,
      requestPasswordReset,
      updateProfile,
      changePassword,
      setUser,
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

export { AuthContext };
