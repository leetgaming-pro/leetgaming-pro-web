"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Progress, Spinner } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AuthBackground } from "@/components/auth";

type VerificationState =
  | "loading"
  | "success"
  | "error"
  | "expired"
  | "no-token";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("no-token");
      setMessage("No verification token provided.");
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setState("loading");

    try {
      const response = await fetch(
        `/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`
      );
      const data = await response.json();

      if (data.verified || data.success) {
        setState("success");
        setMessage(
          data.message || "Your email has been verified successfully!"
        );
      } else if (data.message?.includes("expired")) {
        setState("expired");
        setMessage(data.message);
      } else {
        setState("error");
        setMessage(
          data.message || data.error || "Verification failed. Please try again."
        );
      }
    } catch (error) {
      setState("error");
      setMessage("An error occurred during verification. Please try again.");
      console.error("Verification error:", error);
    }
  };

  const handleContinue = () => {
    router.push("/match-making");
  };

  const handleSignIn = () => {
    router.push("/signin");
  };

  const handleResend = () => {
    router.push("/signin");
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
            <motion.h1
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              LeetGaming<span className="text-[#FF4654]">.PRO</span>
            </motion.h1>
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
            {state === "loading" && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 flex items-center justify-center">
                  <Spinner size="lg" color="warning" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-white/60 text-sm">
                  Please wait while we verify your email address...
                </p>
                <Progress
                  color="warning"
                  isIndeterminate
                  aria-label="Verifying..."
                  className="max-w-xs mx-auto mt-6"
                  size="sm"
                />
              </div>
            )}

            {/* Success State */}
            {state === "success" && (
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
                  Email Verified! 🎉
                </h2>
                <p className="text-white/60 text-sm mb-8">{message}</p>

                <Button
                  onPress={handleContinue}
                  className="w-full font-bold text-[#34445C]"
                  style={{
                    background:
                      "linear-gradient(135deg, #DCFF37 0%, #FFC700 100%)",
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                  size="lg"
                >
                  Continue to LeetGaming
                  <Icon
                    icon="solar:arrow-right-bold"
                    className="w-5 h-5 ml-2"
                  />
                </Button>
              </div>
            )}

            {/* Error State */}
            {state === "error" && (
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
                  Verification Failed
                </h2>
                <p className="text-white/60 text-sm mb-8">{message}</p>

                <div className="space-y-3">
                  <Button
                    onPress={handleResend}
                    className="w-full font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF4654 0%, #FFC700 100%)",
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                    size="lg"
                  >
                    <Icon icon="solar:restart-bold" className="w-5 h-5 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    variant="bordered"
                    onPress={handleSignIn}
                    className="w-full font-semibold border-white/20 text-white hover:bg-white/5"
                    size="lg"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            )}

            {/* Expired State */}
            {state === "expired" && (
              <div className="text-center py-8">
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FFC700]/20 to-[#FFC700]/40 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Icon
                    icon="solar:clock-circle-bold"
                    className="w-10 h-10 text-[#FFC700]"
                  />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Link Expired
                </h2>
                <p className="text-white/60 text-sm mb-8">
                  This verification link has expired. Please request a new
                  verification email.
                </p>

                <div className="space-y-3">
                  <Button
                    onPress={handleResend}
                    className="w-full font-bold text-[#34445C]"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFC700 0%, #DCFF37 100%)",
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                    size="lg"
                  >
                    <Icon icon="solar:letter-bold" className="w-5 h-5 mr-2" />
                    Request New Email
                  </Button>
                  <Button
                    variant="bordered"
                    onPress={handleSignIn}
                    className="w-full font-semibold border-white/20 text-white hover:bg-white/5"
                    size="lg"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            )}

            {/* No Token State */}
            {state === "no-token" && (
              <div className="text-center py-8">
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#FF4654]/20 to-[#FF4654]/40 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Icon
                    icon="solar:question-circle-bold"
                    className="w-10 h-10 text-[#FF4654]"
                  />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Invalid Link
                </h2>
                <p className="text-white/60 text-sm mb-8">{message}</p>

                <Button
                  onPress={handleSignIn}
                  className="w-full font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF4654 0%, #FFC700 100%)",
                    clipPath:
                      "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                  size="lg"
                >
                  Go to Sign In
                </Button>
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
            <a href="/help" className="text-[#DCFF37] hover:underline">
              Contact Support
            </a>
          </motion.p>
        </motion.div>
      </div>
    </AuthBackground>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center w-full h-screen bg-black">
          <div className="text-2xl font-bold text-white mb-4">
            LeetGaming<span className="text-[#FF4654]">.PRO</span>
          </div>
          <Progress
            color="warning"
            isIndeterminate
            aria-label="Loading..."
            className="max-w-md"
            size="sm"
          />
          <span className="text-white/50 mt-4">Loading...</span>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
