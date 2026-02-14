"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - ERROR BOUNDARY PAGE                                         ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Award-winning error page with LeetGaming branding.                          ║
 * ║  Shows helpful error information while maintaining brand identity.           ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/react";
import { Icon } from "@iconify/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error("[LeetGaming Error]", error);

    // Report the error to Sentry
    Sentry.captureException(error, {
      tags: {
        type: "page_error",
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
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

          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-danger/5 to-transparent dark:from-[#FF4654]/10 dark:to-transparent pointer-events-none" />

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
          <h1 className="relative text-2xl font-bold text-foreground mb-2">
            <span className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#FF4654] dark:to-[#DCFF37] bg-clip-text text-transparent">
              Unexpected Error
            </span>
          </h1>

          {/* Description */}
          <p className="relative text-default-500 mb-6">
            Something didn&apos;t go as planned. We&apos;ve been notified and
            are working on it.
          </p>

          {/* Error details in development */}
          {process.env.NODE_ENV === "development" && (
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
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-default-400 cursor-pointer hover:text-default-600 transition-colors">
                    Stack trace
                  </summary>
                  <pre className="text-xs text-default-400 mt-2 overflow-auto max-h-32 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
              {error.digest && (
                <p className="text-xs text-default-400 mt-2">
                  Error ID:{" "}
                  <code className="bg-default-100 px-1 rounded">
                    {error.digest}
                  </code>
                </p>
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
              onPress={reset}
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
    </div>
  );
}
