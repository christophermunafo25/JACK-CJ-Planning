import { useEffect, useState } from "react";
import type { Cycle } from "../types";
import { PREP_QUESTIONS, STEPS } from "../content";
import { AutoTextarea, Button } from "../components/ui";

export function Meeting({
  cycle,
  onChange,
  onFinish,
}: {
  cycle: Cycle;
  onChange: (mutator: (c: Cycle) => Cycle) => void;
  onFinish: () => void;
}) {
  const stepKey = `annual-plan:step:${cycle.id}`;
  const [i, setI] = useState<number>(() => {
    const saved = Number(localStorage.getItem(stepKey));
    return Number.isFinite(saved) && saved >= 0 && saved < STEPS.length ? saved : 0;
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(stepKey, String(i));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [i, stepKey]);

  const step = STEPS[i];
  const total = STEPS.length;
  const p1 = cycle.meta.partner1 || "Partner 1";
  const p2 = cycle.meta.partner2 || "Partner 2";

  const setShared = (id: string, value: string) =>
    onChange((c) => ({ ...c, shared: { ...c.shared, [id]: value } }));

  const setSign = (key: "partner1Name" | "partner2Name" | "date", value: string) =>
    onChange((c) => ({ ...c, signOff: { ...c.signOff, [key]: value } }));

  const back = () => setI((n) => Math.max(0, n - 1));
  const next = () => {
    if (i === total - 1) onFinish();
    else setI((n) => Math.min(total - 1, n + 1));
  };

  return (
    <div className="mx-auto max-w-[44rem] px-6 pb-24">
      {/* Progress */}
      <div className="sticky top-0 z-10 -mx-6 mb-2 bg-canvas/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between mb-2.5">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            className="eyebrow text-ink-soft hover:text-ink"
          >
            Part {step.part} of {STEPS[total - 1].part}
            <span aria-hidden className="ml-1.5 text-muted">
              {menuOpen ? "▴" : "▾"}
            </span>
          </button>
          <span className="eyebrow">
            {i + 1} / {total}
          </span>
        </div>
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-surface-sunk">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${((i + 1) / total) * 100}%` }}
          />
        </div>

        {menuOpen && (
          <ul className="mt-3 overflow-hidden rounded-[12px] bg-surface fade-in">
            {STEPS.map((s, idx) => (
              <li key={s.part}>
                <button
                  onClick={() => {
                    setI(idx);
                    setMenuOpen(false);
                  }}
                  className={
                    "flex w-full items-baseline gap-3 px-4 py-2.5 text-left text-[0.92rem] transition-colors hover:bg-surface-sunk " +
                    (idx === i ? "text-ink font-medium" : "text-ink-soft")
                  }
                >
                  <span className="eyebrow w-14 shrink-0">Part {s.part}</span>
                  <span className="truncate">{s.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Step body */}
      <div key={i} className="fade-in pt-6">
        <p className="eyebrow mb-3">Part {step.part}</p>
        <h1 className="font-display text-[2rem] sm:text-[2.4rem] leading-[1.12] tracking-[-1px] text-ink mb-5">
          {step.title}
        </h1>

        {step.kind === "reveal" && (
          <div>
            <p className="text-[1.15rem] leading-relaxed text-ink-soft mb-9 max-w-[62ch]">
              {step.intro}
            </p>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
              {[
                { name: p1, a: cycle.prep.partner1 },
                { name: p2, a: cycle.prep.partner2 },
              ].map((col) => (
                <div
                  key={col.name}
                  className="rounded-[16px] bg-surface p-6 sm:p-7"
                >
                  <h2 className="font-display text-[1.4rem] tracking-[-0.5px] text-ink mb-5">
                    {col.name}
                  </h2>
                  <div className="space-y-5">
                    {PREP_QUESTIONS.map((q) => {
                      const val = col.a[q.id].trim();
                      return (
                        <div key={q.id}>
                          <div className="text-[0.88rem] text-muted mb-1.5">
                            {q.text}
                          </div>
                          <div
                            className={
                              "whitespace-pre-wrap text-[1.0625rem] leading-relaxed " +
                              (val ? "text-ink" : "italic text-muted")
                            }
                          >
                            {val || "Left blank"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step.kind === "fields" && (
          <div className="space-y-8">
            {step.intro && (
              <p className="text-[1.12rem] leading-relaxed text-ink-soft max-w-[62ch]">
                {step.intro}
              </p>
            )}
            {step.fields.map((f) => (
              <div key={f.id}>
                <label
                  htmlFor={`f-${f.id}`}
                  className="block font-serif text-[1.28rem] leading-snug tracking-[-0.5px] text-ink mb-1.5"
                >
                  {f.label}
                </label>
                {f.helper && (
                  <p className="text-[0.9rem] leading-relaxed text-muted mb-3">
                    {f.helper}
                  </p>
                )}
                {!f.helper && <div className="mb-3" />}
                <AutoTextarea
                  id={`f-${f.id}`}
                  value={cycle.shared[f.id] ?? ""}
                  onChange={(e) => setShared(f.id, e.target.value)}
                  placeholder="Write together…"
                />
              </div>
            ))}
          </div>
        )}

        {step.kind === "signoff" && (
          <div>
            <p className="text-[1.12rem] leading-relaxed text-ink-soft mb-8 max-w-[62ch]">
              {step.intro}
            </p>
            <blockquote className="rounded-[16px] bg-surface-sunk p-7 sm:p-8 mb-9">
              <p className="font-serif text-[1.45rem] leading-relaxed tracking-[-0.5px] text-ink italic">
                {step.line}
              </p>
            </blockquote>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SignField
                id="sign1"
                label={`${p1}'s name`}
                value={cycle.signOff.partner1Name}
                placeholder={p1}
                onChange={(v) => setSign("partner1Name", v)}
              />
              <SignField
                id="sign2"
                label={`${p2}'s name`}
                value={cycle.signOff.partner2Name}
                placeholder={p2}
                onChange={(v) => setSign("partner2Name", v)}
              />
            </div>
            <div className="mt-5 max-w-[16rem]">
              <label htmlFor="signdate" className="block text-[0.9rem] font-medium text-ink-soft mb-1.5">
                Date
              </label>
              <input
                id="signdate"
                type="date"
                value={cycle.signOff.date}
                onChange={(e) => setSign("date", e.target.value)}
                className="w-full rounded-[8px] border border-border bg-surface px-4 py-3 text-[1.0625rem] text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="mt-12 flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={i === 0}>
          ← Back
        </Button>
        <Button onClick={next}>
          {i === total - 1 ? "Finish and review →" : "Continue →"}
        </Button>
      </div>
    </div>
  );
}

function SignField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.9rem] font-medium text-ink-soft mb-1.5">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className="w-full rounded-[8px] border border-border bg-surface px-4 py-3 font-display text-[1.35rem] text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
      />
    </div>
  );
}
