/**
 * Match-Making Page - Award-Winning Wizard Experience
 * Complete 5-step wizard for competitive matchmaking
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import MatchmakingWizard from "@/components/match-making/App";
import { PageContainer } from "@/components/layout/page-container";
import { Button, Card, CardBody } from "@nextui-org/react";
import { Icon } from "@iconify/react";

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class MatchmakingErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Matchmaking Error]", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <PageContainer
          maxWidth="md"
          padding="md"
          className="min-h-[60vh] flex items-center justify-center"
        >
          <Card
            className="max-w-lg w-full rounded-none border-2 border-danger/20 dark:border-[#FF4654]/30"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
            }}
          >
            <CardBody className="p-8 text-center relative overflow-hidden">
              {/* Accent bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#FF4654] dark:via-[#DCFF37] dark:to-[#FF4654]" />

              {/* Icon */}
              <div
                className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-danger/10 dark:bg-[#FF4654]/20"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon="solar:bug-bold-duotone"
                  className="text-danger dark:text-[#FF4654]"
                  width={48}
                />
              </div>

              {/* Title */}
              <h2 className="relative text-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#FF4654] dark:to-[#DCFF37] bg-clip-text text-transparent">
                  Matchmaking Error
                </span>
              </h2>

              {/* Description */}
              <p className="relative text-default-500 mb-4">
                Something went wrong while loading the matchmaker. Please try
                again.
              </p>

              {/* Error details - always show for debugging */}
              {this.state.error && (
                <div
                  className="bg-danger/5 dark:bg-[#FF4654]/10 border border-danger/20 dark:border-[#FF4654]/30 p-4 mb-6 text-left"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      icon="solar:code-bold"
                      className="text-danger dark:text-[#FF4654]"
                      width={16}
                    />
                    <span className="text-xs font-semibold text-danger dark:text-[#FF4654] uppercase tracking-wider">
                      Debug Info
                    </span>
                  </div>
                  <p className="text-sm font-mono text-danger dark:text-[#FF4654]/90 break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-default-400 cursor-pointer hover:text-default-600 transition-colors">
                        Component stack
                      </summary>
                      <pre className="text-xs text-default-400 mt-2 overflow-auto max-h-32 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#FF4654] dark:to-[#DCFF37] text-white dark:text-black font-bold rounded-none"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  }}
                  startContent={<Icon icon="solar:refresh-bold" width={20} />}
                  onPress={this.handleRetry}
                >
                  Try Again
                </Button>

                <Button
                  variant="bordered"
                  className="border-[#34445C]/30 dark:border-[#DCFF37]/30 text-[#34445C] dark:text-[#DCFF37] hover:bg-[#34445C]/5 dark:hover:bg-[#DCFF37]/10 rounded-none"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  }}
                  startContent={<Icon icon="solar:home-2-bold" width={20} />}
                  onPress={() => (window.location.href = "/")}
                >
                  Go Home
                </Button>
              </div>
            </CardBody>
          </Card>
        </PageContainer>
      );
    }

    return this.props.children;
  }
}

export default function MatchMakingPage() {
  return (
    <MatchmakingErrorBoundary>
      <PageContainer maxWidth="full" padding="none" className="min-h-screen">
        <MatchmakingWizard />
      </PageContainer>
    </MatchmakingErrorBoundary>
  );
}
