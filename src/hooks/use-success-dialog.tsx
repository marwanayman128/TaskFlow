"use client";

import { useState } from "react";

interface UseSuccessDialogProps {
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function useSuccessDialog({ onSuccess, title, description }: UseSuccessDialogProps = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const showSuccess = () => {
    setIsOpen(true);
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onSuccess?.();
    }
  };

  return {
    isOpen,
    setIsOpen,
    handleClose,
    showSuccess,
    title: title || "Success!",
    description: description || "Operation completed successfully.",
  };
}