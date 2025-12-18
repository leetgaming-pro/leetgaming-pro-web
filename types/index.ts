import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Re-export game types
export * from "./games";

// Re-export coaching types
export * from "./coaching";

// Re-export store types
export * from "./store";

// Re-export verification types
export * from "./verification";

// Re-export tournament types
export * from "./tournament";
