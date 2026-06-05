"use client";

import { useState, useRef } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  locale: string;
  t: {
    fieldName: string;
    fieldNamePlaceholder: string;
    fieldEmail: string;
    fieldEmailPlaceholder: string;
    fieldOrg: string;
    fieldOrgPlaceholder: string;
    fieldPriority: string;
    fieldPriorityPlaceholder: string;
    priorityOpt1: string;
    priorityOpt2: string;
    priorityOpt3: string;
    priorityOpt4: string;
    fieldMessage: string;
    fieldMessagePlaceholder: string;
    checkPrivacy: string;
    checkPrivacyLink: string;
    checkNewsletter: string;
    submit: string;
    submitting: string;
    errorRequired: string;
    errorEmail: string;
    errorPrivacy: string;
    errorGeneric: string;
    errorConnection: string;
    successTitle: string;
    successBody: string;
  };
};

const inputCls =
  "w-full rounded-[6px] border border-surface-bg/15 bg-surface-light px-3 py-2.5 text-sm text-surface-bg placeholder:text-surface-bg/40 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 transition-colors";

const labelCls = "block text-sm font-semibold text-surface-bg mb-1.5";

export function OpenlabContactForm({ locale, t }: Props) {
  const startedAt = useRef(Date.now());

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [org, setOrg]             = useState("");
  const [priority, setPriority]   = useState("");
  const [message, setMessage]     = useState("");
  const [privacy, setPrivacy]     = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !org.trim() || !priority || !message.trim()) {
      setError(t.errorRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.errorEmail);
      return;
    }
    if (!privacy) {
      setError(t.errorPrivacy);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/openlab-contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          org: org.trim(),
          priority,
          message: message.trim(),
          newsletter,
          locale,
          accepted: true,
          website: "",
          submittedAt: startedAt.current,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
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
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
          <svg aria-hidden className="size-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="figma-title-3 text-surface-bg">{t.successTitle}</h3>
        <p className="figma-text-m text-surface-bg/60">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Honeypot */}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" readOnly aria-hidden="true" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ol-name" className={labelCls}>
            {t.fieldName} <span className="text-green-600">*</span>
          </label>
          <input
            id="ol-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.fieldNamePlaceholder}
            className={inputCls}
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="ol-email" className={labelCls}>
            {t.fieldEmail} <span className="text-green-600">*</span>
          </label>
          <input
            id="ol-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.fieldEmailPlaceholder}
            className={inputCls}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="ol-org" className={labelCls}>
            {t.fieldOrg} <span className="text-green-600">*</span>
          </label>
          <input
            id="ol-org"
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder={t.fieldOrgPlaceholder}
            className={inputCls}
            autoComplete="organization"
          />
        </div>

        <div>
          <label htmlFor="ol-priority" className={labelCls}>
            {t.fieldPriority} <span className="text-green-600">*</span>
          </label>
          <select
            id="ol-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={`${inputCls} cursor-pointer ${!priority ? "text-surface-bg/40" : "text-surface-bg"}`}
          >
            <option value="" disabled hidden>{t.fieldPriorityPlaceholder}</option>
            <option value="adopt">{t.priorityOpt1}</option>
            <option value="partner">{t.priorityOpt2}</option>
            <option value="research">{t.priorityOpt3}</option>
            <option value="other">{t.priorityOpt4}</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ol-message" className={labelCls}>
          {t.fieldMessage} <span className="text-green-600">*</span>
        </label>
        <textarea
          id="ol-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.fieldMessagePlaceholder}
          rows={4}
          className={`${inputCls} resize-y min-h-[7rem]`}
        />
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
            className="mt-1 flex-shrink-0 accent-green-600"
          />
          <span className="text-sm leading-relaxed text-surface-bg/60">
            {t.checkPrivacy}{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline underline-offset-2 hover:text-green-800"
            >
              {t.checkPrivacyLink}
            </Link>{" "}
            *
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-1 flex-shrink-0 accent-green-600"
          />
          <span className="text-sm leading-relaxed text-surface-bg/60">{t.checkNewsletter}</span>
        </label>
      </div>

      {error && (
        <p className="rounded-[6px] bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex w-full items-center justify-center rounded-[6px] bg-green-500 px-6 py-3 text-[0.9375rem] font-semibold tracking-wide text-white transition hover:bg-green-400 disabled:opacity-60"
      >
        {loading ? t.submitting : t.submit}
      </button>
    </form>
  );
}
