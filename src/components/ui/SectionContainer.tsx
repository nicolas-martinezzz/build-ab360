import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const WIDTH_CLASS = {
  default: "max-w-6xl",
  narrow: "max-w-4xl",
} as const;

export type SectionContainerProps = {
  children: ReactNode;
  className?: string;
  width?: keyof typeof WIDTH_CLASS;
};

export const SectionContainer = ({
  children,
  className,
  width = "default",
}: SectionContainerProps) => (
  <div
    className={twMerge(
      "mx-auto min-w-0 w-full px-4 sm:px-6 lg:px-8",
      WIDTH_CLASS[width],
      className,
    )}
  >
    {children}
  </div>
);
