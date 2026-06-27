import { useRef, useState } from "react";
import type { Cycle } from "../types";
import { PREP_QUESTIONS, SHARED_SECTIONS } from "../content";
import { Button } from "../components/ui";
import { PrintDocument } from "../components/PrintDocument";
import { downloadPdf } from "../export";

export function Review({
  cycle,
  onBackToMeeting,
  onNewYear,
}: {
  cycle: Cycle;
  onBackToMeeting: () => void;
  onNewYear: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const p1 = cycle.meta.partner1 || "Partner 1";
  const p2 = cycle.meta.partner2 || "Partner 2";

  const handleDownload = async () => {
    if (!printRef.current) return;
    setBusy(true);
    try {
      await downloadPdf(printRef.current, cycle.meta.year);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fade-in mx-auto max-w-[44rem] px-6 py-12 sm:py-16">
      <p className="eyebrow mb-3">Everything you captured</p>
      <h1 className="font-display text-[2.2rem] sm:text-[2.7rem] leading-[1.1] tracking-[-1.5px] text-ink mb-4">
        Your plan for <em className="italic">{cycle.meta.year}</em>.
      </h1>
      <p className="text-[1.12rem] leading-relaxed text-ink-soft mb-8 max-w-[62ch]">
        Read it over together. When it feels right, download a copy to keep. The
        file lives on your computer, so save it somewhere you'll find it next year.
      </p>

      <div className="flex flex-wrap gap-3 mb-12">
        <Button onClick={handleDownload} disabled={busy}>
          {busy ? "Preparing…" : "Download our plan (PDF)"}
        </Button>
        <Button variant="ghost" onClick={onBackToMeeting}>
          Back to edit
        </Button>
      </div>

      {/* On-screen summary */}
      <Summary cycle={cycle} p1={p1} p2={p2} />

      {/* New year */}
      <div className="mt-16 rounded-[16px] bg-surface-sunk p-7">
        <h2 className="font-display text-[1.4rem] text-ink mb-2">
          Ready for next year?
        </h2>
        <p className="text-[0.95rem] leading-relaxed text-ink-soft mb-4">
          Starting a new year keeps this one as a signed record and opens a fresh
          plan, carrying {p1} and {p2} forward. Download this plan first so you
          have your own copy.
        </p>
        {!confirmNew ? (
          <Button variant="ghost" onClick={() => setConfirmNew(true)}>
            Start a new year
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[0.92rem] text-ink-soft">
              Archive {cycle.meta.year} and begin a new plan?
            </span>
            <Button onClick={onNewYear}>Yes, start fresh</Button>
            <Button variant="quiet" onClick={() => setConfirmNew(false)}>
              Not yet
            </Button>
          </div>
        )}
      </div>

      {/* Off-screen print source */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -10000,
          top: 0,
          width: 700,
          pointerEvents: "none",
        }}
      >
        <PrintDocument ref={printRef} cycle={cycle} />
      </div>
    </div>
  );
}

function Summary({ cycle, p1, p2 }: { cycle: Cycle; p1: string; p2: string }) {
  return (
    <div className="space-y-12">
      <SummaryBlock part="Part 1" title="What we each brought in">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          {[
            { name: p1, a: cycle.prep.partner1 },
            { name: p2, a: cycle.prep.partner2 },
          ].map((col) => (
            <div key={col.name}>
              <h4 className="font-display text-[1.15rem] text-ink mb-4">
                {col.name}
              </h4>
              <div className="space-y-4">
                {PREP_QUESTIONS.map((q) => (
                  <Field key={q.id} label={q.text} value={col.a[q.id]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SummaryBlock>

      {SHARED_SECTIONS.map((s) => (
        <SummaryBlock key={s.part} part={`Part ${s.part}`} title={s.title}>
          <div className="space-y-5">
            {s.fields.map((f) => (
              <Field key={f.id} label={f.label} value={cycle.shared[f.id] ?? ""} />
            ))}
          </div>
        </SummaryBlock>
      ))}

      <SummaryBlock part="Part 6" title="Our commitment">
        <blockquote className="font-serif text-[1.35rem] italic leading-relaxed tracking-[-0.5px] text-ink mb-6 max-w-[60ch]">
          We talked honestly, we agreed on where we're headed, and we commit to
          the plan and goals we set today.
        </blockquote>
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Signed name={cycle.signOff.partner1Name || p1} />
          <Signed name={cycle.signOff.partner2Name || p2} />
        </div>
        <p className="mt-5 text-[0.9rem] text-muted">
          Signed {cycle.signOff.date || cycle.meta.meetingDate || cycle.meta.year}
        </p>
      </SummaryBlock>
    </div>
  );
}

function SummaryBlock({
  part,
  title,
  children,
}: {
  part: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-7">
      <p className="eyebrow mb-2">{part}</p>
      <h3 className="font-display text-[1.6rem] tracking-[-0.5px] text-ink mb-5">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const empty = !value.trim();
  return (
    <div>
      <div className="text-[0.9rem] text-muted mb-1">{label}</div>
      <div
        className={
          "whitespace-pre-wrap text-[1.0625rem] leading-relaxed " +
          (empty ? "italic text-muted" : "text-ink")
        }
      >
        {empty ? "Left blank" : value}
      </div>
    </div>
  );
}

function Signed({ name }: { name: string }) {
  return (
    <div>
      <div className="min-w-[10rem] border-b border-border pb-1 font-display text-[1.4rem] text-ink">
        {name}
      </div>
      <div className="mt-1 text-[0.78rem] text-muted">Signature</div>
    </div>
  );
}
