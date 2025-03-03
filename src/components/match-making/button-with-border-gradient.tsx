"use client";

import type {ButtonProps, LinkProps} from "@nextui-org/react";

import {Button} from "@nextui-org/react";
import Link from "next/link";

export type ButtonWithBorderGradientProps = ButtonProps &
  LinkProps & {
    background?: string;
  };

export const ButtonWithBorderGradient = ({
  children,
  background = "--nextui-background",
  style: styleProp,
  ...props
}: ButtonWithBorderGradientProps) => {
  const linearGradientBg = background?.startsWith("--") ? `hsl(var(${background}))` : background;

  const style = {
    border: "solid 2px transparent",
    // backgroundImage: `linear-gradient(${linearGradientBg}, ${linearGradientBg}), linear-gradient(to right, #FF4654, #FFC700)`,
    backgroundImage: `linear-gradient(${linearGradientBg}, ${linearGradientBg}), linear-gradient(to right, #FF4654, #FFC700)`,
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  };

  return (
    <Button
      as={Link}
      href="#"
      {...props}
      style={{
        ...style,
        ...styleProp,
      }}
      type="submit"
    >
      {children}
    </Button>
  );
};
