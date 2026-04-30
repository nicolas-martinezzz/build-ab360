"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

interface FooterNewsletterFormProps {
  namePlaceholder: string;
  emailPlaceholder: string;
  privacyCheck: string;
  privacyPolicyLabel: string;
  subscribeButton: string;
  privacyHref: string;
}

export const FooterNewsletterForm = ({
  namePlaceholder,
  emailPlaceholder,
  privacyCheck,
  privacyPolicyLabel,
  subscribeButton,
  privacyHref,
}: FooterNewsletterFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted || !email) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="text-sm text-green-300">
        ¡Gracias! Te hemos añadido a la lista.
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <input
        className="h-11 rounded-[5px] border border-white/20 bg-transparent px-3.5 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
        onChange={(e) => setName(e.target.value)}
        placeholder={namePlaceholder}
        type="text"
        value={name}
      />
      <input
        className="h-11 rounded-[5px] border border-white/20 bg-transparent px-3.5 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
        onChange={(e) => setEmail(e.target.value)}
        placeholder={emailPlaceholder}
        required
        type="email"
        value={email}
      />
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-white/70">
        <input
          checked={accepted}
          className="mt-0.5 h-4 w-4 shrink-0 accent-green-500"
          onChange={(e) => setAccepted(e.target.checked)}
          required
          type="checkbox"
        />
        <span>
          {privacyCheck}{" "}
          <Link className="underline transition hover:text-white" href={privacyHref}>
            {privacyPolicyLabel}
          </Link>
        </span>
      </label>
      <button
        className="h-11 rounded-[5px] bg-green-500 px-6 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
        disabled={!accepted}
        type="submit"
      >
        {subscribeButton}
      </button>
    </form>
  );
};
