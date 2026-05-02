"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ProfileKey } from "@/lib/diagnostic/types";

type ProfileOption = {
  key: ProfileKey;
  initials: string;
  label: string;
  sublabel: string;
};

const PROFILES: ProfileOption[] = [
  { key: "promotor_inversor",    initials: "P/I", label: "Promotor / Inversor",    sublabel: "Estrategia y rentabilidad" },
  { key: "direccion",            initials: "CEO", label: "CEO / CIO / COO",         sublabel: "Dirección y operaciones" },
  { key: "estudios_constructor", initials: "DE",  label: "Director de Estudios",    sublabel: "Oferta, estudios, licitación" },
  { key: "delegado_pm",          initials: "PM",  label: "Delegado / PM",           sublabel: "Ejecución y control" },
  { key: "arquitecto_ingeniero", initials: "A/I", label: "Arquitecto / Ingeniero",  sublabel: "Diseño y cálculo" },
  { key: "otro",                 initials: "GA",  label: "Gestor de Activos",       sublabel: "Propiedad y facilities" },
];

type Props = {
  onBack: () => void;
  onDone: (profile: ProfileKey) => void;
};

export function StepProfile({ onBack, onDone }: Props) {
  const t = useTranslations("diagnosticPage.profile");
  const [selected, setSelected] = useState<ProfileKey | null>(null);

  return (
    <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-[10px] border border-[#D7D7D7] shadow-[0_8px_24px_rgba(20,27,46,0.08)] p-8 lg:p-10">
        <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#359E52] mb-2">{t("eyebrow")}</p>
        <h2 className="text-[22px] font-semibold text-[#1C1E2E] leading-[1.2] mb-1">{t("heading")}</h2>
        <p className="text-[15px] text-[#7B7C82] mb-6">{t("subheading")}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {PROFILES.map((p) => {
            const isSelected = selected === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelected(p.key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? "border-[#127334] bg-[#E4F1CF]"
                    : "border-[#D7D7D7] bg-white hover:border-[#359E52]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isSelected ? "bg-[#127334] text-white" : "bg-[#E4F1CF] text-[#1C1E2E]"
                  }`}
                >
                  {p.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1C1E2E] leading-tight">{p.label}</div>
                  <div className="text-xs text-[#7B7C82] mt-0.5">{p.sublabel}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-[#7B7C82] hover:text-[#1C1E2E] transition-colors"
          >
            {t("back")}
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onDone(selected)}
            className="bg-[#127334] hover:bg-[#127334] disabled:opacity-40 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            {t("continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
