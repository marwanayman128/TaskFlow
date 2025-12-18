"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { DynamicAnimation } from "./dynamic-animation";

interface PageEntranceLoaderProps {
  children: React.ReactNode;
}

export function PageEntranceLoader({ children }: PageEntranceLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time or wait for critical resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 0.95,
              transition: {
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-primary/10 via-background to-primary/10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: {
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.2
                }
              }}
              exit={{
                scale: 1.1,
                opacity: 0,
                transition: {
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1]
                }
              }}
              className="flex flex-col items-center gap-8"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.4
                  }
                }}
                exit={{
                  y: -20,
                  opacity: 0,
                  transition: {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }
                }}
              >
                <DynamicAnimation animationUrl="/animations/website-speed-optimization-illustration-2025-10-20-23-53-14-utc.json" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.6
                  }
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  transition: {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.1
                  }
                }}
                className="text-center space-y-2"
              >
                <motion.h2
                  className="text-2xl font-bold text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { delay: 0.8, duration: 0.4 }
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.2 }
                  }}
                >
                  Welcome to Dashboard
                </motion.h2>
                <motion.p
                  className="text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { delay: 1.0, duration: 0.4 }
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.2, delay: 0.1 }
                  }}
                >
                  Setting up your experience...
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoading ? 0 : 1,
          transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
            delay: isLoading ? 0 : 0.3
          }
        }}
      >
        {children}
      </motion.div>
    </>
  );
}