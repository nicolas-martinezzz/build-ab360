"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DIM, PROFILE_META } from "@/lib/diagnostic/data";
import {
  getScoreBandMeta,
  getScoreLevelMeta,
  getDashboardMeta,
  getDynamicConclusion,
  getGoodAnswers,
} from "@/lib/diagnostic/scoring";
import type { DiagnosticResults, ComputedReto } from "@/lib/diagnostic/types";
import type { DimensionKey } from "@/lib/diagnostic/types";

type Props = {
  results: DiagnosticResults;
  answers: (number | null)[];
  onComplete: (lead: BridgeLead) => void;
  onRestart: () => void;
};

export type BridgeLead = {
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  email: string;
  challenge: string;
};

export function StepResults({ results, answers, onComplete, onRestart }: Props) {
  const t = useTranslations("diagnosticPage.results");
  const { weightedScore, scoreOver10, topRetos, dimensionPerformance, profile } = results;
  const weightedPct = weightedScore / 100;
  const band = getScoreBandMeta(weightedPct);
  const levelMeta = getScoreLevelMeta(weightedScore);
  const meta = PROFILE_META[profile];
  const goodAnswers = getGoodAnswers(answers);

  const allBlocks = meta.priorities.map((k) => ({
    key: k as DimensionKey,
    name: DIM[k as DimensionKey].name,
    value: dimensionPerformance[k as DimensionKey],
  }));

  const conclusionText = getDynamicConclusion(weightedScore, allBlocks);

  const circumference = 2 * Math.PI * 46;
  const ringOffset = (circumference - weightedPct * circumference).toFixed(1);

  const scoreDisplay = scoreOver10.toFixed(1).replace(".", ",");

  return (
    <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      {/* Result band */}
      <div
        className="rounded-[10px] border border-[#D7D7D7] p-6 sm:p-8"
        style={{ background: band.bandBg }}
      >
        <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-2" style={{ color: band.color }}>
          {t("sectionEyebrow")}
        </p>
        <h2 className="text-[22px] sm:text-[26px] font-semibold leading-tight mb-3" style={{ color: band.color }}>
          {band.title}
        </h2>
        <p className="text-[15px] text-[#1C1E2E] leading-[1.6]">{band.sub}</p>
      </div>

      {/* Score + dimensions */}
      <div className="bg-white rounded-[10px] border border-[#D7D7D7] shadow-[0_8px_24px_rgba(20,27,46,0.08)] p-6 sm:p-8">
        <div className="grid sm:grid-cols-[auto_1fr] gap-8 items-start">
          {/* Ring */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="46" fill="none" stroke="#D7D7D7" strokeWidth="10" />
                <circle
                  cx="55" cy="55" r="46" fill="none"
                  stroke={band.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 55 55)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[26px] font-bold leading-none" style={{ color: band.color }}>
                  {scoreDisplay}
                </span>
                <span className="text-[13px] text-[#7B7C82]">/10</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[11px] font-bold text-[#7B7C82] tracking-[0.1em] uppercase mb-1">
                {t("scoreLabel")}
              </p>
              <p className="text-[14px] font-semibold text-[#1C1E2E]">{levelMeta.label}</p>
              <p className="text-[12px] text-[#7B7C82] mt-1 max-w-[200px] leading-[1.5]">{levelMeta.copy}</p>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <Pill label={t("pillHave")} value={`${weightedScore}/100`} primary color={band.color} />
              <Pill label={t("pillLack")} value={`${100 - weightedScore}/100`} />
            </div>

            <div className="w-full max-w-[200px] h-1.5 bg-[#D7D7D7] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${weightedScore}%`, background: band.color }}
              />
            </div>
            <p className="text-[11px] text-[#7B7C82] text-center max-w-[200px]">
              {t("scoreNote", { score: scoreDisplay })}
            </p>
          </div>

          {/* Dimension cards */}
          <div className="space-y-3">
            {allBlocks.map(({ key, name, value }) => {
              const d = DIM[key];
              const dm = getDashboardMeta(value);
              return (
                <div
                  key={key}
                  className="rounded-lg border border-[#D7D7D7] p-4"
                  style={{ background: dm.tone }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: d.dark }}>
                        {d.short}
                      </p>
                      <p className="text-[13px] font-semibold text-[#1C1E2E]">{name}</p>
                    </div>
                    <span className="text-[18px] font-bold" style={{ color: d.color }}>{value}%</span>
                  </div>
                  <div className="h-1.5 bg-[#D7D7D7] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${value}%`, background: d.color }}
                    />
                  </div>
                  <div className="flex gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: d.bg, color: d.dark }}>
                      {t("maturityLabel")}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ color: d.color, borderColor: d.color }}>
                      {dm.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#7B7C82] leading-[1.5]">{dm.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic conclusion */}
      <div className="bg-white rounded-[10px] border border-[#D7D7D7] shadow-[0_8px_24px_rgba(20,27,46,0.08)] p-6 sm:p-8">
        <h3 className="text-[17px] font-semibold text-[#1C1E2E] mb-3">
          {t("conclusionHeading")}
        </h3>
        <p className="text-[15px] text-[#7B7C82] leading-[1.65]">{conclusionText}</p>
      </div>

      {/* Top 3 retos */}
      <div>
        <h3 className="text-[17px] font-bold text-[#1C1E2E] mb-2">{t("retosHeading")}</h3>
        <p className="text-[14px] text-[#7B7C82] mb-4">{band.introText}</p>

        {goodAnswers.length > 0 && (
          <div className="mb-5">
            <p className="text-[14px] font-bold text-[#1C1E2E] mb-2">{t("goodAnswersHeading")}</p>
            <div className="bg-[#E4F1CF] rounded-[10px] border border-[#C3E195] p-4 space-y-2">
              {goodAnswers.slice(0, 3).map((g) => (
                <div key={g} className="flex gap-2 items-start">
                  <span className="text-[#359E52] text-[14px] flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-[13px] text-[#1C1E2E] leading-[1.5]">{g}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-[13px] text-[#7B7C82] mb-4">
          {t("retosIntroText")}
        </p>

        <div className="space-y-4">
          {topRetos.map((item, idx) => (
            <RetoCard key={item.reto.code} item={item} rank={idx + 1} t={t} />
          ))}
        </div>
      </div>

      {/* Bridge — bootcamp CTA */}
      <BridgeSection topRetos={topRetos} onComplete={onComplete} t={t} />

      {/* Restart */}
      <div className="text-center py-4">
        <button
          type="button"
          onClick={onRestart}
          className="text-[14px] text-[#7B7C82] hover:text-[#1C1E2E] underline underline-offset-2 transition-colors"
        >
          {t("restart")}
        </button>
      </div>
    </div>
  );
}

type ResultsTranslationFn = ReturnType<typeof useTranslations<"diagnosticPage.results">>;

function RetoCard({ item, rank, t }: { item: ComputedReto; rank: number; t: ResultsTranslationFn }) {
  const { reto, dimMeta, priorityLabel, priorityScore, profileContext } = item;
  const isHigh = priorityScore >= 50;
  const isMed = priorityScore >= 30;

  return (
    <div
      className={`bg-white rounded-[10px] border-l-4 border border-[#D7D7D7] shadow-[0_4px_12px_rgba(20,27,46,0.06)] p-5 ${
        isHigh ? "border-l-[#127334]" : isMed ? "border-l-[#359E52]" : "border-l-[#7B7C82]"
      }`}
    >
      <div className="flex gap-3 items-start mb-3">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5"
          style={{ background: dimMeta.color }}
        >
          {rank}
        </span>
        <div>
          <p className="text-[15px] font-semibold text-[#1C1E2E] leading-tight">{reto.name}</p>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: dimMeta.bg, color: dimMeta.dark }}>
              {dimMeta.short} · {dimMeta.name}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D7D7D7] text-[#7B7C82]">
              {priorityLabel}
            </span>
          </div>
        </div>
      </div>
      <p className="text-[13px] text-[#7B7C82] leading-[1.55] mb-1.5">
        <span className="font-semibold text-[#1C1E2E]">{t("retoSitPrefix")}</span>
        {reto.sit}
      </p>
      <p className="text-[13px] text-[#7B7C82] leading-[1.55]">
        <span className="font-semibold text-[#1C1E2E]">{t("retoObjPrefix")}</span>
        {reto.obj}
      </p>
      {profileContext && (
        <p className="mt-2.5 text-[12px] text-[#1C1E2E] leading-[1.55] bg-white/60 rounded-lg px-3 py-2 border border-black/5">
          {profileContext}
        </p>
      )}
    </div>
  );
}

function BridgeSection({
  topRetos,
  onComplete,
  t,
}: {
  topRetos: ComputedReto[];
  onComplete: (lead: BridgeLead) => void;
  t: ResultsTranslationFn;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre]       = useState("");
  const [apellidos, setApellidos] = useState("");
  const [empresa, setEmpresa]     = useState("");
  const [cargo, setCargo]         = useState("");
  const [email, setEmail]         = useState("");
  const [reto, setReto]           = useState("");

  async function handleBridge(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !empresa || !email) {
      alert(t("bridgeAlertRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert(t("bridgeAlertEmail"));
      return;
    }
    setLoading(true);
    onComplete({ firstName: nombre, lastName: apellidos, company: empresa, role: cargo, email, challenge: reto });
    setSubmitted(true);
    setLoading(false);
  }

  const hookReto1 = topRetos[0]?.reto.name ?? "";
  const hookReto2 = topRetos[1]?.reto.name ?? "";

  return (
    <div className="space-y-0">
      {/* Dark block — reflection + hook + event card */}
      <div className="bg-[#1C1E2E] rounded-t-[10px] overflow-hidden">
        {/* Reflection */}
        <div className="px-6 sm:px-8 pt-8 pb-5 border-b border-white/10">
          <p className="text-[17px] text-white/80 italic leading-[1.6] text-center max-w-[600px] mx-auto">
            {t("bridgeReflection")}
          </p>
        </div>

        {/* Hook */}
        <div className="px-6 sm:px-8 py-6 border-b border-white/10">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#359E52] mb-1">{t("bridgeEyebrow")}</p>
          <h3 className="text-[18px] font-semibold text-white mb-3">
            {t("bridgeHeading")}
          </h3>
          <p className="text-[14px] text-white/70 leading-[1.65]">
            {t("bridgeBodyPrefix")}{" "}
            <strong className="text-white">{t("bridgeBodyDate")}</strong>
            {t("bridgeBodyConnector")}{" "}
            <strong className="text-white">{hookReto1}</strong>
            {hookReto2 && <> {t("and")} <strong className="text-white">{hookReto2}</strong></>}
            {t("bridgeBodySuffix")}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {topRetos.map((item) => (
              <span key={item.reto.code} className="text-[11px] font-semibold text-[#359E52] border border-[#359E52]/40 rounded-full px-3 py-1">
                {item.reto.code} · {item.reto.name}
              </span>
            ))}
          </div>
        </div>

        {/* Event card */}
        <div className="px-6 sm:px-8 py-5 flex gap-4 justify-between items-start">
          <div>
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#359E52] mb-1">{t("eventLabel")}</p>
            <p className="text-[18px] font-semibold text-white">{t("eventName")}</p>
            <p className="text-[13px] text-white/60 mb-3">{t("eventSub")}</p>
            <div className="flex flex-wrap gap-2">
              {([t("eventBadge1"), t("eventBadge2"), t("eventBadge3")] as string[]).map((m) => (
                <span key={m} className="text-[11px] text-white/60 border border-white/20 rounded-full px-2.5 py-0.5">{m}</span>
              ))}
            </div>
          </div>
          <div className="text-center flex-shrink-0 bg-[#1C1E2E] border border-white/20 rounded-[8px] px-4 py-3">
            <p className="text-[36px] font-bold text-white leading-none">16</p>
            <p className="text-[13px] font-semibold text-[#359E52] uppercase">Jun</p>
            <p className="text-[11px] text-white/50">2026</p>
          </div>
        </div>
      </div>

      {/* White block — form */}
      <div className="bg-white rounded-b-[10px] border border-t-0 border-[#D7D7D7] shadow-[0_8px_24px_rgba(20,27,46,0.08)] px-6 sm:px-8 py-6">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-[#359E52] flex items-center justify-center text-white text-lg font-bold mx-auto mb-3">✓</div>
            <p className="text-[17px] font-semibold text-[#1C1E2E] mb-2">{t("formSuccessHeading")}</p>
            <p className="text-[14px] text-[#7B7C82] leading-[1.6]">
              {t("formSuccessBody").split("\n\n")[0]}
              <br /><br />
              {t("formSuccessBody").split("\n\n")[1]}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[16px] font-semibold text-[#1C1E2E] mb-1">{t("formHeading")}</p>
            <p className="text-[13px] text-[#7B7C82] mb-5">
              {t("formSubheading")}
            </p>
            <form onSubmit={handleBridge} noValidate className="grid sm:grid-cols-2 gap-3">
              <LightInput label={t("formFieldFirstName")} value={nombre} onChange={setNombre} placeholder={t("formFieldFirstName")} autoComplete="given-name" />
              <LightInput label={t("formFieldLastName")} value={apellidos} onChange={setApellidos} placeholder={t("formFieldLastName")} autoComplete="family-name" />
              <LightInput label={t("formFieldCompany")} value={empresa} onChange={setEmpresa} placeholder={t("formFieldCompany")} autoComplete="organization" />
              <LightInput label={t("formFieldRole")} value={cargo} onChange={setCargo} placeholder={t("formFieldRole")} autoComplete="organization-title" />
              <div className="sm:col-span-2">
                <LightInput label={t("formFieldEmail")} value={email} onChange={setEmail} placeholder="email@empresa.com" type="email" autoComplete="email" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#7B7C82] uppercase tracking-[0.08em] mb-1">
                  {t("formFieldChallenge")}
                </label>
                <textarea
                  value={reto}
                  onChange={(e) => setReto(e.target.value)}
                  placeholder={t("formFieldChallengePlaceholder")}
                  rows={3}
                  className="w-full bg-white border border-[#D7D7D7] rounded-lg px-3 py-2 text-[14px] text-[#1C1E2E] placeholder:text-[#B0B1B8] focus:outline-none focus:border-[#359E52] resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1C1E2E] hover:bg-[#2a2d42] disabled:opacity-60 text-white font-semibold text-[15px] px-6 py-3 rounded-lg transition-colors"
                >
                  {loading ? t("formSubmitting") : t("formSubmit")}
                </button>
                <p className="text-[11px] text-[#B0B1B8] text-center mt-2">
                  {t("formDisclaimer")}
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function LightInput({
  label, value, onChange, placeholder, type = "text", autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#7B7C82] uppercase tracking-[0.08em] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-white border border-[#D7D7D7] rounded-lg px-3 py-2 text-[14px] text-[#1C1E2E] placeholder:text-[#B0B1B8] focus:outline-none focus:border-[#359E52]"
      />
    </div>
  );
}

function Pill({
  label, value, primary, color,
}: {
  label: string;
  value: string;
  primary?: boolean;
  color?: string;
}) {
  return (
    <div
      className="text-center px-3 py-1.5 rounded-lg"
      style={{ background: primary && color ? `${color}18` : "#E4F1CF" }}
    >
      <p className="text-[10px] font-semibold text-[#7B7C82]">{label}</p>
      <p className="text-[14px] font-bold" style={{ color: primary && color ? color : "#1C1E2E" }}>
        {value}
      </p>
    </div>
  );
}
