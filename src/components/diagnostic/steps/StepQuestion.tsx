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
      <div className="bg-white rounded-[10px] border border-grey-light shadow-[var(--shadow-step)] p-8 lg:p-10">
        {/* Progress bar */}
        <div className="h-1 bg-grey-light rounded-full mb-6 overflow-hidden">
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
          <span className="text-xs text-grey-dark font-medium">
            {questionIndex + 1} / {TOTAL_QUESTIONS}
          </span>
        </div>

        {/* Question */}
        <p className="text-base sm:text-lg font-semibold text-surface-bg leading-[1.35] mb-2">
          {question.text}
        </p>
        <p className="text-sm text-grey-dark italic mb-6">{question.sub}</p>

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
                    ? "border-green-600 bg-green-100"
                    : "border-grey-light bg-white hover:border-green-500"
                }`}
              >
                <span
                  className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 transition-colors ${
                    isSelected
                      ? "border-green-600 bg-green-600"
                      : "border-grey-dark bg-white"
                  }`}
                />
                <span className="text-sm text-surface-bg leading-[1.5]">{opt.t}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-grey-dark hover:text-surface-bg transition-colors"
          >
            {t("back")}
          </button>
          <button
            type="button"
            disabled={selectedOption === null}
            onClick={onNext}
            className="bg-green-500 hover:bg-green-400 disabled:opacity-40 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            {isLast ? t("finish") : t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}
