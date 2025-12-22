"use client";

import React from "react";
import { Input, Checkbox, Link, Divider } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

import { SteamIcon } from "../icons";
import { EsportsButton } from "../ui/esports-button";
import { AuthBackground } from "./auth-background";

export default function BrandedSignIn() {
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("email-password", {
        email,
        password,
        action: "login",
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
      } else if (result?.ok) {
        // Refresh the page to let signin page check for RID and redirect properly
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground variant="signin">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-red-only-text.png"
                alt="LeetGaming"
                width={180}
                height={40}
                style={{ objectFit: "contain" }}
              />
            </Link>
          </motion.div>

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-5xl font-black text-[#34445C] dark:text-[#F5F0E1] leading-tight mb-4">
                WELCOME BACK,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4654] to-[#FFC700]">
                  CHAMPION
                </span>
              </h1>
              <p className="text-xl text-[#34445C]/60 dark:text-[#F5F0E1]/60 max-w-md">
                Your next victory awaits. Sign in to continue your competitive
                journey.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF4654]">50K+</div>
                <div className="text-sm text-[#34445C]/40 dark:text-[#F5F0E1]/40">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF4654] dark:text-[#DCFF37]">1M+</div>
                <div className="text-sm text-[#34445C]/40 dark:text-[#F5F0E1]/40">Matches Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FFC700]">$100K+</div>
                <div className="text-sm text-[#34445C]/40 dark:text-[#F5F0E1]/40">Prizes Awarded</div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-6"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4654] to-[#34445C] border-2 border-white dark:border-black"
                />
              ))}
            </div>
            <p className="text-sm text-[#34445C]/40 dark:text-[#F5F0E1]/40">
              Join <span className="text-[#34445C] dark:text-[#F5F0E1]">2,847</span> players online now
            </p>
          </motion.div>
        </div>

        {/* Right side - Sign In Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div
              className="relative bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-[#34445C]/10 dark:border-white/10 p-8 sm:p-10"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
              }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#DCFF37]" />

              {/* Mobile logo */}
              <div className="lg:hidden flex justify-center mb-8">
                <Image
                  src="/logo-red-only-text.png"
                  alt="LeetGaming"
                  width={200}
                  height={45}
                  style={{ objectFit: "contain" }}
                />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#34445C] dark:text-white mb-2">Sign In</h2>
                <p className="text-[#34445C]/50 dark:text-white/50 text-sm">
                  Enter your credentials to continue
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleEmailSignIn}>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#FF4654]/10 border border-[#FF4654]/30 rounded-none p-3 text-sm text-[#FF4654]"
                  >
                    {error}
                  </motion.div>
                )}

                <Input
                  label="Email Address"
                  name="email"
                  placeholder="gamer@leetgaming.pro"
                  type="email"
                  variant="bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isDisabled={isLoading}
                  classNames={{
                    inputWrapper:
                      "rounded-none border-[#34445C]/20 dark:border-white/20 bg-[#34445C]/5 dark:bg-white/5 group-data-[focus=true]:border-[#FF4654] data-[hover=true]:border-[#34445C]/40 dark:data-[hover=true]:border-white/40",
                    input: "text-[#34445C] dark:text-white placeholder:text-[#34445C]/30 dark:placeholder:text-white/30",
                    label: "text-[#34445C]/70 dark:text-white/70",
                  }}
                />

                <Input
                  endContent={
                    <button type="button" onClick={toggleVisibility}>
                      <Icon
                        className="text-2xl text-[#34445C]/50 dark:text-white/50 hover:text-[#34445C] dark:hover:text-white transition-colors"
                        icon={
                          isVisible
                            ? "solar:eye-closed-linear"
                            : "solar:eye-bold"
                        }
                      />
                    </button>
                  }
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  type={isVisible ? "text" : "password"}
                  variant="bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isDisabled={isLoading}
                  classNames={{
                    inputWrapper:
                      "rounded-none border-[#34445C]/20 dark:border-white/20 bg-[#34445C]/5 dark:bg-white/5 group-data-[focus=true]:border-[#FF4654] data-[hover=true]:border-[#34445C]/40 dark:data-[hover=true]:border-white/40",
                    input: "text-[#34445C] dark:text-white placeholder:text-[#34445C]/30 dark:placeholder:text-white/30",
                    label: "text-[#34445C]/70 dark:text-white/70",
                  }}
                />

                <div className="flex items-center justify-between py-2">
                  <Checkbox
                    classNames={{
                      wrapper:
                        "before:border-[#34445C]/30 dark:before:border-white/30 rounded-none after:bg-[#FF4654]",
                      label: "text-[#34445C]/70 dark:text-white/70 text-sm",
                    }}
                    size="sm"
                  >
                    Remember me
                  </Checkbox>
                  <Link
                    href="/forgot-password"
                    className="text-[#FF4654] hover:text-[#FFC700] text-sm transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <EsportsButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? "Signing in..." : "ENTER THE ARENA"}
                </EsportsButton>
              </form>

              <div className="flex items-center gap-4 my-6">
                <Divider className="flex-1 bg-[#34445C]/10 dark:bg-white/10" />
                <span className="text-[#34445C]/30 dark:text-white/30 text-xs uppercase tracking-wider">
                  or continue with
                </span>
                <Divider className="flex-1 bg-[#34445C]/10 dark:bg-white/10" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <EsportsButton
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() =>
                    signIn("steam", { callbackUrl: "/signin?callbackUrl=/match-making" })
                  }
                >
                  <SteamIcon className="w-5 h-5" />
                  Steam
                </EsportsButton>
                <EsportsButton
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() =>
                    signIn("google", { callbackUrl: "/signin?callbackUrl=/match-making" })
                  }
                >
                  <Icon icon="flat-color-icons:google" className="w-5 h-5" />
                  Google
                </EsportsButton>
              </div>

              <p className="text-center text-sm text-[#34445C]/50 dark:text-white/50 mt-6">
                New to LeetGaming?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[#FF4654] dark:text-[#DCFF37] hover:text-[#FFC700] transition-colors"
                >
                  Create Account
                </Link>
              </p>

              {/* Corner cut decoration */}
              <div
                className="absolute bottom-0 right-0 w-6 h-6 border-l border-t border-[#34445C]/10 dark:border-white/10"
                style={{ transform: "translate(50%, 50%) rotate(45deg)" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </AuthBackground>
  );
}
