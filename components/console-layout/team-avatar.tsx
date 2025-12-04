"use client";

import React from "react";
import {Avatar} from "@nextui-org/react";

import {cl} from "../cl";

interface TeamAvatarProps {
  name?: string;
  className?: string;
  classNames?: {
    base?: string;
    name?: string;
    [key: string]: string | undefined;
  };
  src?: string;
}

const TeamAvatar = React.forwardRef<HTMLSpanElement, TeamAvatarProps>(
  ({name, className, classNames = {}, src}, ref) => (
    <Avatar
      ref={ref}
      src={src}
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
