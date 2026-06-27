import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import type { Cycle } from "./types";

/* ---- Client (lazy-loaded so it stays out of the offline bundle) --------- */
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;
export function syncConfigured(): boolean {
  return Boolean(URL && ANON);
}
async function supabase(): Promise<SupabaseClient> {
  if (!client) {
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(URL!, ANON!, { auth: { persistSession: false } });
  }
  return client;
}

/* ---- Meeting codes ------------------------------------------------------ */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I,O,0,1,L
export function generateCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

/* ---- Projection: the part of a cycle we sync (current cycle only) ------- */
type Projection = {
  meta: Record<string, unknown>;
  prep1: unknown;
  prep1Ready: boolean;
  prep2: unknown;
  prep2Ready: boolean;
  shared: unknown;
  signoff: unknown;
};
const KEYS: (keyof Projection)[] = [
  "meta",
  "prep1",
  "prep1Ready",
  "prep2",
  "prep2Ready",
  "shared",
  "signoff",
];

function project(c: Cycle): Projection {
  const { code: _omit, ...meta } = c.meta;
  void _omit;
  return {
    meta,
    prep1: c.prep.partner1,
    prep1Ready: c.prep.partner1Ready,
    prep2: c.prep.partner2,
    prep2Ready: c.prep.partner2Ready,
    shared: c.shared,
    signoff: c.signOff,
  };
}

/** Apply a (partial) remote projection back onto a cycle. */
function applyProjection(c: Cycle, p: Partial<Projection>): Cycle {
  return {
    ...c,
    meta: p.meta ? { ...c.meta, ...(p.meta as object), code: c.meta.code } : c.meta,
    prep: {
      partner1: (p.prep1 as Cycle["prep"]["partner1"]) ?? c.prep.partner1,
      partner2: (p.prep2 as Cycle["prep"]["partner2"]) ?? c.prep.partner2,
      partner1Ready: p.prep1Ready ?? c.prep.partner1Ready,
      partner2Ready: p.prep2Ready ?? c.prep.partner2Ready,
    },
    shared: (p.shared as Cycle["shared"]) ?? c.shared,
    signOff: (p.signoff as Cycle["signOff"]) ?? c.signOff,
  };
}

const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/* ---- RPC wrappers ------------------------------------------------------- */
async function getMeeting(code: string): Promise<Partial<Projection> | null> {
  const sb = await supabase();
  const { data, error } = await sb.rpc("get_meeting", { p_code: code });
  if (error) throw error;
  return (data as Partial<Projection> | null) ?? null;
}
async function patchMeeting(
  code: string,
  patch: Partial<Projection>
): Promise<Partial<Projection>> {
  const sb = await supabase();
  const { data, error } = await sb.rpc("sync_meeting", {
    p_code: code,
    p_patch: patch,
  });
  if (error) throw error;
  return data as Partial<Projection>;
}

/* ---- Hook --------------------------------------------------------------- */
export type SyncState = "off" | "connecting" | "synced" | "offline";
const POLL_MS = 4000;
const PUSH_DEBOUNCE_MS = 800;

/**
 * Keeps the current cycle in sync with Supabase under its meeting code.
 * Three-way diff against the last known remote (base) so each device only
 * pushes what it changed, and adopts remote changes it did not make. Prep
 * blocks live under separate keys, so two devices never clobber each other.
 */
export function useCloudSync(
  current: Cycle | null,
  applyRemote: (merge: (c: Cycle) => Cycle) => void
) {
  const [state, setState] = useState<SyncState>(syncConfigured() ? "connecting" : "off");
  const base = useRef<Partial<Projection> | null>(null);
  const baseCode = useRef<string | null>(null);
  const pushTimer = useRef<number | undefined>(undefined);
  const liveCurrent = useRef<Cycle | null>(current);
  liveCurrent.current = current;

  const code = current?.meta.code ?? null;
  const active = syncConfigured() && Boolean(code);

  // Join / reset base when the code changes.
  useEffect(() => {
    if (!syncConfigured()) {
      setState("off");
      return;
    }
    if (!code) {
      base.current = null;
      baseCode.current = null;
      return;
    }
    if (baseCode.current === code) return;

    let cancelled = false;
    setState("connecting");
    (async () => {
      try {
        const remote = await getMeeting(code);
        if (cancelled) return;
        const cur = liveCurrent.current;
        if (!cur) return;
        if (remote && Object.keys(remote).length) {
          // Remote exists: adopt it as the source of truth on join.
          applyRemote((c) => applyProjection(c, remote));
          base.current = { ...project(cur), ...remote };
        } else {
          // First device for this code: publish what we have.
          const proj = project(cur);
          const saved = await patchMeeting(code, proj);
          base.current = saved;
        }
        baseCode.current = code;
        setState("synced");
      } catch {
        if (!cancelled) setState("offline");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Push local changes (debounced) for keys that differ from base.
  useEffect(() => {
    if (!active || !current || !code || baseCode.current !== code) return;
    const proj = project(current);
    const b = base.current ?? {};
    const patch: Partial<Projection> = {};
    for (const k of KEYS) {
      if (!eq(proj[k], (b as Projection)[k])) (patch as Record<string, unknown>)[k] = proj[k];
    }
    if (!Object.keys(patch).length) return;

    window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(async () => {
      try {
        const saved = await patchMeeting(code, patch);
        base.current = { ...base.current, ...patch, ...saved };
        setState("synced");
      } catch {
        setState("offline");
      }
    }, PUSH_DEBOUNCE_MS);
    return () => window.clearTimeout(pushTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, active, code]);

  // Poll for the other device's changes and merge them in.
  useEffect(() => {
    if (!active || !code) return;
    let stop = false;
    const tick = async () => {
      if (stop || baseCode.current !== code) return;
      try {
        const remote = await getMeeting(code);
        if (stop || !remote) return;
        const cur = liveCurrent.current;
        if (!cur) return;
        const local = project(cur);
        const b = (base.current ?? {}) as Projection;
        const incoming: Partial<Projection> = {};
        for (const k of KEYS) {
          const remoteChanged = !eq((remote as Projection)[k], b[k]);
          const localChanged = !eq(local[k], b[k]);
          // Adopt remote when it moved and we did not touch this key.
          if (remoteChanged && !localChanged) {
            (incoming as Record<string, unknown>)[k] = (remote as Projection)[k];
          }
        }
        if (Object.keys(incoming).length) {
          applyRemote((c) => applyProjection(c, incoming));
          base.current = { ...b, ...incoming };
        }
        setState("synced");
      } catch {
        setState("offline");
      }
    };
    const id = window.setInterval(tick, POLL_MS);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, code]);

  return state;
}
