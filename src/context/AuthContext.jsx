import { createContext, useEffect, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data } = await API.get("/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    try {
      await API.post("/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, refreshUser, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
