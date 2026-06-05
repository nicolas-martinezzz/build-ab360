import { type ReactNode } from "react";
import { getButtonClassName, type ButtonVariant } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  ariaLabel?: string;
};

export const LinkButton = ({ href, children, className, variant = "primary", ariaLabel }: LinkButtonProps) => (
  <Link aria-label={ariaLabel} className={getButtonClassName(variant, className)} href={href as never}>
    {children}
  </Link>
);
