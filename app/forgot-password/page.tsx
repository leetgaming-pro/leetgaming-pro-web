"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Input, Link } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AuthBackground } from "@/components/auth";

type FormState = "form" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      // Always show success to prevent email enumeration
      setFormState("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground variant="signin">
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
                LeetGaming<span className="text-[#FF4654]">.PRO</span>
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
            {formState === "form" && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 flex items-center justify-center">
                    <Icon
                      icon="solar:key-bold"
                      className="w-8 h-8 text-[#FF4654]"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Forgot your password?
                  </h2>
                  <p className="text-white/60 text-sm">
                    No worries! Enter your email and we&apos;ll send you a reset
                    link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onValueChange={setEmail}
                    startContent={
                      <Icon
                        icon="solar:letter-bold"
                        className="w-5 h-5 text-default-400"
                      />
                    }
                    classNames={{
                      input: "text-white",
                      inputWrapper:
                        "bg-white/5 border border-white/10 hover:bg-white/10",
                    }}
                    isInvalid={!!error}
                    errorMessage={error}
                  />

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full font-bold text-[#34445C]"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF4654 0%, #FFC700 100%)",
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                    size="lg"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <Link
                    href="/signin"
                    className="text-[#DCFF37] text-sm hover:underline inline-flex items-center gap-1"
                  >
                    <Icon icon="solar:arrow-left-bold" className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}

            {formState === "success" && (
              <div className="text-center py-4">
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#DCFF37]/20 to-[#DCFF37]/40 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Icon
                    icon="solar:letter-bold"
                    className="w-10 h-10 text-[#DCFF37]"
                  />
                </motion.div>

                <h2 className="text-xl font-bold text-white mb-2">
                  Check your email 📧
                </h2>
                <p className="text-white/60 text-sm mb-4">
                  If an account exists with{" "}
                  <span className="text-white font-medium">{email}</span>,
                  you&apos;ll receive a password reset link shortly.
                </p>
                <p className="text-white/40 text-xs mb-8">
                  The link will expire in 1 hour.
                </p>

                <div className="space-y-3">
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
                    Return to Sign In
                  </Button>
                  <Button
                    variant="bordered"
                    onPress={() => {
                      setFormState("form");
                      setEmail("");
                    }}
                    className="w-full font-semibold border-white/20 text-white hover:bg-white/5"
                    size="lg"
                  >
                    Try a different email
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
            Remember your password?{" "}
            <Link href="/signin" className="text-[#DCFF37] hover:underline">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </AuthBackground>
  );
}

