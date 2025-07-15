import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MobileAuth from "./MobileAuth";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const { user } = useAuth();

  // Close modal and call success callback when user gets authenticated
  useEffect(() => {
    if (user && isOpen) {
      onSuccess();
      onClose();
    }
  }, [user, isOpen, onSuccess, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none overflow-hidden">
        <div className="w-full h-full">
          <MobileAuth />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;