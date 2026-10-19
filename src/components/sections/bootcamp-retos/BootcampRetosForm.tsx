"use client";

import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Challenge keys sent to the backend. The labels live in i18n (the copy may
 * still change before the event); these keys are the stable contract with
 * public/api/bootcamp-challenges.php, which validates them against the same
 * allow-list. Never send labels — only keys.
 */
export const CHALLENGE_KEYS = [
  "predictive",
  "deviations",
  "objectives",
  "eu_taxonomy",
  "dashboards",
] as const;

type ChallengeKey = (typeof CHALLENGE_KEYS)[number];

type Props = {
  locale: string;
  t: {
    challengesLegend: string;
    challenge1: string;
    challenge2: string;
    challenge3: string;
    challenge4: string;
    challenge5: string;
    challengeOther: string;
    challengeOtherPlaceholder: string;
    fieldName: string;
    fieldNamePlaceholder: string;
    fieldEmail: string;
    fieldEmailPlaceholder: string;
    fieldCompany: string;
    fieldCompanyPlaceholder: string;
    contactLegend: string;
    contactYes: string;
    contactNo: string;
    checkPrivacy: string;
    checkPrivacyLink: string;
    submit: string;
    submitting: string;
    errorRequired: string;
    errorEmail: string;
    errorChallenges: string;
    errorOtherEmpty: string;
    errorContact: string;
    errorPrivacy: string;
    errorGeneric: string;
    errorConnection: string;
    successTitle: string;
    successBody: string;
  };
};

const inputCls =
  "w-full rounded-[6px] border border-surface-bg/15 bg-white px-3 py-3 text-base text-surface-bg placeholder:text-surface-bg/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus-visible:ring-2 focus-visible:ring-green-500 transition-colors";

const labelCls = "block text-sm font-semibold text-surface-bg mb-1.5";

const optionCls =
  "flex cursor-pointer items-start gap-3 rounded-[6px] border border-surface-bg/15 bg-white px-3 py-3 transition-colors hover:border-green-500/50";

