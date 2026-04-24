import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const variantClasses = {
  primary:
    "bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500",
  secondary:
    "bg-green-300 text-white hover:bg-green-400 focus-visible:ring-green-400",
  outline:
    "border border-green-100 bg-transparent text-green-500 hover:bg-green-100/40 focus-visible:ring-green-500",
  outlineInverse:
    "border border-white bg-transparent text-white hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-surface-bg",
  light: "bg-green-100 text-green-500 hover:bg-green-200 focus-visible:ring-green-500",
  dark: "bg-surface-bg text-white hover:bg-surface-bg/90 focus-visible:ring-surface-bg",
  text: "bg-transparent text-green-500 underline-offset-4 hover:underline focus-visible:ring-green-500",
} as const;

export type ButtonVariant = keyof typeof variantClasses;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const baseClasses =
  "inline-flex h-[45px] cursor-pointer touch-manipulation items-center justify-center rounded-[var(--radius-button)] px-5 py-2.5 text-base leading-[1.4] font-medium [font-family:var(--font-cta)] transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

export const getButtonClassName = (variant: ButtonVariant = "primary", className?: string) =>
  twMerge(baseClasses, variantClasses[variant], className ?? "");

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", className = "", type = "button", children, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={getButtonClassName(variant, className)} type={type} {...rest}>
      {children}
    </button>
  );
});
