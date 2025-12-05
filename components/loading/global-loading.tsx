"use client"

import { Spinner } from "@nextui-org/react"

export function GlobalLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner
          size="lg"
          color="primary"
          classNames={{
            circle1: "border-b-primary",
            circle2: "border-b-primary",
          }}
        />
        <p className="text-sm text-foreground/60 font-medium">Loading...</p>
      </div>
    </div>
  )
}

export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex w-full items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <Spinner
          size="lg"
          color="primary"
          classNames={{
            circle1: "border-b-primary",
            circle2: "border-b-primary",
          }}
        />
        <p className="text-sm text-foreground/60 font-medium">{message}</p>
      </div>
    </div>
  )
}

export function InlineLoading({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Spinner
      size={size}
      color="primary"
      classNames={{
        circle1: "border-b-primary",
        circle2: "border-b-primary",
      }}
    />
  )
}