export function BootcampRetosForm({ locale, t }: Props) {
  const startedAt = useRef(Date.now());

  const challengeLabels: Record<ChallengeKey, string> = {
    predictive: t.challenge1,
    deviations: t.challenge2,
    objectives: t.challenge3,
    eu_taxonomy: t.challenge4,
    dashboards: t.challenge5,
  };

  const [selected, setSelected] = useState<ChallengeKey[]>([]);
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [wantsContact, setWantsContact] = useState<"" | "yes" | "no">("");
  const [privacy, setPrivacy] = useState(false);
  const [contactRef, setContactRef] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleChallenge = (key: ChallengeKey) => {
    setSelected((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !company.trim()) {
      setError(t.errorRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.errorEmail);
      return;
    }
    if (selected.length === 0 && !otherChecked) {
      setError(t.errorChallenges);
      return;
    }
    if (otherChecked && !otherText.trim()) {
      setError(t.errorOtherEmpty);
      return;
    }
    if (wantsContact === "") {
      setError(t.errorContact);
      return;
    }
    if (!privacy) {
      setError(t.errorPrivacy);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bootcamp-challenges.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          company: company.trim(),
          challenges: selected,
          challengeOther: otherChecked ? otherText.trim() : "",
          wantsContact: wantsContact === "yes",
          accepted: true,
          contact_ref: contactRef,
          locale,
          submittedAt: startedAt.current,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError((data as { message?: string }).message ?? t.errorGeneric);
        return;
      }

      setSuccess(true);
    } catch {
      setError(t.errorConnection);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[8px] bg-green-50 px-6 py-12 text-center">
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-full bg-white"
        >
          <svg
            className="stroke-green-500"
            fill="none"
            height="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="figma-title-3 text-surface-bg">{t.successTitle}</p>
        <p className="figma-text-m max-w-[32rem] text-surface-bg/70">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-7" noValidate onSubmit={handleSubmit}>
      <fieldset className="flex flex-col gap-2.5">
        <legend className={labelCls}>{t.challengesLegend}</legend>

        {CHALLENGE_KEYS.map((key) => (
          <label className={optionCls} key={key}>
            <input
              checked={selected.includes(key)}
              className="mt-0.5 size-5 flex-shrink-0 accent-green-600"
              onChange={() => toggleChallenge(key)}
              type="checkbox"
              value={key}
            />
            <span className="figma-text-m text-surface-bg">{challengeLabels[key]}</span>
          </label>
        ))}

        <label className={optionCls}>
          <input
            checked={otherChecked}
            className="mt-0.5 size-5 flex-shrink-0 accent-green-600"
            onChange={(event) => setOtherChecked(event.target.checked)}
            type="checkbox"
          />
          <span className="figma-text-m text-surface-bg">{t.challengeOther}</span>
        </label>

        {otherChecked ? (
          <input
            aria-label={t.challengeOther}
            autoComplete="off"
            className={inputCls}
            maxLength={300}
            onChange={(event) => setOtherText(event.target.value)}
            placeholder={t.challengeOtherPlaceholder}
            type="text"
            value={otherText}
          />
        ) : null}
      </fieldset>

      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls} htmlFor="br-name">
            {t.fieldName} *
          </label>
          <input
            autoComplete="name"
            className={inputCls}
            id="br-name"
            maxLength={180}
            onChange={(event) => setFullName(event.target.value)}
            placeholder={t.fieldNamePlaceholder}
            type="text"
            value={fullName}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="br-email">
            {t.fieldEmail} *
          </label>
          <input
            autoComplete="email"
            className={inputCls}
            id="br-email"
            inputMode="email"
            maxLength={255}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t.fieldEmailPlaceholder}
            type="email"
            value={email}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="br-company">
            {t.fieldCompany} *
          </label>
          <input
            autoComplete="organization"
            className={inputCls}
            id="br-company"
            maxLength={180}
            onChange={(event) => setCompany(event.target.value)}
            placeholder={t.fieldCompanyPlaceholder}
            type="text"
            value={company}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className={labelCls}>{t.contactLegend}</legend>
        <label className={optionCls}>
          <input
            checked={wantsContact === "yes"}
            className="mt-0.5 size-5 flex-shrink-0 accent-green-600"
            name="wantsContact"
            onChange={() => setWantsContact("yes")}
            type="radio"
            value="yes"
          />
          <span className="figma-text-m text-surface-bg">{t.contactYes}</span>
        </label>
        <label className={optionCls}>
          <input
            checked={wantsContact === "no"}
            className="mt-0.5 size-5 flex-shrink-0 accent-green-600"
            name="wantsContact"
            onChange={() => setWantsContact("no")}
            type="radio"
            value="no"
          />
          <span className="figma-text-m text-surface-bg">{t.contactNo}</span>
        </label>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          checked={privacy}
          className="mt-1 size-5 flex-shrink-0 accent-green-600"
          onChange={(event) => setPrivacy(event.target.checked)}
          type="checkbox"
        />
        <span className="text-sm leading-relaxed text-surface-bg/60">
          {t.checkPrivacy}{" "}
          <Link
            className="text-green-700 underline underline-offset-2 hover:text-green-800"
            href="/privacy"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t.checkPrivacyLink}
          </Link>{" "}
          *
        </span>
      </label>

      {/*
        Honeypot. Deliberately NOT named "website": Chrome autofill and password
        managers fill that name, which silently rejects real submissions (see the
        bootcamp-lead incident in odd/tasks/bootcamp-retos-landing.md).
      */}
      <input
        aria-hidden="true"
        autoComplete="off"
        className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px opacity-0"
        name="contact_ref"
        onChange={(event) => setContactRef(event.target.value)}
        tabIndex={-1}
        type="text"
        value={contactRef}
      />

      <button
        className="h-[52px] w-full rounded-[6px] bg-surface-bg px-6 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? t.submitting : t.submit}
      </button>

      {error ? (
        <p className="figma-text-m text-center text-green-700" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
