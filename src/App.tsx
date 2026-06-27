import { useEffect, useState } from "react";
import type { Phase } from "./types";
import { newCycle, useAppState } from "./storage";
import { SavedIndicator, ThemeToggle } from "./components/ui";
import { Setup } from "./screens/Setup";
import { Prep } from "./screens/Prep";
import { Meeting } from "./screens/Meeting";
import { Review } from "./screens/Review";

type Theme = "light" | "dark";

function initialTheme(): Theme {
  const saved = localStorage.getItem("annual-plan:theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const {
    current,
    archive,
    saveStatus,
    updateCurrent,
    setStatus,
    startCycle,
    startNewYear,
    openCycle,
  } = useAppState();

  const [theme, setTheme] = useState<Theme>(initialTheme);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("annual-plan:theme", theme);
  }, [theme]);

  const [view, setView] = useState<Phase>(() => {
    if (!current) return "setup";
    const s = current.meta.status;
    if (s === "setup") return "setup";
    if (s === "archived") return "review";
    return s;
  });

  const handleSetup = (v: {
    partner1: string;
    partner2: string;
    year: string;
    meetingDate: string;
  }) => {
    if (current && current.meta.status === "setup") {
      updateCurrent((c) => ({
        ...c,
        meta: { ...c.meta, ...v, status: "prep" },
      }));
    } else {
      const c = newCycle(v.partner1, v.partner2, v.year, v.meetingDate);
      c.meta.status = "prep";
      startCycle(c);
    }
    setView("prep");
  };

  const goNewYear = () => {
    startNewYear();
    setView("prep");
  };

  const phases: { key: Phase; label: string }[] = [
    { key: "prep", label: "Prep" },
    { key: "meeting", label: "Meeting" },
    { key: "review", label: "Review" },
  ];

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-[52rem] items-center justify-between gap-4 px-6 py-4">
          <button
            onClick={() => setView(current ? view : "setup")}
            className="flex items-center gap-2.5 text-left"
            aria-label="Annual Plan home"
          >
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-full bg-accent text-[0.8rem] font-semibold text-on-accent"
            >
              ❦
            </span>
            <span className="font-display text-[1.15rem] tracking-[-0.5px] text-ink">
              Annual Plan
            </span>
          </button>
          <div className="flex items-center gap-3">
            <SavedIndicator status={saveStatus} />
            <ThemeToggle
              theme={theme}
              onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            />
          </div>
        </div>

        {current && current.meta.status !== "setup" && view !== "setup" && (
          <div className="mx-auto flex max-w-[52rem] items-center justify-between gap-3 px-6 pb-3">
            <nav className="flex items-center gap-1" aria-label="Phases">
              {phases.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setView(p.key)}
                  aria-current={view === p.key ? "page" : undefined}
                  className={
                    "rounded-[16px] px-4 py-1.5 text-[0.85rem] font-medium transition-colors duration-300 " +
                    (view === p.key
                      ? "bg-surface-sunk text-ink"
                      : "text-muted hover:text-ink")
                  }
                >
                  {p.label}
                </button>
              ))}
            </nav>
            <div className="text-[0.82rem] text-muted">
              {current.meta.partner1} &amp; {current.meta.partner2}
              <span className="mx-1.5">·</span>
              {current.meta.year}
            </div>
          </div>
        )}
      </header>

      <main>
        {view === "setup" && (
          <Setup
            onCreate={handleSetup}
            archive={archive}
            onOpen={(id) => {
              openCycle(id);
              setView("review");
            }}
          />
        )}

        {view !== "setup" && !current && (
          <div className="mx-auto max-w-[42rem] px-6 py-20 text-center text-ink-soft">
            <p>Nothing here yet.</p>
            <button
              onClick={() => setView("setup")}
              className="mt-3 text-accent-ink underline"
            >
              Start a plan
            </button>
          </div>
        )}

        {view === "prep" && current && (
          <Prep
            cycle={current}
            onChange={updateCurrent}
            onBeginMeeting={() => {
              setStatus("meeting");
              setView("meeting");
            }}
          />
        )}

        {view === "meeting" && current && (
          <Meeting
            cycle={current}
            onChange={updateCurrent}
            onFinish={() => {
              setStatus("review");
              setView("review");
            }}
          />
        )}

        {view === "review" && current && (
          <Review
            cycle={current}
            onBackToMeeting={() => setView("meeting")}
            onNewYear={goNewYear}
          />
        )}
      </main>

      <footer className="mx-auto max-w-[52rem] px-6 py-10 text-center text-[0.78rem] text-muted">
        Stays on this device. No accounts, no tracking.
      </footer>
    </div>
  );
}
