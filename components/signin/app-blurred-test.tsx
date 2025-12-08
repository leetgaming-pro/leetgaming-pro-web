"use client";

import type {InputProps} from "@nextui-org/react";

import React from "react";
import {Input, Checkbox, Link, Divider} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SteamIcon } from "../icons";
import { GoogleIcon } from "./social";
import { EsportsButton } from "../ui/esports-button";

export default function SignInBlurreds() {
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
      const result = await signIn('email-password', {
        email,
        password,
        action: 'login',
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error);
      } else if (result?.ok) {
        router.push('/match-making');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses: InputProps["classNames"] = {
    inputWrapper:
      "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30 bg-[#F5F0E1]/50 dark:bg-[#0a0a0a]/50 group-data-[focus=true]:border-[#FF4654] dark:group-data-[focus=true]:border-[#DCFF37] data-[hover=true]:border-[#FF4654]/50 dark:data-[hover=true]:border-[#DCFF37]/50",
    input: "text-[#34445C] dark:text-[#F5F0E1]",
    label: "text-[#34445C] dark:text-[#F5F0E1]",
  };

  return (
    <div
    className="flex h-screen w-screen items-center justify-center overflow-hidden bg-content1 p-2 sm:p-4 lg:p-8"
    style={{
      backgroundImage:
        "url('/blur-glow-pry-gh.svg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
      <div 
        className="flex w-full max-w-sm flex-col gap-4 rounded-none bg-[#F5F0E1]/90 dark:bg-[#1a1a1a]/90 px-8 pb-10 pt-6 shadow-2xl backdrop-blur-md backdrop-saturate-150 border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)' }}
      >
        {/* Brand accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />
        
        <div className="text-center pb-2">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
            <span className="text-xl text-[#F5F0E1] dark:text-[#34445C]">🎮</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#34445C] dark:text-[#F5F0E1]">Welcome Back</h1>
          <p className="text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60 mt-1">Sign in to your account</p>
        </div>
        <form className="flex flex-col gap-3" onSubmit={handleEmailSignIn}>
          {error && (
            <div className="rounded-md bg-danger-50 dark:bg-danger-900/20 p-3 text-sm text-danger">
              {error}
            </div>
          )}
          <Input
            classNames={inputClasses}
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isDisabled={isLoading}
          />
          <Input
            classNames={inputClasses}
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-foreground/50"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-foreground/50"
                    icon="solar:eye-bold"
                  />
                )}
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
          />
          <div className="flex items-center justify-between px-1 py-2">
            <Checkbox
              classNames={{
                wrapper: "before:border-[#34445C]/50 dark:before:border-[#DCFF37]/50 rounded-none",
                icon: "text-[#FF4654] dark:text-[#DCFF37]",
              }}
              name="remember"
              size="sm"
            >
              <span className="text-[#34445C] dark:text-[#F5F0E1]">Remember me</span>
            </Checkbox>
            <Link className="text-[#FF4654] dark:text-[#DCFF37]" href="/help" size="sm">
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
            {isLoading ? 'Signing in...' : 'Log In'}
          </EsportsButton>
        </form>
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="shrink-0 text-tiny text-default-500">OR</p>
          <Divider className="flex-1" />
        </div>
        <div className="flex flex-col gap-2">
          <EsportsButton
            variant="action"
            size="lg"
            fullWidth
            onClick={() => signIn("steam", { callbackUrl: "/match-making" })}
          >
            <SteamIcon />
            Continue with Steam
          </EsportsButton>
          <EsportsButton
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => signIn("google", { callbackUrl: "/match-making" })}
          >
            <GoogleIcon width={24} />
            Continue with Google
          </EsportsButton>
        </div>
        <p className="text-center text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60">
          Need to create an account?{" "}
          <Link href="/signup" size="sm" className="font-medium text-[#FF4654] dark:text-[#DCFF37]">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
