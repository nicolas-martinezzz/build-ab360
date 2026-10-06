import { type ReactNode } from "react";
import { getButtonClassName, type ButtonVariant } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  ariaLabel?: string;
  /**
   * Renders a plain anchor instead of the locale-aware `Link`. Use this for
   * fixed, already locale-prefixed destinations (e.g. `BOOTCAMP_ZERO_CTA_HREF`,
   * which always points to `/es/...`) — the i18n `Link` would otherwise
   * prepend the viewer's current locale on top of the one already in `href`.
   */
  external?: boolean;
};

export const LinkButton = ({
  href,
  children,
  className,
  variant = "primary",
  ariaLabel,
  external = false,
}: LinkButtonProps) => {
  const resolvedClassName = getButtonClassName(variant, className);

  if (external) {
    return (
      <a aria-label={ariaLabel} className={resolvedClassName} href={href}>
        {children}
      </a>
    );
  }

  return (
    <Link aria-label={ariaLabel} className={resolvedClassName} href={href as never}>
      {children}
    </Link>
  );
};
