"use client";

import React from "react";
import {Button} from "@nextui-org/react";
import Link from "next/link";

export interface ButtonWithBorderGradientProps {
  children: React.ReactNode;
  background?: string;
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  isDisabled?: boolean;
  type?: "button" | "submit" | "reset";
  onPress?: () => void;
}

export const ButtonWithBorderGradient = ({
  children,
  background = "--nextui-background",
  href = "#",
  className = "",
  size = "md",
  radius = "full",
  isDisabled = false,
  type = "button",
  onPress,
}: ButtonWithBorderGradientProps) => {
  const linearGradientBg = background?.startsWith("--") ? `hsl(var(${background}))` : background;

  // E-sports inspired gradient - purple to cyan
  const style = {
    border: "solid 2px transparent",
    backgroundImage: `linear-gradient(${linearGradientBg}, ${linearGradientBg}), linear-gradient(to right, #8B5CF6, #22D3EE)`,
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  };

  return (
    <Button
      as={Link}
      href={href}
      size={size}
      radius={radius}
      isDisabled={isDisabled}
      type={type}
      onPress={onPress}
      className={`font-bold uppercase tracking-wide hover:scale-105 transition-transform ${className}`}
      style={style}
    >
      {children}
    </Button>
  );
};
