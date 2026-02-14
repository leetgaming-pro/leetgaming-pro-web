import * as React from "react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";

import { EsportsButton } from "../ui/esports-button";

export interface BackButtonProps {
  className?: string;
  isDisabled?: boolean;
}

export interface NextButtonProps {
  children?: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
}

type MultistepNavigationButtonsProps = React.HTMLAttributes<HTMLDivElement> & {
  onBack?: () => void;
  onNext?: () => void;
  backButtonProps?: BackButtonProps;
  nextButtonProps?: NextButtonProps;
};

const MultistepNavigationButtons = React.forwardRef<
  HTMLDivElement,
  MultistepNavigationButtonsProps
>(
  (
    { className, onBack, onNext, backButtonProps, nextButtonProps, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex w-full items-center justify-center gap-x-3 sm:gap-x-4",
        className,
      )}
      {...props}
    >
      <EsportsButton
        variant="ghost"
        size="md"
        className={cn(
          "min-h-[48px] touch-target flex-1 sm:flex-none sm:min-w-[120px]",
          backButtonProps?.className,
        )}
        disabled={backButtonProps?.isDisabled}
        onClick={onBack}
      >
        <Icon icon="solar:arrow-left-outline" width={20} />
        <span className="ml-1">Back</span>
      </EsportsButton>

      <EsportsButton
        variant="matchmaking"
        size="lg"
        className={cn(
          "px-4 sm:px-8 min-h-[52px] touch-target text-sm sm:text-base flex-1 sm:flex-none",
          nextButtonProps?.className,
        )}
        type="submit"
        disabled={nextButtonProps?.isDisabled}
        onClick={onNext}
      >
        {nextButtonProps?.children || "Continue"}
      </EsportsButton>
    </div>
  ),
);

MultistepNavigationButtons.displayName = "MultistepNavigationButtons";

export default MultistepNavigationButtons;
