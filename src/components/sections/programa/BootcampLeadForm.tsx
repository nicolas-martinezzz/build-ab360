"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type BootcampLeadFormProps = {
  fieldName: string;
  fieldEmail: string;
  fieldRole: string;
  fieldCompany: string;
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
};

export const BootcampLeadForm = ({
  fieldName,
  fieldEmail,
  fieldRole,
  fieldCompany,
  submitLabel,
  successMessage,
  errorMessage,
}: BootcampLeadFormProps) => {
  const isLocalDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const endpoint = process.env.NEXT_PUBLIC_BOOTCAMP_LEAD_ENDPOINT ?? "/api/bootcamp-lead.php";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState<number>(() => Date.now());

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (website) {
      setError(errorMessage);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      if (isLocalDev) {
        const storageKey = "ab360_local_bootcamp_leads";
        const existingRaw = window.localStorage.getItem(storageKey);
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push({
          name,
          email,
          role,
          company,
          submittedAt: Date.now(),
        });
        window.localStorage.setItem(storageKey, JSON.stringify(existing));
        setSubmitted(true);
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          role,
          company,
          website,
          accepted: true,
          locale: document.documentElement.lang || "es",
          submittedAt: startedAt,
        }),
      });

      if (!response.ok) {
        setError(errorMessage);
        return;
      }

      setSubmitted(true);
    } catch {
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <p className="figma-text-m text-white">{successMessage}</p>;
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block" htmlFor="bootcamp-name">
        <span className="sr-only">{fieldName}</span>
        <input
          autoComplete="name"
          className="h-12 w-full rounded-[3px] border border-grey-light bg-white px-4 py-2.5 text-base leading-6 text-black focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 sm:h-[54px]"
          id="bootcamp-name"
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder={fieldName}
          required
          type="text"
          value={name}
        />
      </label>
      <label className="block" htmlFor="bootcamp-email">
        <span className="sr-only">{fieldEmail}</span>
        <input
          autoComplete="email"
          className="h-12 w-full rounded-[3px] border border-grey-light bg-white px-4 py-2.5 text-base leading-6 text-black focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 sm:h-[54px]"
          id="bootcamp-email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder={fieldEmail}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="block" htmlFor="bootcamp-role">
        <span className="sr-only">{fieldRole}</span>
        <input
          autoComplete="organization-title"
          className="h-12 w-full rounded-[3px] border border-grey-light bg-white px-4 py-2.5 text-base leading-6 text-black focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 sm:h-[54px]"
          id="bootcamp-role"
          name="role"
          onChange={(event) => setRole(event.target.value)}
          placeholder={fieldRole}
          required
          type="text"
          value={role}
        />
      </label>
      <label className="block" htmlFor="bootcamp-company">
        <span className="sr-only">{fieldCompany}</span>
        <input
          autoComplete="organization"
          className="h-12 w-full rounded-[3px] border border-grey-light bg-white px-4 py-2.5 text-base leading-6 text-black focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 sm:h-[54px]"
          id="bootcamp-company"
          name="company"
          onChange={(event) => setCompany(event.target.value)}
          placeholder={fieldCompany}
          required
          type="text"
          value={company}
        />
      </label>
      <input
        autoComplete="off"
        className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px opacity-0"
        name="website"
        onChange={(event) => setWebsite(event.target.value)}
        tabIndex={-1}
        type="text"
        value={website}
      />
      <Button className="mt-[14px] w-full" disabled={isSubmitting} type="submit" variant="dark">
        {submitLabel}
      </Button>
      {error ? <p className="figma-text-m text-red-100">{error}</p> : null}
    </form>
  );
};
