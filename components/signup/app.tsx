"use client";

import React from "react";
import {Input, Checkbox, Link, Divider} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { SteamIcon } from '../icons';
import { EsportsButton } from '../ui/esports-button';

import DefaultLogo from '../logo/logo-full';

export default function SignUp() {
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the Terms and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('email-password', {
        email,
        password,
        action: 'signup',
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('already exists')) {
          setError('An account with this email already exists');
        } else if (result.error === 'CredentialsSignin') {
          setError('Failed to create account. Please try again.');
        } else {
          setError(result.error);
        }
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
      {/* Brand Logo */}
      <div className="absolute right-10 top-10">
        {/* <div className="flex items-center">
          <DefaultLogo size={24}/>
        </div> */}
      </div>

      {/* Testimonial */}
      <div className="absolute bottom-10 right-10 hidden md:block">
        <p className="max-w-xl text-right text-white/60">
          <span className="font-medium">“</span>
        Get quick and quality matches to your favorite games, and more.
          <span className="font-medium">”</span>
        </p>
        - LeetGaming.PRO Team
      </div>

      {/* Sign Up Form */}
      <div 
        className="relative flex w-full max-w-sm flex-col gap-4 rounded-none bg-[#F5F0E1]/90 dark:bg-[#1a1a1a]/90 px-8 pb-10 pt-6 shadow-2xl backdrop-blur-md backdrop-saturate-150 border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)' }}
      >
        {/* Brand accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />
        
        <div className="text-center pb-2">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
            <span className="text-xl text-[#F5F0E1] dark:text-[#34445C]">🎮</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#34445C] dark:text-[#F5F0E1]">Create Account</h1>
          <p className="text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60 mt-1">Join LeetGaming.PRO today</p>
        </div>
        <form className="flex flex-col gap-3" onSubmit={handleEmailSignUp}>
          {error && (
            <div className="rounded-md bg-danger-50 dark:bg-danger-900/20 p-3 text-sm text-danger">
              {error}
            </div>
          )}
          <Input
            isRequired
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
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Password"
            name="password"
            placeholder="Enter your password (min 8 characters)"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isDisabled={isLoading}
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleConfirmVisibility}>
                {isConfirmVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Confirm your password"
            type={isConfirmVisible ? "text" : "password"}
            variant="bordered"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            isDisabled={isLoading}
          />
          <Checkbox
            isRequired
            className="py-4"
            size="sm"
            isSelected={termsAccepted}
            onValueChange={setTermsAccepted}
            isDisabled={isLoading}
          >
            I agree with the&nbsp;
            <Link href="/legal/terms" size="sm">
              Terms
            </Link>
            &nbsp; and&nbsp;
            <Link href="/legal/privacy" size="sm">
              Privacy Policy
            </Link>
          </Checkbox>
          <EsportsButton
            variant="primary"
            size="lg"
            fullWidth
            type="submit"
            loading={isLoading}
            disabled={isLoading || !email || !password || !confirmPassword}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
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
            onClick={() => {
              if (typeof window !== 'undefined') import('next-auth/react').then(m => m.signIn('steam', { callbackUrl: '/match-making' }))
            }}
          >
            <SteamIcon />
            Continue with Steam
          </EsportsButton>
          <EsportsButton
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => {
              if (typeof window !== 'undefined') import('next-auth/react').then(m => m.signIn('google', { callbackUrl: '/match-making' }))
            }}
          >
            <Icon icon="flat-color-icons:google" width={24} />
            Continue with Google
          </EsportsButton>
        </div>
        <p className="text-center text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60">
          Already have an account?{" "}
          <Link href="/signin" size="sm" className="font-medium text-[#FF4654] dark:text-[#DCFF37]">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
