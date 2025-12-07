import * as React from "react";
import {Icon} from "@iconify/react";
import {cn} from "@nextui-org/react";

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
>(({className, onBack, onNext, backButtonProps, nextButtonProps, ...props}, ref) => (
  <div
    ref={ref}
    className={cn(
      "mx-auto my-6 flex w-full items-center justify-center gap-x-4 lg:mx-0",
      className,
    )}
    {...props}
  >
    <EsportsButton
      variant="ghost"
      size="md"
      className={cn("lg:hidden", backButtonProps?.className)}
      disabled={backButtonProps?.isDisabled}
      onClick={onBack}
    >
      <Icon icon="solar:arrow-left-outline" width={20} />
      Back
    </EsportsButton>

    <EsportsButton
      variant="matchmaking"
      size="lg"
      className={cn("px-8", nextButtonProps?.className)}
      type="submit"
      disabled={nextButtonProps?.isDisabled}
      onClick={onNext}
    >
      {nextButtonProps?.children || "Continue"}
    </EsportsButton>
  </div>
));

MultistepNavigationButtons.displayName = "MultistepNavigationButtons";

export default MultistepNavigationButtons;
