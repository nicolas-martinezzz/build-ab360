type Props = {
  /** 0–1 darkness over media; higher = more contrast for foreground text */
  opacity?: number;
  className?: string;
};

export const MediaBackdrop = ({ opacity = 0.72, className = "" }: Props) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute inset-0 bg-surface-bg ${className}`}
    style={{ opacity }}
  />
);
