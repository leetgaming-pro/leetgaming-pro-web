"use client"
import React from "react";
import {Button, CheckboxIcon, Link} from "@nextui-org/react";

import {Icon} from "./icon";
import { useTheme } from "next-themes";

export default function CookieConsentBrandColors(params: any) {
  const { theme, setTheme } = useTheme()
  const isLightTheme = theme === "light"

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0" {...params}>
      <div className="pointer-events-auto flex w-full items-center justify-between gap-x-20 border border-divider px-6 py-4 shadow-small"
      style={{
        backgroundImage: `url('/blur-glow-pry-gh.svg')`,
        backgroundSize: "cover",
        width: "100%",
        height: "100%",
      }}
      >
        <p className="text-small font-normal text-primary-foreground">
          We use cookies to provide the best experience. By continuing to use our site, you agree to
          our&nbsp;
          <Link
            className="font-medium text-primary-foreground"
            href="#"
            size="sm"
            underline="always"
          >
            Cookie Policy.
          </Link>
          <Icon className="ml-2 inline-block h-8 w-8 text-primary-200" icon="lucide:cookie" />
        </p>
        <div className="flex items-center gap-2">
          <Button className="bg-primary-foreground font-medium text-primary" radius="lg">
            Accept
          </Button>
          <Button className="font-medium text-primary-foreground" radius="lg" variant="light">
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
