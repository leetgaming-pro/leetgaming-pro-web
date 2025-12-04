"use client"

import { Component, ReactNode } from "react"
import { Button, Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader className="flex gap-3 items-center justify-center pb-0 pt-6">
              <Icon
                icon="solar:danger-circle-bold"
                className="text-danger"
                width={48}
                height={48}
              />
            </CardHeader>
            <CardBody className="text-center px-6 py-4">
              <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-foreground/70 mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-left">
                  <p className="text-xs font-mono text-foreground/80 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </CardBody>
            <CardFooter className="flex flex-col gap-2 px-6 pb-6">
              <Button
                color="primary"
                className="w-full"
                onClick={() => window.location.reload()}
                startContent={<Icon icon="solar:refresh-bold" width={20} />}
              >
                Refresh Page
              </Button>
              <Button
                variant="light"
                className="w-full"
                onClick={() => (window.location.href = "/")}
              >
                Go to Homepage
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export function PageError({
  title = "Something went wrong",
  message = "An error occurred while loading this page",
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex w-full items-center justify-center py-20">
      <Card className="max-w-md w-full">
        <CardHeader className="flex gap-3 items-center justify-center pb-0 pt-6">
          <Icon
            icon="solar:danger-circle-bold"
            className="text-danger"
            width={40}
            height={40}
          />
        </CardHeader>
        <CardBody className="text-center px-6 py-4">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-foreground/70">{message}</p>
        </CardBody>
        {onRetry && (
          <CardFooter className="flex justify-center px-6 pb-6">
            <Button
              color="primary"
              onClick={onRetry}
              startContent={<Icon icon="solar:refresh-bold" width={20} />}
            >
              Try Again
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
