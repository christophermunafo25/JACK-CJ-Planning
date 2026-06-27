import { useState } from "react";
import type { Cycle, PrepAnswers } from "../types";
import { PREP_QUESTIONS } from "../content";
import { AutoTextarea, Button } from "../components/ui";

export function Prep({
  cycle,
  onChange,
  onBeginMeeting,
}: {
  cycle: Cycle;
  onChange: (mutator: (c: Cycle) => Cycle) => void;
  onBeginMeeting: () => void;
}) {
  const [who, setWho] = useState<"partner1" | "partner2">("partner1");
  const p1 = cycle.meta.partner1 || "Partner 1";
  const p2 = cycle.meta.partner2 || "Partner 2";
  const activeName = who === "partner1" ? p1 : p2;
  const answers = cycle.prep[who];
  const ready =
    who === "partner1" ? cycle.prep.partner1Ready : cycle.prep.partner2Ready;
  const bothReady = cycle.prep.partner1Ready && cycle.prep.partner2Ready;

  const setAnswer = (id: keyof PrepAnswers, value: string) => {
    onChange((c) => ({
      ...c,
      prep: { ...c.prep, [who]: { ...c.prep[who], [id]: value } },
    }));
  };

  const toggleReady = () => {
    onChange((c) => ({
      ...c,
      prep: {
        ...c.prep,
        [who === "partner1" ? "partner1Ready" : "partner2Ready"]: !ready,
      },
    }));
  };

  return (
    <div className="fade-in mx-auto max-w-[44rem] px-6 py-12 sm:py-16">
      <p className="eyebrow mb-3">Prep, on your own</p>
      <h1 className="font-display text-[2.1rem] sm:text-[2.5rem] leading-[1.1] tracking-[-1px] text-ink mb-4">
        Four questions, just for <em className="italic">you</em>.
      </h1>
      <p className="text-[1.12rem] leading-relaxed text-ink-soft mb-3 max-w-[60ch]">
        Answer in the quiet days before you meet. Take your time, and be honest
        with yourself first. Your words stay hidden from each other until you sit
        down together.
      </p>
      <p className="text-[0.85rem] text-muted mb-8">
        Saves as you type. Come back and edit any time before the meeting.
      </p>

      {/* Whose turn */}
      <div
        role="tablist"
        aria-label="Who is answering"
        className="inline-flex rounded-full border border-border bg-surface p-1 mb-9"
      >
        {(["partner1", "partner2"] as const).map((key) => {
          const name = key === "partner1" ? p1 : p2;
          const isReady =
            key === "partner1" ? cycle.prep.partner1Ready : cycle.prep.partner2Ready;
          const selected = who === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={selected}
              onClick={() => setWho(key)}
              className={
                "rounded-[16px] px-5 py-2 text-[0.95rem] font-medium transition-colors duration-300 " +
                (selected
                  ? "bg-accent text-on-accent"
                  : "text-ink-soft hover:text-ink")
              }
            >
              {name}
              {isReady && (
                <span aria-hidden className="ml-1.5 opacity-80">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[0.92rem] text-muted mb-6">
        You're answering as{" "}
        <span className="text-ink font-medium">{activeName}</span>.
      </p>

      <div className="space-y-9">
        {PREP_QUESTIONS.map((q, i) => (
          <div key={q.id}>
            <label
              htmlFor={`prep-${q.id}`}
              className="block font-serif text-[1.3rem] leading-snug tracking-[-0.5px] text-ink mb-3"
            >
              <span className="eyebrow mr-2.5 align-middle">{String(i + 1).padStart(2, "0")}</span>
              {q.text}
            </label>
            <AutoTextarea
              id={`prep-${q.id}`}
              value={answers[q.id]}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              placeholder="Write freely…"
            />
          </div>
        ))}
      </div>

      <div className="mt-11 flex flex-col gap-4 rounded-[12px] bg-surface-sunk p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[0.95rem] text-ink-soft">
          {bothReady ? (
            <span>You're both ready. Whenever you're together, begin.</span>
          ) : ready ? (
            <span>
              {activeName} is ready. Waiting on{" "}
              {who === "partner1" ? p2 : p1}.
            </span>
          ) : (
            <span>Mark yourself ready once these feel complete.</span>
          )}
        </div>
        <Button variant={ready ? "ghost" : "primary"} onClick={toggleReady}>
          {ready ? `${activeName} is ready ✓` : "I'm ready"}
        </Button>
      </div>

      {bothReady && (
        <div className="mt-8 text-center fade-in">
          <Button onClick={onBeginMeeting}>Begin the meeting together →</Button>
        </div>
      )}
    </div>
  );
}
