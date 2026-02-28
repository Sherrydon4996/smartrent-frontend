import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuthentication";
import { useToast } from "@/hooks/use-toast";

// ─── Guest credentials (read-only, no admin privileges) ─────────────────────
const GUEST_USERNAME = "guest_viewer";
const GUEST_PASSWORD = "SmartRent@Guest2024";

// ─── Generate a random 6-char alphanumeric code ──────────────────────────────
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous I/O/1/0
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean; // pass true to show admin-only view (no guest option)
}

export function LoginModal({
  isOpen,
  onClose,
  isAdmin = false,
}: LoginModalProps) {
  // ── Core form state ────────────────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Modal animation state ──────────────────────────────────────────────────
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // ── Guest-access flow state ────────────────────────────────────────────────
  const [isGuestChecked, setIsGuestChecked] = useState(false);
  const [guestCode, setGuestCode] = useState<string>(() => generateCode());
  const [codeInput, setCodeInput] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeAttempts, setCodeAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [credentialsVisible, setCredentialsVisible] = useState(false);
  const [credentialCountdown, setCredentialCountdown] = useState(0);

  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const credCountdownRef = useRef<NodeJS.Timeout | null>(null);

  const { login } = useAuth();
  const { toast } = useToast();

  // ── Modal open/close animation ─────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsAnimating(true)),
      );
    } else {
      setIsAnimating(false);
      const t = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ── Reset guest state whenever modal opens/closes ─────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setIsGuestChecked(false);
      setCodeInput("");
      setCodeVerified(false);
      setCodeAttempts(0);
      setCooldownSeconds(0);
      setCredentialsVisible(false);
      setCredentialCountdown(0);
      setGuestCode(generateCode());
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (credCountdownRef.current) clearInterval(credCountdownRef.current);
    }
  }, [isOpen]);

  // ── Cooldown timer ─────────────────────────────────────────────────────────
  const startCooldown = useCallback(() => {
    setCooldownSeconds(60);
    cooldownRef.current = setInterval(() => {
      setCooldownSeconds((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current!);
          setCodeAttempts(0); // reset attempts after cooldown
          setGuestCode(generateCode()); // fresh code
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  // ── Credential visibility countdown (15 s) ────────────────────────────────
  const startCredentialCountdown = useCallback(() => {
    setCredentialsVisible(true);
    setCredentialCountdown(15);
    credCountdownRef.current = setInterval(() => {
      setCredentialCountdown((s) => {
        if (s <= 1) {
          clearInterval(credCountdownRef.current!);
          setCredentialsVisible(false);
          setCodeVerified(false);
          setCodeInput("");
          setGuestCode(generateCode());
          setCodeAttempts(0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  // ── Verify the entered code ────────────────────────────────────────────────
  const handleVerifyCode = () => {
    if (cooldownSeconds > 0) return;
    if (codeInput.trim().toUpperCase() === guestCode) {
      setCodeVerified(true);
      setCodeAttempts(0);
      startCredentialCountdown();
    } else {
      const newAttempts = codeAttempts + 1;
      setCodeAttempts(newAttempts);
      setCodeInput("");
      if (newAttempts >= 3) {
        toast({
          title: "Too many attempts",
          description: "Please wait 60 seconds before trying again.",
          variant: "destructive",
        });
        startCooldown();
      } else {
        toast({
          title: "Incorrect code",
          description: `${3 - newAttempts} attempt${3 - newAttempts !== 1 ? "s" : ""} remaining.`,
          variant: "destructive",
        });
      }
    }
  };

  // ── When guest checkbox is toggled ────────────────────────────────────────
  const handleGuestToggle = () => {
    if (isGuestChecked) {
      // Uncheck — reset everything
      setIsGuestChecked(false);
      setCodeInput("");
      setCodeVerified(false);
      setCodeAttempts(0);
      setCooldownSeconds(0);
      setCredentialsVisible(false);
      setCredentialCountdown(0);
      setGuestCode(generateCode());
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (credCountdownRef.current) clearInterval(credCountdownRef.current);
    } else {
      setIsGuestChecked(true);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        toast({
          variant: "success",
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        setUsername("");
        setPassword("");
        onClose();
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full
          max-w-[88%]          /* mobile */
          sm:max-w-[400px]     /* tablet */
          md:max-w-[360px]     /* laptop — compact */
          lg:max-w-[380px]     /* desktop */
          rounded-2xl bg-white dark:bg-gray-900
          px-5 py-5 sm:px-7 sm:py-6
          shadow-2xl border border-gray-200 dark:border-gray-800
          transition-all duration-300
          ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-purple-950/20 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />

        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Sign in to SmartRent Manager
          </p>
        </div>

        {/* ── Guest access section (hidden for admin) ── */}
        {!isAdmin && (
          <div className="mb-4">
            {/* Checkbox row */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div
                role="checkbox"
                aria-checked={isGuestChecked}
                onClick={handleGuestToggle}
                className={`
                  w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0
                  ${
                    isGuestChecked
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600 group-hover:border-blue-400"
                  }
                `}
              >
                {isGuestChecked && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 12 12"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I am a regular user (view-only access)
              </span>
            </label>

            {/* Expandable guest verification panel */}
            <div
              className={`overflow-hidden transition-all duration-300 ${isGuestChecked ? "max-h-72 opacity-100 mt-3" : "max-h-0 opacity-0"}`}
            >
              <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-3">
                {!codeVerified ? (
                  <>
                    {/* Display the random code */}
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter this code to reveal guest credentials:
                      </p>
                      <button
                        onClick={() => {
                          if (cooldownSeconds === 0) {
                            setGuestCode(generateCode());
                            setCodeInput("");
                            setCodeAttempts(0);
                          }
                        }}
                        disabled={cooldownSeconds > 0}
                        className="text-gray-400 hover:text-blue-500 disabled:opacity-30 transition-colors"
                        title="Generate new code"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>

                    {/* The code itself */}
                    <div className="flex justify-center gap-1.5 mb-3">
                      {guestCode.split("").map((char, i) => (
                        <div
                          key={i}
                          className="w-8 h-9 rounded-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-mono font-bold text-base text-blue-600 dark:text-blue-400 shadow-sm"
                        >
                          {char}
                        </div>
                      ))}
                    </div>

                    {/* Code input */}
                    <div className="flex gap-2">
                      <Input
                        value={codeInput}
                        onChange={(e) =>
                          setCodeInput(e.target.value.toUpperCase().slice(0, 6))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleVerifyCode()
                        }
                        placeholder="Enter code above"
                        disabled={cooldownSeconds > 0}
                        className="h-8 text-sm font-mono tracking-widest text-center uppercase bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        maxLength={6}
                      />
                      <button
                        onClick={handleVerifyCode}
                        disabled={codeInput.length < 6 || cooldownSeconds > 0}
                        className="px-3 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-semibold transition-all flex-shrink-0"
                      >
                        Verify
                      </button>
                    </div>

                    {/* Cooldown message */}
                    {cooldownSeconds > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          Too many attempts. Try again in {cooldownSeconds}s
                        </span>
                      </div>
                    )}
                    {codeAttempts > 0 && cooldownSeconds === 0 && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {3 - codeAttempts} attempt
                        {3 - codeAttempts !== 1 ? "s" : ""} remaining
                      </p>
                    )}
                  </>
                ) : (
                  /* Credentials revealed */
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">
                          Code verified!
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-orange-500">
                        <Clock className="h-3 w-3" />
                        <span>Hides in {credentialCountdown}s</span>
                      </div>
                    </div>

                    {/* Credential pills */}
                    <div className="space-y-1.5">
                      {[
                        {
                          label: "Username",
                          value: GUEST_USERNAME,
                          icon: <User className="h-3 w-3" />,
                        },
                        {
                          label: "Password",
                          value: GUEST_PASSWORD,
                          icon: <KeyRound className="h-3 w-3" />,
                        },
                      ].map(({ label, value, icon }) => (
                        <div
                          key={label}
                          className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-2.5 py-1.5 border border-gray-100 dark:border-gray-700"
                        >
                          <span className="text-blue-500">{icon}</span>
                          <span className="text-xs text-gray-400 w-14 flex-shrink-0">
                            {label}:
                          </span>
                          <span className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {value}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(value);
                              toast({
                                title: `${label} copied!`,
                                description:
                                  "Pasted into the field below automatically.",
                              });
                              if (label === "Username") setUsername(value);
                              else {
                                setPassword(value);
                              }
                            }}
                            className="ml-auto text-xs text-blue-500 hover:text-blue-700 font-medium flex-shrink-0"
                          >
                            Use
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Countdown bar */}
                    <div className="mt-2 h-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(credentialCountdown / 15) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin badge */}
        {isAdmin && (
          <div className="mb-3 flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg py-1.5 px-3 border border-amber-200 dark:border-amber-800/40">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="font-semibold">Administrator login</span>
          </div>
        )}

        {/* ── Login form ── */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label
              htmlFor="username"
              className="text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Username
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isSubmitting}
                required
                className="h-9 pl-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Password
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isSubmitting}
                required
                className="h-9 pl-9 pr-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-9 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] mt-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-3 text-center text-[10px] text-gray-400 dark:text-gray-500">
          Secure login · SmartRent Manager
        </p>
      </div>
    </div>
  );
}
