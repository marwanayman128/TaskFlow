"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { DynamicAnimation } from '@/components/layout/dynamic-animation';
import { PaletteChanger } from "@/components/layout/palette-changer";

type LoginFormProps = {
  locale?: string;
};

type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
};

export function LoginForm({ locale = "en" }: LoginFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [usersLoading, setUsersLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await fetch('/api/v1/users');
        if (response.ok) {
          const data = await response.json();
          if (data.data?.users) {
            setUsers(data.data.users);
          }
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user selection and auto-login
  const handleUserSelect = async (userId: string) => {
    if (!userId) return;

    setSelectedUser(userId);
    setIsLoading(true);
    setError("");

    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      // For demo purposes, we'll use predefined passwords based on username
      const demoPasswords: Record<string, string> = {
        'admin': 'admin123',
        'manager': 'manager123',
        'developer': 'dev123',
        'designer': 'design123',
        'user': 'user123',
      };

      const password = demoPasswords[user.username] || 'password123';

      const result = await signIn("credentials", {
        email: user.email,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("login.errors.invalidCredentials"));
      } else {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("login.errors.invalidCredentials"));
      } else {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary Gradient Orb - Top Left */}
        <motion.div
          className="absolute top-1/4 -left-48 w-96 h-96 bg-linear-to-br from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: [0, 30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            scale: { duration: 1.5, ease: "easeOut", delay: 0.2 },
            opacity: { duration: 1.5, ease: "easeOut", delay: 0.2 },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
            x: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
          }}
        />

        {/* Secondary Gradient Orb - Bottom Right */}
        <motion.div
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-linear-to-tl from-secondary/40 via-primary/30 to-transparent rounded-full blur-3xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: [0, -30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            scale: { duration: 1.5, ease: "easeOut", delay: 0.6 },
            opacity: { duration: 1.5, ease: "easeOut", delay: 0.6 },
            y: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.8 },
            x: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.8 },
          }}
        />

        {/* Accent Orb - Center Right */}
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-linear-to-bl from-accent/30 via-primary/20 to-transparent rounded-full blur-3xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 1.1, 0.95, 1],
            opacity: [0, 1, 1, 1, 1],
            rotate: [0, 0, 90, 180, 360],
          }}
          transition={{
            scale: { duration: 1.8, ease: "easeOut", delay: 0.4 },
            opacity: { duration: 1.8, ease: "easeOut", delay: 0.4 },
            rotate: { duration: 10, repeat: Infinity, ease: "linear", delay: 1.6 },
          }}
        />

        {/* Subtle Background Orb - Bottom Left */}
        <motion.div
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-linear-to-tr from-muted/30 to-transparent rounded-full blur-3xl"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 0.5,
            y: [0, -40, 0],
            x: [0, -15, 0],
          }}
          transition={{
            scale: { duration: 2, ease: "easeOut", delay: 0.8 },
            opacity: { duration: 2, ease: "easeOut", delay: 0.8 },
            y: { duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 },
            x: { duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 },
          }}
        />

        {/* Radial Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-background/50" />
      </div>

      {/* Top right controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <LocaleSwitcher />
        <ThemeToggle />
        <PaletteChanger />
        
      </div>

      {/* Login Container */}
      <div className="w-full max-w-6xl relative shadow-2xl border border-border/50 backdrop-blur-sm bg-card/95 rounded-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Animation and Welcome Message */}
          <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 bg-linear-to-br from-primary/5 via-primary/2 to-transparent">
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="w-48 h-48  mx-auto">
                <DynamicAnimation animationUrl="/animations/man-opening-door-with-a-key-illustration-2025-10-20-23-53-14-utc.json" />
              </div>
              <div className="space-y-4 pt-5">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  {t("login.welcomeBack")}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t("login.loginDescription")}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 flex flex-col justify-center p-8 lg:p-12">
            <div className="w-full max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("login.signIn")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("login.enterCredentials")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    {error}
                  </div>
                )}

                {/* User Selection for Auto Login */}
                <div className="space-y-2">
                  <Label htmlFor="user-select" className="text-sm font-medium">
                    Quick Login (Select User)
                  </Label>
                  <Select value={selectedUser} onValueChange={handleUserSelect} disabled={isLoading || usersLoading}>
                    <SelectTrigger className="h-11 transition-all focus-visible:ring-primary">
                      <SelectValue placeholder={usersLoading ? "Loading users..." : "Choose a user to login automatically"} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(users) && users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName} ({user.username}) - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full ">
                      Or login manually
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t("login.email.label")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                    className="h-11 transition-all focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      {t("login.password.label")}
                    </Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      {t("login.forgotPassword")}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      disabled={isLoading}
                      className="h-11 pr-10 transition-all focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, rememberMe: checked as boolean })
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("login.rememberMe")}
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("login.signInButton")
                  )}
                </Button>
              </form>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
