import { cl } from "@/components/cl";
import React from "react";

const CellWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({children, className, ...props}, ref) => (
    <div
      ref={ref}
      className={cl(
        "flex items-center justify-between gap-2 rounded-medium bg-content2 p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

CellWrapper.displayName = "CellWrapper";

export default CellWrapper;
