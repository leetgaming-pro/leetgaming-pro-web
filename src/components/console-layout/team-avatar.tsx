"use client";

import type {AvatarProps} from "@nextui-org/react";

import React from "react";
import {Avatar} from "@nextui-org/react";

import {cl} from "../cl";

const TeamAvatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({name, className, classNames = {}, ...props}, ref) => (
    <Avatar
      {...props}
      ref={ref}
      classNames={{
        ...classNames,
        base: cl("bg-transparent border border-divider", classNames?.base, className),
        name: cl("text-default-500 text-[0.6rem] font-semibold", classNames?.name),
      }}
      getInitials={(name) =>
        (name[0] || "") + (name[name.lastIndexOf(" ") + 1] || "").toUpperCase()
      }
      name={name}
      radius="md"
      size="sm"
    />
  ),
);

TeamAvatar.displayName = "TeamAvatar";

export default TeamAvatar;
