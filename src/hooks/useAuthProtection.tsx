import { useState } from "react";
import { useAuth } from "./useAuth";

export const useAuthProtection = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const requireAuth = (callback?: () => void) => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    callback?.();
    return true;
  };

  const handleAuthSuccess = (callback?: () => void) => {
    setShowAuthModal(false);
    callback?.();
  };

  return {
    showAuthModal,
    setShowAuthModal,
    requireAuth,
    handleAuthSuccess,
    isAuthenticated: !!user
  };
};