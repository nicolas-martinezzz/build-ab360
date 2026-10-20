"use client";

import { type ReactNode, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CHALLENGE_KEYS, type ChallengeCopy, type ChallengeKey } from "./challenges";

type Props = {
  locale: string;
  challenges: Record<ChallengeKey, ChallengeCopy>;
  other: { title: string; problem: string };
  /**
   * The page's eyebrow, question and intro. The form owns whether they render:
   * once the response is sent the question is answered, so only the thanks
   * remains and "Gracias." takes over as the page's single h1.
   */
  header?: ReactNode;
  t: {
    challengesLegend: string;
    wantLabel: string;
    challengeOtherLabel: string;
    challengeOtherPlaceholder: string;
    contactCheck: string;
    contactIntro: string;
    fieldName: string;
    fieldNamePlaceholder: string;
    fieldCompany: string;
    fieldCompanyPlaceholder: string;
    fieldEmail: string;
    fieldEmailPlaceholder: string;
    checkPrivacy: string;
    checkPrivacyLink: string;
    submit: string;
    submitting: string;
    errorChallenges: string;
    errorOtherEmpty: string;
    errorMissingPrefix: string;
    errorMissingName: string;
    errorMissingCompany: string;
    errorMissingEmail: string;
    errorEmail: string;
    errorPrivacy: string;
    errorGeneric: string;
    errorConnection: string;
    successTitle: string;
    successBodyContact: string;
    successBodyNoContact: string;
    successBack: string;
  };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A native checkbox styled to the mockup's 26px square. `appearance-none` plus
 * `peer-checked` keeps the checkmark purely in CSS, so the control keeps its
 * real semantics, keyboard behaviour and screen-reader state.
 */
const boxCls =
  "peer size-[26px] flex-shrink-0 cursor-pointer appearance-none rounded-[6px] border-2 border-grey-dark bg-white transition-colors checked:border-green-600 checked:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2";

const checkCls =
  "pointer-events-none absolute left-[6px] top-[6px] hidden size-3.5 stroke-white peer-checked:block";

const inputCls =
  "w-full rounded-[8px] border border-grey-light bg-white px-3 py-3 text-base text-surface-bg placeholder:text-surface-bg/40 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";

const labelCls = "mb-1.5 block text-xs font-semibold text-surface-bg/70";

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.5"
      viewBox="0 0 24 24"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function BootcampRetosForm({ locale, challenges, header, other, t }: Props) {
  const startedAt = useRef(Date.now());

  const [selected, setSelected] = useState<ChallengeKey[]>([]);
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [wantsContact, setWantsContact] = useState(false);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [contactRef, setContactRef] = useState("");
  const [tried, setTried] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<null | { contacted: boolean }>(null);

  const toggleChallenge = (key: ChallengeKey) => {
    setSelected((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );
  };

  /**
   * Validation mirrors the mockup: the challenge selection is always required,
   * the contact block is only validated when the visitor asked to be contacted.
   * A response without any personal data is a valid, anonymous answer.
   */
  function validate(): string {
    if (selected.length === 0 && !otherChecked) {
      return t.errorChallenges;
    }
    if (otherChecked && otherText.trim() === "") {
      return t.errorOtherEmpty;
    }
    if (!wantsContact) {
      return "";
    }

    const missing: string[] = [];
    if (fullName.trim() === "") missing.push(t.errorMissingName);
    if (company.trim() === "") missing.push(t.errorMissingCompany);
    if (email.trim() === "") missing.push(t.errorMissingEmail);
    if (missing.length > 0) {
      return `${t.errorMissingPrefix} ${missing.join(", ")}.`;
    }
    if (!EMAIL_RE.test(email.trim())) {
      return t.errorEmail;
    }
    if (!privacy) {
      return t.errorPrivacy;
    }
    return "";
  }

  const validationError = validate();
  const visibleError = submitError || (tried ? validationError : "");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError("");

    if (validationError !== "") {
      setTried(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bootcamp-challenges.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: wantsContact ? fullName.trim() : "",
          email: wantsContact ? email.trim() : "",
          company: wantsContact ? company.trim() : "",
          challenges: selected,
          challengeOther: otherChecked ? otherText.trim() : "",
          wantsContact,
          accepted: wantsContact ? privacy : false,
          contact_ref: contactRef,
          locale,
          submittedAt: startedAt.current,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setSubmitError((data as { message?: string }).message ?? t.errorGeneric);
        return;
      }

      setSuccess({ contacted: wantsContact });
    } catch {
      setSubmitError(t.errorConnection);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSuccess(null);
    setTried(false);
    setSubmitError("");
    startedAt.current = Date.now();
  }

  if (success) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[10px] border border-grey-light bg-white px-5 py-10 sm:px-8 sm:py-12">
        <span
          aria-hidden
          className="flex size-14 items-center justify-center rounded-full bg-green-600"
        >
          <CheckIcon className="size-7 stroke-white" />
        </span>
        <h1 className="figma-title-3 font-bold text-surface-bg">{t.successTitle}</h1>
        <p className="figma-text-m text-surface-bg/70">
          {success.contacted ? t.successBodyContact : t.successBodyNoContact}
        </p>
        <button
          className="text-sm font-semibold text-green-600 underline underline-offset-2"
          onClick={reset}
          type="button"
        >
          {t.successBack}
        </button>
      </div>
    );
  }

  return (
    <>
      {header ? <div className="mb-6 sm:mb-8">{header}</div> : null}

      <form className="flex flex-col gap-4 sm:gap-5" noValidate onSubmit={handleSubmit}>
        <fieldset className="flex min-w-0 flex-col gap-2">
          <legend className="sr-only">{t.challengesLegend}</legend>

          {CHALLENGE_KEYS.map((key) => {
            const copy = challenges[key];
            const checked = selected.includes(key);

            return (
              <div
                className={`rounded-[10px] border-[1.5px] bg-white p-3 transition-colors sm:p-3.5 ${
                  checked ? "border-green-600" : "border-grey-light"
                }`}
                key={key}
              >
                <div className="flex items-start gap-3">
                  <span className="relative mt-px flex-shrink-0">
                    <input
                      checked={checked}
                      className={boxCls}
                      id={`br-${key}`}
                      onChange={() => toggleChallenge(key)}
                      type="checkbox"
                      value={key}
                    />
                    <CheckIcon className={checkCls} />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <label
                      className="cursor-pointer text-[0.9375rem] font-semibold leading-snug text-surface-bg sm:text-base"
                      htmlFor={`br-${key}`}
                    >
                      {copy.title}
                    </label>
                    <p className="text-sm leading-relaxed text-surface-bg/70 sm:text-[0.9375rem]">
                      {copy.problem}
                    </p>
                    <p className="text-sm leading-relaxed text-green-600 sm:text-[0.9375rem]">
                      <span className="font-bold">{t.wantLabel} </span>
                      {copy.want}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div
            className={`rounded-[10px] border-[1.5px] bg-white p-3 transition-colors sm:p-3.5 ${
              otherChecked ? "border-green-600" : "border-grey-light"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="relative mt-px flex-shrink-0">
                <input
                  checked={otherChecked}
                  className={boxCls}
                  id="br-other"
                  onChange={(event) => setOtherChecked(event.target.checked)}
                  type="checkbox"
                />
                <CheckIcon className={checkCls} />
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label
                  className="cursor-pointer text-[0.9375rem] font-semibold leading-snug text-surface-bg sm:text-base"
                  htmlFor="br-other"
                >
                  {other.title}
                </label>
                <p className="text-sm leading-relaxed text-surface-bg/70 sm:text-[0.9375rem]">
                  {other.problem}
                </p>

                {otherChecked ? (
                  <label className="mt-2 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-surface-bg/70">
                      {t.challengeOtherLabel}
                    </span>
                    <textarea
                      autoComplete="off"
                      className={`${inputCls} resize-none`}
                      maxLength={300}
                      onChange={(event) => setOtherText(event.target.value)}
                      placeholder={t.challengeOtherPlaceholder}
                      rows={4}
                      value={otherText}
                    />
                  </label>
                ) : null}
              </div>
            </div>
          </div>
        </fieldset>

        <div
          className={`rounded-[10px] border-[1.5px] bg-white p-3 transition-colors sm:p-3.5 ${
            wantsContact ? "border-green-600" : "border-grey-light"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="relative flex-shrink-0">
              <input
                checked={wantsContact}
                className={boxCls}
                id="br-contact"
                onChange={(event) => setWantsContact(event.target.checked)}
                type="checkbox"
              />
              <CheckIcon className={checkCls} />
            </span>
            <label
              className="min-w-0 flex-1 cursor-pointer text-sm font-semibold leading-snug text-surface-bg sm:text-[0.9375rem]"
              htmlFor="br-contact"
            >
              {t.contactCheck}
            </label>
          </div>
        </div>

        {wantsContact ? (
          <div className="flex flex-col gap-3 rounded-[10px] border border-grey-light bg-white p-3.5 sm:p-4">
            <p className="text-sm text-surface-bg/70">{t.contactIntro}</p>

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

            <div className="flex items-start gap-3">
              <span className="relative flex-shrink-0">
                <input
                  checked={privacy}
                  className={boxCls}
                  id="br-privacy"
                  onChange={(event) => setPrivacy(event.target.checked)}
                  type="checkbox"
                />
                <CheckIcon className={checkCls} />
              </span>
              <label
                className="min-w-0 flex-1 cursor-pointer pt-0.5 text-sm leading-relaxed text-surface-bg/70"
                htmlFor="br-privacy"
              >
                {t.checkPrivacy}{" "}
                <Link
                  className="text-green-600 underline underline-offset-2"
                  href="/privacy"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t.checkPrivacyLink}
                </Link>{" "}
                *
              </label>
            </div>
          </div>
        ) : null}

        {visibleError ? (
          <p className="text-sm font-semibold text-green-600" role="alert">
            {visibleError}
          </p>
        ) : null}

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
          className="h-[50px] w-full rounded-[10px] bg-green-600 px-6 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
            {loading ? t.submitting : t.submit}
          </button>
      </form>
    </>
  );
}
