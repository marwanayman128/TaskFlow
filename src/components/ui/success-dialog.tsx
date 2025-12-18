"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { DynamicAnimation } from "@/components/layout/dynamic-animation";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function SuccessDialog({
  open,
  onOpenChange,
  title = "Success!",
  description = "Operation completed successfully.",
}: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-border/60 main-gradient-primary-bg p-6">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative flex flex-col items-center justify-center px-6 pb-12">
          {/* Animated success animation */}
          <AnimatePresence>
            {open && (
              <motion.div
                className="mb-6"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              >
                <DynamicAnimation animationUrl="/animations/celebrating-success-animation-of-two-people-jumpin-2025-10-20-23-53-12-utc.json" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="text-center space-y-2">
            <AnimatePresence>
              {open && (
                <motion.h2
                  className="text-3xl font-bold "
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {title}
                </motion.h2>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {open && (
                <motion.p
                  className="text-lg  max-w-sm"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {description}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Decorative elements */}
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  className="absolute top-0 left-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                />
                <motion.div
                  className="absolute bottom-0 right-1/4 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}