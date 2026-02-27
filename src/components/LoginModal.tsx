import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuthentication";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger animation after render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        // ✅ Success - show toast and close modal
        toast({
          variant: "success",
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        // Clear form and close modal
        setUsername("");
        setPassword("");
        onClose();
      } else {
        // ❌ Error - show toast but KEEP modal open
        toast({
          title: "Login failed",
          description: result.error || "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      // ✅ Always stop loading state
      setIsSubmitting(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with fade animation */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal with scale + fade animation */}
      <div
        className={`relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-2xl border border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-purple-950/20 -z-10" />

        {/* Animated top border accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />

        {/* Header */}
        <div className="mb-8 text-center">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 dark:text-gray-500 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 hover:rotate-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:rotate-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Logo/Icon with animation */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg animate-in zoom-in duration-500">
            <Lock className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            Sign in to your SmartRent Manager account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username field */}
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Label
              htmlFor="username"
              className="text-gray-700 dark:text-gray-300 font-medium"
            >
              Username
            </Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
                <User className="h-5 w-5" />
              </div>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isSubmitting}
                required
                className="h-12 pl-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <Label
              htmlFor="password"
              className="text-gray-700 dark:text-gray-300 font-medium"
            >
              Password
            </Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12 pl-11 pr-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 animate-in fade-in duration-500 delay-600">
          <p>Secure login powered by SmartRent Manager</p>
        </div>
      </div>
    </div>
  );
}
