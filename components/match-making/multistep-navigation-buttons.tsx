import * as React from "react";
import {Button} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import {cn} from "@nextui-org/react";

import {ButtonWithBorderGradient} from "./button-with-border-gradient";

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
    <Button
      className={cn(
        "rounded-lg border-2 border-slate-300 dark:border-slate-600 text-medium font-semibold text-slate-600 dark:text-slate-300 hover:border-purple-400 dark:hover:border-cyan-400 hover:text-purple-500 dark:hover:text-cyan-400 transition-all lg:hidden",
        backButtonProps?.className
      )}
      variant="bordered"
      isDisabled={backButtonProps?.isDisabled}
      onPress={onBack}
    >
      <Icon icon="solar:arrow-left-outline" width={20} />
      Back
    </Button>

    <ButtonWithBorderGradient
      className={cn("text-medium font-bold px-8", nextButtonProps?.className)}
      type="submit"
      isDisabled={nextButtonProps?.isDisabled}
      onPress={onNext}
    >
      {nextButtonProps?.children || "Continue"}
    </ButtonWithBorderGradient>
  </div>
));

MultistepNavigationButtons.displayName = "MultistepNavigationButtons";

export default MultistepNavigationButtons;
