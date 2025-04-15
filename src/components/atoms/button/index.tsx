import { Button as RootButton, ButtonProps as RootButtonProps } from "@nextui-org/react";
import {ReactNode} from "react";

export interface ButtonProps
  extends RootButtonProps {
  label?: ReactNode | string;
  onPress?: () => void;
  color?: "primary" | "default" | "secondary" | "success" | "warning" | "danger";
  variant?: "ghost" | "solid" | "bordered" | "light" | "flat" | "faded" | "shadow";
  startContent?: ReactNode;
  endContent?: ReactNode;
}

export default function Button({onPress, label, color = 'primary', variant, startContent, endContent, ...rest}: ButtonProps) {
  return (
    <RootButton
      onPress={onPress}
      startContent={startContent}
      endContent={endContent}
      color={color}
      variant={variant}
      {...rest}
    >
      {label}
    </RootButton>
  )
}
