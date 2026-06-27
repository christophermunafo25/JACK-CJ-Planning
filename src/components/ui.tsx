import { type ReactNode, type TextareaHTMLAttributes, useState } from "react";
import type { SaveStatus } from "../storage";
import { syncConfigured, type SyncState } from "../sync";

/* ---- Auto-growing textarea --------------------------------------------- */
type AutoTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
};

export function AutoTextarea({ value, className = "", ...rest }: AutoTextareaProps) {
  return (
    <div className="grow-wrap" data-replicated-value={value}>
      <textarea
        {...rest}
        value={value}
        rows={2}
        className={
          "w-full rounded-[8px] border border-border bg-surface text-[1.0625rem] text-ink " +
          "placeholder:text-muted/70 transition-colors duration-300 focus:border-ink " +
          "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-0 " +
          className
        }
      />
    </div>
  );
}

/* ---- Quiet autosave indicator ------------------------------------------ */
export function SavedIndicator({ status }: { status: SaveStatus }) {
  const label =
    status === "saving" ? "Saving" : status === "saved" ? "Saved" : "";
  return (
    <span
      aria-live="polite"
      className="eyebrow inline-flex items-center gap-1.5 select-none"
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full transition-colors"
        style={{
          backgroundColor:
            status === "saved"
              ? "var(--ok)"
              : status === "saving"
              ? "var(--muted)"
              : "transparent",
        }}
        aria-hidden
      />
      {label}
    </span>
  );
}

/* ---- Buttons ------------------------------------------------------------ */
type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "ghost" | "quiet";
  className?: string;
};

export function Button({
  children,
  onClick,
  type = "button",
  disabled,
  variant = "primary",
  className = "",
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[16px] px-6 py-3 text-[0.95rem] " +
    "font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed " +
    "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2";
  const styles =
    variant === "primary"
      ? "bg-accent text-on-accent hover:opacity-90 active:opacity-100"
      : variant === "ghost"
      ? "border border-border-strong bg-transparent text-ink hover:bg-surface"
      : "text-muted hover:text-ink";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={variant === "primary" ? { boxShadow: "var(--btn-bevel)" } : undefined}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

/* ---- Sync badge: shows the meeting code and link status ----------------- */
export function SyncBadge({ state, code }: { state: SyncState; code: string }) {
  const [copied, setCopied] = useState(false);
  const dot =
    state === "synced" ? "var(--ok)" : state === "offline" ? "var(--color-amber)" : "var(--muted)";
  const title =
    state === "synced"
      ? "Synced. Tap to copy your code."
      : state === "offline"
      ? "Offline, saved on this device. Will sync when you reconnect."
      : "Connecting…";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked; ignore */
    }
  };

  return (
    <button
      onClick={copy}
      title={title}
      aria-label={`Meeting code ${code}. ${title}`}
      className="eyebrow inline-flex items-center gap-1.5 rounded-[16px] bg-surface px-2.5 py-1.5 hover:bg-surface-sunk transition-colors"
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: dot }}
        aria-hidden
      />
      {copied ? "Copied" : code}
    </button>
  );
}

/* ---- Theme toggle ------------------------------------------------------- */
export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "light" | "dark";
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-soft hover:bg-surface-sunk transition-colors"
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

/* ---- Misc --------------------------------------------------------------- */
export function PrivacyNote({ className = "" }: { className?: string }) {
  const cls = "text-[0.82rem] leading-relaxed text-muted " + className;
  if (syncConfigured()) {
    return (
      <p className={cls}>
        Your plan saves on this device and syncs privately to your own Supabase
        project using your meeting code. Anyone with the code can open the plan,
        so share it only with each other. No accounts and no tracking. Download a
        copy once you finish so you always have your own.
      </p>
    );
  }
  return (
    <p className={cls}>
      Everything you write stays on this device, in this browser. No accounts, no
      cloud, no tracking. Clearing your browser data clears this too, so download
      a copy once you finish.
    </p>
  );
}
