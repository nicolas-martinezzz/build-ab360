"use client";

import { useTranslations } from "next-intl";
import { DIM, TOTAL_QUESTIONS } from "@/lib/diagnostic/data";
import type { Question } from "@/lib/diagnostic/types";

type Props = {
  question: Question;
  questionIndex: number;
  selectedOption: number | null;
  onSelect: (optionIndex: number) => void;
  onBack: () => void;
  onNext: () => void;
};

export function StepQuestion({
  question,
  questionIndex,
  selectedOption,
  onSelect,
  onBack,
  onNext,
}: Props) {
  const t = useTranslations("diagnosticPage.question");
  const dim = DIM[question.dim];
  const progress = Math.round((questionIndex / TOTAL_QUESTIONS) * 100);
  const isLast = questionIndex === TOTAL_QUESTIONS - 1;

  return (
    <div className="max-w-[72rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-[10px] border border-[#D7D7D7] shadow-[0_8px_24px_rgba(20,27,46,0.08)] p-8 lg:p-10">
        {/* Progress bar */}
        <div className="h-1 bg-[#D7D7D7] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: dim.color }}
          />
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: dim.bg, color: dim.dark }}
          >
            {dim.short} · {dim.name}
          </span>
          <span className="text-xs text-[#7B7C82] font-medium">
            {questionIndex + 1} / {TOTAL_QUESTIONS}
          </span>
        </div>

        {/* Question */}
        <p className="text-base sm:text-lg font-semibold text-[#1C1E2E] leading-[1.35] mb-2">
          {question.text}
        </p>
        <p className="text-sm text-[#7B7C82] italic mb-6">{question.sub}</p>

        {/* Options */}
        <div className="space-y-2.5 mb-8">
          {question.opts.map((opt, i) => {
            const isSelected = selectedOption === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={`w-full text-left flex gap-3 items-start px-4 py-3.5 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-[#127334] bg-[#E4F1CF]"
                    : "border-[#D7D7D7] bg-white hover:border-[#359E52]"
                }`}
              >
                <span
                  className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 transition-colors ${
                    isSelected
                      ? "border-[#127334] bg-[#127334]"
                      : "border-[#7B7C82] bg-white"
                  }`}
                />
                <span className="text-sm text-[#1C1E2E] leading-[1.5]">{opt.t}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
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
            disabled={selectedOption === null}
            onClick={onNext}
            className="bg-[#127334] hover:bg-[#127334] disabled:opacity-40 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            {isLast ? t("finish") : t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}
