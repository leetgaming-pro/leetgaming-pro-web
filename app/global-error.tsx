'use client';

/**
 * Global Error Handler
 * This component catches unhandled errors and reports them to Sentry
 */

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@nextui-org/button';
import { Card, CardBody } from '@nextui-org/react';
import { Icon } from '@iconify/react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error, {
      tags: {
        type: 'global_error',
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-lg w-full rounded-none border-2 border-danger/20">
            <CardBody className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-danger/10 rounded-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}>
                <Icon icon="solar:danger-triangle-bold" className="text-danger" width={48} />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong!
              </h1>
              
              <p className="text-default-500 mb-6">
                We&apos;ve been notified and are working to fix the issue.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <div className="bg-danger/5 border border-danger/20 rounded-none p-4 mb-6 text-left">
                  <p className="text-sm font-mono text-danger break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-default-400 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  color="primary"
                  variant="solid"
                  size="lg"
                  className="rounded-none"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
                  onPress={() => reset()}
                  startContent={<Icon icon="solar:refresh-bold" width={20} />}
                >
                  Try Again
                </Button>
                
                <Button
                  color="default"
                  variant="bordered"
                  size="lg"
                  className="rounded-none"
                  onPress={() => window.location.href = '/'}
                  startContent={<Icon icon="solar:home-bold" width={20} />}
                >
                  Go Home
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </body>
    </html>
  );
}

