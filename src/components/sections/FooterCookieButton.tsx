"use client";

type Props = { label: string };

export function FooterCookieButton({ label }: Props) {
  const handleClick = () => {
    localStorage.removeItem("cookie-consent");
    window.location.reload();
  };

  return (
    <button
      className="underline-offset-2 transition hover:text-white hover:underline text-white/50 text-sm"
      onClick={handleClick}
      type="button"
    >
      {label}
    </button>
  );
}
