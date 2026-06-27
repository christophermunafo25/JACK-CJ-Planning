import { useState } from "react";
import type { Cycle } from "../types";
import { Button, PrivacyNote } from "../components/ui";

const field =
  "w-full rounded-[8px] border border-border bg-surface px-4 py-3 text-[1.0625rem] text-ink " +
  "placeholder:text-muted/70 transition-colors duration-300 focus:border-ink focus:outline-none " +
  "focus:ring-2 focus:ring-[var(--ring)]";
const labelCls = "block text-[0.85rem] font-medium text-ink-soft mb-1.5";

export function Setup({
  onCreate,
  archive,
  onOpen,
}: {
  onCreate: (v: {
    partner1: string;
    partner2: string;
    year: string;
    meetingDate: string;
  }) => void;
  archive: Cycle[];
  onOpen: (id: string) => void;
}) {
  const thisYear = String(new Date().getFullYear());
  const [partner1, setP1] = useState("");
  const [partner2, setP2] = useState("");
  const [year, setYear] = useState(thisYear);
  const [meetingDate, setDate] = useState("");
  const ready = partner1.trim() && partner2.trim() && year.trim();

  return (
    <div className="fade-in mx-auto max-w-[42rem] px-6 py-14 sm:py-20">
      <p className="eyebrow mb-4">A yearly ritual for two</p>
      <h1 className="font-display text-[2.4rem] sm:text-[2.9rem] leading-[1.08] tracking-[-1px] text-ink mb-5">
        Let's set the <em className="italic">table</em>.
      </h1>
      <p className="text-[1.15rem] leading-relaxed text-ink-soft mb-10 max-w-[42ch]">
        Once a year you sit down, look back with honesty, and decide together where
        you're headed. Start by naming who's here and when you're meeting. You can
        change any of this later.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onCreate({ partner1, partner2, year, meetingDate });
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="p1" className={labelCls}>
              First partner
            </label>
            <input
              id="p1"
              className={field}
              value={partner1}
              onChange={(e) => setP1(e.target.value)}
              placeholder="Name"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="p2" className={labelCls}>
              Second partner
            </label>
            <input
              id="p2"
              className={field}
              value={partner2}
              onChange={(e) => setP2(e.target.value)}
              placeholder="Name"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="yr" className={labelCls}>
              Planning year
            </label>
            <input
              id="yr"
              className={field}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div>
            <label htmlFor="md" className={labelCls}>
              Meeting date
            </label>
            <input
              id="md"
              type="date"
              className={field}
              value={meetingDate}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={!ready}>
            Begin our prep
          </Button>
        </div>
      </form>

      <div className="mt-12 rounded-[12px] bg-surface-sunk p-6">
        <PrivacyNote />
      </div>

      {archive.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-[1.3rem] text-ink mb-4">Past plans</h2>
          <ul className="space-y-2">
            {archive
              .slice()
              .reverse()
              .map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onOpen(c.id)}
                    className="flex w-full items-center justify-between rounded-[12px] bg-surface px-4 py-3.5 text-left transition-colors duration-300 hover:bg-surface-sunk"
                  >
                    <span className="text-ink">
                      {c.meta.year}
                      <span className="text-muted">
                        {"  ·  "}
                        {c.meta.partner1} &amp; {c.meta.partner2}
                      </span>
                    </span>
                    <span className="eyebrow">Open →</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
