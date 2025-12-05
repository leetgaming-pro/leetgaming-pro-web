"use client"

import { useSearchParams } from 'next/navigation'
import { Button, Card, CardBody, CardFooter, CardHeader } from '@nextui-org/react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, { title: string; description: string; icon: string }> = {
    Configuration: {
      title: 'Configuration Error',
      description: 'There is a problem with the server configuration. Please contact support.',
      icon: 'solar:settings-broken'
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in. Please check your credentials.',
      icon: 'solar:shield-warning-broken'
    },
    Verification: {
      title: 'Verification Required',
      description: 'Please verify your email address or account before signing in.',
      icon: 'solar:letter-opened-broken'
    },
    OAuthSignin: {
      title: 'OAuth Sign In Error',
      description: 'Error occurred during OAuth sign in process. Please try again.',
      icon: 'solar:link-broken'
    },
    OAuthCallback: {
      title: 'OAuth Callback Error',
      description: 'Error occurred during OAuth callback. Please try signing in again.',
      icon: 'solar:refresh-broken'
    },
    OAuthCreateAccount: {
      title: 'Account Creation Failed',
      description: 'Could not create your account. Please try again or contact support.',
      icon: 'solar:user-broken'
    },
    EmailCreateAccount: {
      title: 'Email Account Error',
      description: 'Could not create account with this email. Please try a different email.',
      icon: 'solar:letter-broken'
    },
    Callback: {
      title: 'Callback Error',
      description: 'Error in authentication callback. Please try signing in again.',
      icon: 'solar:arrow-left-broken'
    },
    OAuthAccountNotLinked: {
      title: 'Account Not Linked',
      description: 'This account is already associated with another sign-in method.',
      icon: 'solar:link-circle-broken'
    },
    EmailSignin: {
      title: 'Email Sign In Error',
      description: 'Could not send sign in email. Please check your email address.',
      icon: 'solar:letter-unread-broken'
    },
    CredentialsSignin: {
      title: 'Invalid Credentials',
      description: 'The credentials you provided are incorrect. Please try again.',
      icon: 'solar:key-broken'
    },
    SessionRequired: {
      title: 'Session Required',
      description: 'You need to be signed in to access this page.',
      icon: 'solar:login-3-broken'
    },
    Default: {
      title: 'Authentication Error',
      description: 'An unexpected error occurred during authentication. Please try again.',
      icon: 'solar:danger-circle-broken'
    }
  }

  const errorInfo = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-4"
      style={{
        backgroundImage: "url('/blur-glow-pry-gh.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card className="max-w-md w-full bg-background/80 backdrop-blur-md backdrop-saturate-150">
        <CardHeader className="flex gap-3 items-center justify-center pb-0 pt-6">
          <Icon
            icon={errorInfo.icon}
            className="text-danger"
            width={48}
            height={48}
          />
        </CardHeader>
        <CardBody className="text-center px-6 py-4">
          <h1 className="text-2xl font-bold mb-2">{errorInfo.title}</h1>
          <p className="text-foreground/70 mb-4">{errorInfo.description}</p>
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <p className="text-xs text-foreground/60">Error Code: {error}</p>
            </div>
          )}
        </CardBody>
        <CardFooter className="flex flex-col gap-2 px-6 pb-6">
          <Button
            as={Link}
            href="/signin"
            color="primary"
            className="w-full"
            startContent={<Icon icon="solar:login-3-bold" width={20} />}
          >
            Try Again
          </Button>
          <Button
            as={Link}
            href="/"
            variant="light"
            className="w-full"
          >
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
