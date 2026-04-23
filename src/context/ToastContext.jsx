import { createContext, useContext, useMemo, useState } from "react";
import ToastContainer from "../components/common/ToastContainer";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ title, message, variant = "primary" }) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    setToasts((current) => [...current, { id, title, message, variant }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3600);
  };

  const dismissToast = (id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
