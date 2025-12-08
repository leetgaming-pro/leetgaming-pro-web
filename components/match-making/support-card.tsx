"use client";

import React from "react";
import { EsportsButton } from "@/components/ui/esports-button";
import {Icon} from "@iconify/react";
import {cn} from "@nextui-org/react";

export type SupportCardProps = React.HTMLAttributes<HTMLDivElement>;

const SupportCard = React.forwardRef<HTMLDivElement, SupportCardProps>(
  ({className, ...props}, ref) => (
    <div
      {...props}
      ref={ref}
      className={cn(
        "align-center my-2 flex shrink-0 items-center justify-center gap-3 self-stretch rounded-none bg-content1 px-3 py-3 shadow-small",
        className,
      )}
    >
      <div className="flex items-center justify-center w-[32px] h-[32px] rounded-none bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]">
        <Icon
          className="text-white"
          icon="solar:headphones-round-bold"
          width={18}
        />
      </div>
      <div className="line-clamp-2 text-left text-tiny font-medium text-white/90 dark:text-white/70">
        Need help? Our support team is ready.
      </div>
      <EsportsButton
        variant="ghost"
        size="sm"
        className="h-[32px] w-[32px] min-w-[32px] p-0"
      >
        <Icon
          className="text-default-400 dark:text-foreground [&>g>path:nth-child(1)]:stroke-[3px] [&>g>path:nth-child(2)]:stroke-[2.5px]"
          icon="solar:chat-round-dots-linear"
          width={20}
        />
      </EsportsButton>
    </div>
  ),
);

SupportCard.displayName = "SupportCard";

export default SupportCard;
