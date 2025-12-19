"use client";

/**
 * Reset Password Page
 * Uses SDK via useAuthExtensions hook - DO NOT use direct fetch calls
 */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Input, Link, Progress } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AuthBackground } from "@/components/auth";
import { useAuthExtensions } from "@/hooks/use-auth-extensions";

type FormState = "loading" | "valid" | "invalid" | "success" | "error";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // Use SDK-powered auth hook instead of direct fetch
  const {
    isPasswordResetLoading,
    passwordResetError,
    confirmPasswordReset,
    clearErrors,
  } = useAuthExtensions();

  const [formState, setFormState] = useState<FormState>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setFormState("invalid");
      setError("No reset token provided");
      return;
    }

    validateToken(token);
  }, [token]);

  const validateToken = async (resetToken: string) => {
    try {
      // Note: Token validation still uses fetch as it's a read-only check
      // The actual reset uses the SDK hook
      const response = await fetch(
        `/api/auth/password-reset/validate?token=${encodeURIComponent(resetToken)}`
      );
      const data = await response.json();

      if (data.valid) {
        setFormState("valid");
        setEmail(data.email || "");
      } else {
        setFormState("invalid");
        setError(data.message || "Invalid or expired reset link");
      }
    } catch {
      setFormState("invalid");
      setError("Failed to validate reset link");
    }
  };

  const validatePassword = (): boolean => {
    setValidationError(null);

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }

    // Check password strength
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setValidationError(
        "Password must contain uppercase, lowercase, and numbers"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearErrors();

    if (!validatePassword() || !token) {
      return;
    }

    setIsLoading(true);

    try {
      // Use SDK hook instead of direct fetch
      const success = await confirmPasswordReset(token, password);

      if (success) {
        setFormState("success");
      } else {
        setError(passwordResetError || "Failed to reset password");
        setFormState("error");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      setFormState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, label: "Weak", color: "#FF4654" };
    if (strength <= 4) return { level: 2, label: "Medium", color: "#FFC700" };
    return { level: 3, label: "Strong", color: "#DCFF37" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <AuthBackground variant="signup">
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <motion.h1
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                LeetGaming<span className="text-[#DCFF37]">.PRO</span>
              </motion.h1>
            </Link>
          </div>

          {/* Card */}
          <motion.div
            className="bg-black/40 backdrop-blur-xl border border-white/10 p-8"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Loading State */}
            {formState === "loading" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#DCFF37]/20 to-[#FFC700]/20 flex items-center justify-center animate-pulse">
                  <Icon
                    icon="solar:key-bold"
                    className="w-8 h-8 text-[#DCFF37]"
                  />
                </div>
                <p className="text-white/60">Validating reset link...</p>
              </div>
            )}

            {/* Invalid/Expired Token State */}
            {formState === "invalid" && (
              <div className="text-center py-8">
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FF4654]/20 to-[#FF4654]/40 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-10 h-10 text-[#FF4654]"
                  />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Invalid Reset Link
                </h2>
                <p className="text-white/60 text-sm mb-8">
                  {error || "This password reset link is invalid or has expired."}
                </p>

                <Button
                  onPress={() => router.push("/forgot-password")}
                  className="w-full font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF4654 0%, #FFC700 100%)",
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                  size="lg"
                >
                  Request New Reset Link
                </Button>
              </div>
            )}

            {/* Valid Token - Reset Form */}
            {formState === "valid" && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#DCFF37]/20 to-[#FFC700]/20 flex items-center justify-center">
                    <Icon
                      icon="solar:lock-password-bold"
                      className="w-8 h-8 text-[#DCFF37]"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Create New Password
                  </h2>
                  {email && (
                    <p className="text-white/60 text-sm">
                      Resetting password for{" "}
                      <span className="text-white font-medium">{email}</span>
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      label="New Password"
                      placeholder="Enter new password"
                      value={password}
                      onValueChange={setPassword}
                      startContent={
                        <Icon
                          icon="solar:lock-bold"
                          className="w-5 h-5 text-default-400"
                        />
                      }
                      endContent={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="focus:outline-none"
                        >
                          <Icon
                            icon={
                              showPassword
                                ? "solar:eye-closed-bold"
                                : "solar:eye-bold"
                            }
                            className="w-5 h-5 text-default-400"
                          />
                        </button>
                      }
                      classNames={{
                        input: "text-white",
                        inputWrapper:
                          "bg-white/5 border border-white/10 hover:bg-white/10",
                      }}
                    />
                    {password && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/10 rounded overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${(passwordStrength.level / 3) * 100}%`,
                              backgroundColor: passwordStrength.color,
                            }}
                          />
                        </div>
                        <span
                          className="text-xs"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onValueChange={setConfirmPassword}
                    startContent={
                      <Icon
                        icon="solar:lock-bold"
                        className="w-5 h-5 text-default-400"
                      />
                    }
                    endContent={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="focus:outline-none"
                      >
                        <Icon
                          icon={
                            showConfirmPassword
                              ? "solar:eye-closed-bold"
                              : "solar:eye-bold"
                          }
                          className="w-5 h-5 text-default-400"
                        />
                      </button>
                    }
                    classNames={{
                      input: "text-white",
                      inputWrapper:
                        "bg-white/5 border border-white/10 hover:bg-white/10",
                    }}
                    isInvalid={!!validationError}
                    errorMessage={validationError}
                  />

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full font-bold text-[#34445C]"
                    style={{
                      background:
                        "linear-gradient(135deg, #DCFF37 0%, #FFC700 100%)",
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                    size="lg"
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </>
            )}

            {/* Success State */}
            {formState === "success" && (
              <div className="text-center py-8">
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#DCFF37]/20 to-[#DCFF37]/40 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Icon
                    icon="solar:check-circle-bold"
                    className="w-10 h-10 text-[#DCFF37]"
                  />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Password Reset! 🎉
                </h2>
                <p className="text-white/60 text-sm mb-8">
                  Your password has been successfully reset. You can now sign in
                  with your new password.
                </p>

                <Button
                  onPress={() => router.push("/signin")}
                  className="w-full font-bold text-[#34445C]"
                  style={{
                    background:
                      "linear-gradient(135deg, #DCFF37 0%, #FFC700 100%)",
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                  size="lg"
                >
                  Continue to Sign In
                  <Icon icon="solar:arrow-right-bold" className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Error State */}
            {formState === "error" && (
              <div className="text-center py-8">
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FF4654]/20 to-[#FF4654]/40 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Icon
                    icon="solar:close-circle-bold"
                    className="w-10 h-10 text-[#FF4654]"
                  />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Reset Failed
                </h2>
                <p className="text-white/60 text-sm mb-8">{error}</p>

                <div className="space-y-3">
                  <Button
                    onPress={() => {
                      setFormState("valid");
                      setError(null);
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="w-full font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF4654 0%, #FFC700 100%)",
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                    size="lg"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="bordered"
                    onPress={() => router.push("/forgot-password")}
                    className="w-full font-semibold border-white/20 text-white hover:bg-white/5"
                    size="lg"
                  >
                    Request New Reset Link
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Help text */}
          <motion.p
            className="text-center text-white/40 text-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Need help?{" "}
            <Link href="/help" className="text-[#DCFF37] hover:underline">
              Contact Support
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </AuthBackground>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center w-full h-screen bg-black">
          <div className="text-2xl font-bold text-white mb-4">
            LeetGaming<span className="text-[#DCFF37]">.PRO</span>
          </div>
          <Progress
            color="success"
            isIndeterminate
            aria-label="Loading..."
            className="max-w-md"
            size="sm"
          />
          <span className="text-white/50 mt-4">Loading...</span>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

