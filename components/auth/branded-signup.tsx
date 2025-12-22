"use client";

import React from "react";
import { Input, Checkbox, Link, Divider, Progress } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

import { SteamIcon } from "../icons";
import { EsportsButton } from "../ui/esports-button";
import { AuthBackground } from "./auth-background";

export default function BrandedSignUp() {
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/) || password.match(/[^a-zA-Z0-9]/))
      strength += 25;
    return strength;
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 25) return "danger";
    if (strength <= 50) return "warning";
    if (strength <= 75) return "primary";
    return "success";
  };

  const getStrengthLabel = () => {
    const strength = getPasswordStrength();
    if (strength <= 25) return "Weak";
    if (strength <= 50) return "Fair";
    if (strength <= 75) return "Good";
    return "Strong";
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword || !username) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms and Privacy Policy");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("email-password", {
        email,
        password,
        displayName: username, // Map username to displayName for the provider
        action: "signup",
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("already exists")) {
          setError("An account with this email already exists");
        } else if (result.error === "CredentialsSignin") {
          setError("Failed to create account. Please try again.");
        } else {
          setError(result.error);
        }
      } else if (result?.ok) {
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground variant="signup">
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
                BEGIN YOUR
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4654] dark:from-[#DCFF37] to-[#FFC700]">
                  LEGEND
                </span>
              </h1>
              <p className="text-xl text-[#34445C]/60 dark:text-[#F5F0E1]/60 max-w-md">
                Create your account and join the most competitive gaming
                community.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: "solar:gamepad-bold", text: "Multi-game matchmaking" },
                { icon: "solar:cup-star-bold", text: "Compete in tournaments" },
                { icon: "solar:chart-bold", text: "Track your progress" },
                { icon: "solar:wallet-money-bold", text: "Win real prizes" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 border border-[#FF4654]/30 dark:border-[#DCFF37]/30">
                    <Icon
                      icon={feature.icon}
                      className="text-[#FF4654] dark:text-[#DCFF37] text-xl"
                    />
                  </div>
                  <span className="text-[#34445C]/80 dark:text-[#F5F0E1]/80">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer testimonial */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-[#34445C]/5 dark:bg-white/5 border border-[#34445C]/10 dark:border-white/10 p-4"
          >
            <p className="text-[#34445C]/70 dark:text-[#F5F0E1]/70 italic mb-3">
              &ldquo;LeetGaming transformed how I compete. The platform is
              insane!&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF4654] dark:from-[#DCFF37] to-[#34445C]" />
              <div>
                <div className="text-[#34445C] dark:text-[#F5F0E1] font-semibold">ProPlayer_X</div>
                <div className="text-[#34445C]/40 dark:text-[#F5F0E1]/40 text-sm">Global Elite</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right side - Sign Up Form */}
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

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1] mb-2">
                  Create Account
                </h2>
                <p className="text-[#34445C]/50 dark:text-[#F5F0E1]/50 text-sm">
                  Start your competitive journey today
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleEmailSignUp}>
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
                  label="Username"
                  name="username"
                  placeholder="Choose your gamertag"
                  type="text"
                  variant="bordered"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  isDisabled={isLoading}
                  startContent={
                    <Icon icon="solar:user-bold" className="text-[#34445C]/30 dark:text-white/30" />
                  }
                  classNames={{
                    inputWrapper:
                      "rounded-none border-[#34445C]/20 dark:border-white/20 bg-[#34445C]/5 dark:bg-white/5 group-data-[focus=true]:border-[#FF4654] dark:group-data-[focus=true]:border-[#DCFF37] data-[hover=true]:border-[#34445C]/40 dark:data-[hover=true]:border-white/40",
                    input: "text-[#34445C] dark:text-white placeholder:text-[#34445C]/30 dark:placeholder:text-white/30",
                    label: "text-[#34445C]/70 dark:text-white/70",
                  }}
                />

                <Input
                  label="Email Address"
                  name="email"
                  placeholder="gamer@example.com"
                  type="email"
                  variant="bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isDisabled={isLoading}
                  startContent={
                    <Icon icon="solar:letter-bold" className="text-[#34445C]/30 dark:text-white/30" />
                  }
                  classNames={{
                    inputWrapper:
                      "rounded-none border-[#34445C]/20 dark:border-white/20 bg-[#34445C]/5 dark:bg-white/5 group-data-[focus=true]:border-[#FF4654] dark:group-data-[focus=true]:border-[#DCFF37] data-[hover=true]:border-[#34445C]/40 dark:data-[hover=true]:border-white/40",
                    input: "text-[#34445C] dark:text-white placeholder:text-[#34445C]/30 dark:placeholder:text-white/30",
                    label: "text-[#34445C]/70 dark:text-white/70",
                  }}
                />

                <div className="space-y-2">
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
                    placeholder="Min. 8 characters"
                    type={isVisible ? "text" : "password"}
                    variant="bordered"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isDisabled={isLoading}
                    startContent={
                      <Icon icon="solar:lock-bold" className="text-[#34445C]/30 dark:text-white/30" />
                    }
                    classNames={{
                      inputWrapper:
                        "rounded-none border-white/20 bg-white/5 group-data-[focus=true]:border-[#DCFF37] data-[hover=true]:border-white/40",
                      input: "text-white placeholder:text-white/30",
                      label: "text-white/70",
                    }}
                  />
                  {password && (
                    <div className="space-y-1">
                      <Progress
                        value={getPasswordStrength()}
                        color={getStrengthColor()}
                        size="sm"
                        className="h-1"
                      />
                      <p className="text-xs text-[#34445C]/40 dark:text-white/40">
                        Password strength:{" "}
                        <span
                          className={`font-medium ${
                            getStrengthColor() === "success"
                              ? "text-[#DCFF37]"
                              : getStrengthColor() === "warning"
                              ? "text-[#FFC700]"
                              : "text-[#FF4654]"
                          }`}
                        >
                          {getStrengthLabel()}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <Input
                  endContent={
                    <button type="button" onClick={toggleConfirmVisibility}>
                      <Icon
                        className="text-2xl text-[#34445C]/50 dark:text-white/50 hover:text-[#34445C] dark:hover:text-white transition-colors"
                        icon={
                          isConfirmVisible
                            ? "solar:eye-closed-linear"
                            : "solar:eye-bold"
                        }
                      />
                    </button>
                  }
                  label="Confirm Password"
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  type={isConfirmVisible ? "text" : "password"}
                  variant="bordered"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  isDisabled={isLoading}
                  startContent={
                    <Icon icon="solar:lock-bold" className="text-[#34445C]/30 dark:text-white/30" />
                  }
                  classNames={{
                    inputWrapper:
                      "rounded-none border-[#34445C]/20 dark:border-white/20 bg-[#34445C]/5 dark:bg-white/5 group-data-[focus=true]:border-[#FF4654] dark:group-data-[focus=true]:border-[#DCFF37] data-[hover=true]:border-[#34445C]/40 dark:data-[hover=true]:border-white/40",
                    input: "text-[#34445C] dark:text-white placeholder:text-[#34445C]/30 dark:placeholder:text-white/30",
                    label: "text-[#34445C]/70 dark:text-white/70",
                  }}
                />

                <Checkbox
                  size="sm"
                  isSelected={termsAccepted}
                  onValueChange={setTermsAccepted}
                  isDisabled={isLoading}
                  classNames={{
                    wrapper:
                      "before:border-[#34445C]/30 dark:before:border-white/30 rounded-none after:bg-[#FF4654] dark:after:bg-[#DCFF37]",
                    label: "text-[#34445C]/70 dark:text-white/70 text-sm",
                  }}
                >
                  I agree to the{" "}
                  <Link href="/legal/terms" className="text-[#DCFF37]">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="text-[#DCFF37]">
                    Privacy Policy
                  </Link>
                </Checkbox>

                <EsportsButton
                  variant="action"
                  size="lg"
                  fullWidth
                  type="submit"
                  loading={isLoading}
                  disabled={
                    isLoading ||
                    !email ||
                    !password ||
                    !confirmPassword ||
                    !username ||
                    !termsAccepted
                  }
                >
                  {isLoading ? "Creating account..." : "JOIN THE BATTLE"}
                </EsportsButton>
              </form>

              <div className="flex items-center gap-4 my-6">
                <Divider className="flex-1 bg-[#34445C]/10 dark:bg-white/10" />
                <span className="text-[#34445C]/30 dark:text-white/30 text-xs uppercase tracking-wider">
                  or sign up with
                </span>
                <Divider className="flex-1 bg-[#34445C]/10 dark:bg-white/10" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <EsportsButton
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() =>
                    signIn("steam", { callbackUrl: "/onboarding" })
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
                    signIn("google", { callbackUrl: "/onboarding" })
                  }
                >
                  <Icon icon="flat-color-icons:google" className="w-5 h-5" />
                  Google
                </EsportsButton>
              </div>

              <p className="text-center text-sm text-[#34445C]/50 dark:text-white/50 mt-6">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-[#FF4654] hover:text-[#FFC700] transition-colors"
                >
                  Sign In
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
