"use client";

import { useReducer, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { QS, PROFILE_QUESTIONS, TOTAL_QUESTIONS } from "@/lib/diagnostic/data";
import { computeResults } from "@/lib/diagnostic/scoring";
import {
  initSession,
  savePrelead,
  saveStart,
  saveAnswer,
  saveComplete,
} from "@/lib/diagnostic/api";
import type { ProfileKey, LeadData, DiagnosticResults } from "@/lib/diagnostic/types";
import type { Question } from "@/lib/diagnostic/types";
import { StepPrelead } from "./steps/StepPrelead";
import { StepProfile } from "./steps/StepProfile";
import { StepQuestion } from "./steps/StepQuestion";
import { StepResults } from "./steps/StepResults";
import type { BridgeLead } from "./steps/StepResults";

/* ─── State machine ─── */
type Step = "prelead" | "profile" | "question" | "results";

type State = {
  step: Step;
  sessionId: string;
  lead: LeadData | null;
  profile: ProfileKey | null;
  currentQ: number;
  answers: (number | null)[];
  results: DiagnosticResults | null;
};

type Action =
  | { type: "PRELEAD_DONE"; lead: LeadData; sessionId: string }
  | { type: "PROFILE_DONE"; profile: ProfileKey }
  | { type: "ANSWER"; qi: number; oi: number }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "FINISH"; results: DiagnosticResults }
  | { type: "RESTART" };

function init(): State {
  return {
    step: "prelead",
    sessionId: "",
    lead: null,
    profile: null,
    currentQ: 0,
    answers: Array(TOTAL_QUESTIONS).fill(null),
    results: null,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "PRELEAD_DONE":
      return { ...state, step: "profile", lead: action.lead, sessionId: action.sessionId };
    case "PROFILE_DONE":
      return {
        ...state,
        step: "question",
        profile: action.profile,
        currentQ: 0,
        answers: Array(TOTAL_QUESTIONS).fill(null),
      };
    case "ANSWER": {
      const answers = [...state.answers];
      answers[action.qi] = action.oi;
      return { ...state, answers };
    }
    case "NEXT":
      if (state.currentQ < TOTAL_QUESTIONS - 1) {
        return { ...state, currentQ: state.currentQ + 1 };
      }
      return state;
    case "PREV":
      if (state.step === "question" && state.currentQ > 0) {
        return { ...state, currentQ: state.currentQ - 1 };
      }
      if (state.step === "question" && state.currentQ === 0) {
        return { ...state, step: "profile" };
      }
      if (state.step === "profile") {
        return { ...state, step: "prelead" };
      }
      return state;
    case "FINISH":
      return { ...state, step: "results", results: action.results };
    case "RESTART":
      return init();
  }
}

/* ─── Wizard component ─── */
type Props = { locale: string; mode?: "diagnostic" | "bootcamp" };

export function DiagnosticWizard({ locale, mode = "diagnostic" }: Props) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const completedRef = useRef(false);
  const t = useTranslations("diagnosticPage.wizard");

  /* Step indicators */
  const stepIdx = { prelead: 0, profile: 1, question: 2, results: 3 }[state.step];

  /* Prelead submit — server generates the session ID */
  const handlePreleadDone = useCallback(async (lead: LeadData) => {
    const sessionId = await initSession(locale);
    await savePrelead(sessionId, locale, lead);
    dispatch({ type: "PRELEAD_DONE", lead, sessionId });
  }, [locale]);

  /* Profile selection */
  const handleProfileDone = useCallback((profile: ProfileKey) => {
    saveStart(state.sessionId, locale, profile);
    dispatch({ type: "PROFILE_DONE", profile });
  }, [state.sessionId, locale]);

  /* Select an answer */
  const handleSelect = useCallback((optionIndex: number) => {
    const qi = state.currentQ;
    const q = QS[qi];
    dispatch({ type: "ANSWER", qi, oi: optionIndex });
    saveAnswer(state.sessionId, qi, q.dim, optionIndex, q.opts[optionIndex].s);
  }, [state.currentQ, state.sessionId]);

  /* Navigate next */
  const handleNext = useCallback(() => {
    if (state.currentQ === TOTAL_QUESTIONS - 1) {
      const results = computeResults(state.answers, state.profile!);
      if (!completedRef.current) {
        completedRef.current = true;
        saveComplete(state.sessionId, results);
      }
      dispatch({ type: "FINISH", results });
    } else {
      dispatch({ type: "NEXT" });
    }
  }, [state.currentQ, state.answers, state.profile, state.sessionId]);

  /* Bridge form complete */
  const handleBridgeComplete = useCallback((lead: BridgeLead) => {
    if (state.results) {
      saveComplete(state.sessionId, state.results, {
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        role: lead.role,
        email: lead.email,
        challenge: lead.challenge,
      });
    }
  }, [state.sessionId, state.results]);

  /* Build current question with profile-specific text */
  const currentQuestion: Question | null =
    state.step === "question" && state.profile
      ? {
          ...QS[state.currentQ],
          text: PROFILE_QUESTIONS[state.profile][state.currentQ] ?? QS[state.currentQ].text,
        }
      : null;

  return (
    <div style={{ background: "#E4F1CF" }} className="min-h-screen pb-16">
      {/* Step progress dots */}
      <div className="flex items-center justify-center gap-0 py-6 max-w-xs mx-auto">
        {(t.raw("stepDots") as string[]).map((label, i) => (
          <span key={label} className="flex items-center">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-[1.5px] ${
                i < stepIdx
                  ? "bg-[#1C1E2E] border-[#1C1E2E] text-white"
                  : i === stepIdx
                  ? "bg-[#359E52] border-[#359E52] text-white"
                  : "bg-white border-[#D7D7D7] text-[#7B7C82]"
              }`}
              title={label}
            >
              {i < stepIdx ? "✓" : i + 1}
            </span>
            {i < 3 && (
              <span
                className={`h-[1.5px] w-12 sm:w-16 transition-colors ${
                  i < stepIdx ? "bg-[#1C1E2E]" : "bg-[#D7D7D7]"
                }`}
              />
            )}
          </span>
        ))}
      </div>

      {/* Steps */}
      {state.step === "prelead" && (
        <StepPrelead locale={locale} mode={mode} onDone={handlePreleadDone} />
      )}

      {state.step === "profile" && (
        <StepProfile
          onBack={() => dispatch({ type: "PREV" })}
          onDone={handleProfileDone}
        />
      )}

      {state.step === "question" && currentQuestion && (
        <StepQuestion
          question={currentQuestion}
          questionIndex={state.currentQ}
          selectedOption={state.answers[state.currentQ]}
          onSelect={handleSelect}
          onBack={() => dispatch({ type: "PREV" })}
          onNext={handleNext}
        />
      )}

      {state.step === "results" && state.results && (
        <StepResults
          results={state.results}
          answers={state.answers}
          onComplete={handleBridgeComplete}
          onRestart={() => dispatch({ type: "RESTART" })}
        />
      )}
    </div>
  );
}
