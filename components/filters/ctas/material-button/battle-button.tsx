import React from "react";
import { Button } from "@nextui-org/react";
import clsx from "clsx";

interface BattleButtonProps {
  children?: React.ReactNode;
  className?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
  isDisabled?: boolean;
  onPress?: () => void;
  onClick?: () => void;
  startContent?: React.ReactNode;
}

export default function BattleButton({
  className,
  children,
  name,
  size = "md",
  color = "primary",
  variant = "solid",
  isDisabled = false,
  onPress,
  onClick,
  startContent,
}: BattleButtonProps) {
  return (
    <Button
      size={size}
      color={color}
      variant={variant}
      isDisabled={isDisabled}
      onPress={onPress}
      onClick={onClick}
      name={name}
      startContent={startContent}
      className={clsx("battle-button", className)}
    >
      {children}
    </Button>
  );
}
