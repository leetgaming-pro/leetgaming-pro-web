"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - ERROR BOUNDARY COMPONENT                                    ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Award-winning error boundary with LeetGaming branding.                      ║
 * ║  Catches React errors and displays helpful error information.                ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { Component, ReactNode } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[LeetGaming ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
          <Card
            className="max-w-md w-full rounded-none border-2 border-danger/20 dark:border-[#FF4654]/30"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
            }}
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#FF4654] dark:via-[#DCFF37] dark:to-[#FF4654]" />

            <CardHeader className="flex gap-3 items-center justify-center pb-0 pt-8">
              <div
                className="w-16 h-16 flex items-center justify-center bg-danger/10 dark:bg-[#FF4654]/20"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon="solar:bug-bold-duotone"
                  className="text-danger dark:text-[#FF4654]"
                  width={40}
                  height={40}
                />
              </div>
            </CardHeader>
            <CardBody className="text-center px-6 py-4">
              <h1 className="text-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#FF4654] dark:to-[#DCFF37] bg-clip-text text-transparent">
                  Unexpected Error
                </span>
              </h1>
              <p className="text-foreground/70 mb-4">
                Something didn&apos;t go as planned. Please try refreshing the
                page.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div
                  className="mt-4 p-3 bg-danger/5 dark:bg-[#FF4654]/10 border border-danger/20 dark:border-[#FF4654]/30 text-left"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      icon="solar:code-bold"
                      className="text-danger dark:text-[#FF4654]"
                      width={14}
                    />
                    <span className="text-xs font-semibold text-danger dark:text-[#FF4654] uppercase tracking-wider">
                      Debug Info
                    </span>
                  </div>
                  <p className="text-xs font-mono text-danger dark:text-[#FF4654]/90 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </CardBody>
            <CardFooter className="flex flex-col gap-2 px-6 pb-6">
              <Button
                className="w-full bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#FF4654] dark:to-[#DCFF37] text-white dark:text-black font-bold rounded-none"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                }}
                onClick={() => window.location.reload()}
                startContent={<Icon icon="solar:refresh-bold" width={20} />}
              >
                Refresh Page
              </Button>
              <Button
                variant="bordered"
                className="w-full border-[#34445C]/30 dark:border-[#DCFF37]/30 text-[#34445C] dark:text-[#DCFF37] hover:bg-[#34445C]/5 dark:hover:bg-[#DCFF37]/10 rounded-none"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                }}
                onClick={() => (window.location.href = "/")}
              >
                Go to Homepage
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export function PageError({
  title = "Unexpected Error",
  message = "An error occurred while loading this page",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-center py-20">
      <Card
        className="max-w-md w-full rounded-none border-2 border-danger/20 dark:border-[#FF4654]/30"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
        }}
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#FF4654] dark:via-[#DCFF37] dark:to-[#FF4654]" />

        <CardHeader className="flex gap-3 items-center justify-center pb-0 pt-6">
          <div
            className="w-12 h-12 flex items-center justify-center bg-danger/10 dark:bg-[#FF4654]/20"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
            }}
          >
            <Icon
              icon="solar:danger-triangle-bold-duotone"
              className="text-danger dark:text-[#FF4654]"
              width={28}
              height={28}
            />
          </div>
        </CardHeader>
        <CardBody className="text-center px-6 py-4">
          <h2 className="text-xl font-bold mb-2">
            <span className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#FF4654] dark:to-[#DCFF37] bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="text-foreground/70">{message}</p>
        </CardBody>
        {onRetry && (
          <CardFooter className="flex justify-center px-6 pb-6">
            <Button
              className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#FF4654] dark:to-[#DCFF37] text-white dark:text-black font-bold rounded-none"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
              }}
              onClick={onRetry}
              startContent={<Icon icon="solar:refresh-bold" width={20} />}
            >
              Try Again
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
