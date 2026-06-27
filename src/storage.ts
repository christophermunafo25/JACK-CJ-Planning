import { useCallback, useEffect, useRef, useState } from "react";
import {
  type AppState,
  type Cycle,
  type CycleStatus,
  EMPTY_PREP,
} from "./types";

const STORAGE_KEY = "annual-plan:v1";
const VERSION = 1;

function makeId(): string {
  // Avoids Math.random/Date.now seeding concerns; good enough for local keys.
  return "c-" + crypto.randomUUID();
}

export function newCycle(
  partner1 = "",
  partner2 = "",
  year = String(new Date().getFullYear()),
  meetingDate = ""
): Cycle {
  return {
    id: makeId(),
    meta: {
      partner1,
      partner2,
      year,
      meetingDate,
      createdAt: new Date().toISOString(),
      status: "setup",
    },
    prep: {
      partner1: { ...EMPTY_PREP },
      partner2: { ...EMPTY_PREP },
      partner1Ready: false,
      partner2Ready: false,
    },
    shared: {},
    signOff: { partner1Name: "", partner2Name: "", date: "" },
  };
}

function emptyState(): AppState {
  return { version: VERSION, currentId: null, cycles: [] };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.cycles)) {
      return emptyState();
    }
    return parsed;
  } catch {
    return emptyState();
  }
}

export type SaveStatus = "idle" | "saving" | "saved";

export function useAppState() {
  const [state, setState] = useState<AppState>(() => load());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const firstRun = useRef(true);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSaveStatus("saving");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be full or blocked; keep the in-memory copy.
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaveStatus("saved"), 350);
    return () => window.clearTimeout(timer.current);
  }, [state]);

  const current = state.cycles.find((c) => c.id === state.currentId) ?? null;
  const archive = state.cycles.filter(
    (c) => c.meta.status === "archived" && c.id !== state.currentId
  );

  const updateCurrent = useCallback(
    (mutator: (c: Cycle) => Cycle) => {
      setState((s) => {
        if (!s.currentId) return s;
        return {
          ...s,
          cycles: s.cycles.map((c) =>
            c.id === s.currentId ? mutator(c) : c
          ),
        };
      });
    },
    []
  );

  const setStatus = useCallback(
    (status: CycleStatus) => {
      updateCurrent((c) => ({ ...c, meta: { ...c.meta, status } }));
    },
    [updateCurrent]
  );

  const startCycle = useCallback((cycle: Cycle) => {
    setState((s) => ({
      ...s,
      currentId: cycle.id,
      cycles: [...s.cycles, cycle],
    }));
  }, []);

  /** Archive the current cycle and begin a fresh one, carrying names forward. */
  const startNewYear = useCallback(() => {
    setState((s) => {
      const cur = s.cycles.find((c) => c.id === s.currentId);
      const fresh = newCycle(
        cur?.meta.partner1 ?? "",
        cur?.meta.partner2 ?? "",
        String(Number(cur?.meta.year ?? new Date().getFullYear()) + 1),
        ""
      );
      return {
        ...s,
        currentId: fresh.id,
        cycles: [
          ...s.cycles.map((c) =>
            c.id === s.currentId
              ? { ...c, meta: { ...c.meta, status: "archived" as const } }
              : c
          ),
          fresh,
        ],
      };
    });
  }, []);

  const openCycle = useCallback((id: string) => {
    setState((s) => ({ ...s, currentId: id }));
  }, []);

  return {
    state,
    current,
    archive,
    saveStatus,
    updateCurrent,
    setStatus,
    startCycle,
    startNewYear,
    openCycle,
  };
}
