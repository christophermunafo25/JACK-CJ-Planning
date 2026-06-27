import { forwardRef } from "react";
import type { Cycle } from "../types";
import { PREP_QUESTIONS, SHARED_SECTIONS } from "../content";

const ink = "#191818";
const soft = "#46443f";
const muted = "#78736c";
const line = "#e1dcd5";
const mono = '"IBM Plex Mono", monospace';
const serif = '"IBM Plex Serif", Georgia, serif';

function Answer({ text }: { text: string }) {
  const empty = !text.trim();
  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
        color: empty ? muted : soft,
        fontStyle: empty ? "italic" : "normal",
        fontSize: "10.5pt",
        lineHeight: 1.55,
      }}
    >
      {empty ? "Left blank" : text}
    </div>
  );
}

/** Off-screen layout captured by html2pdf. Theme-independent, print-styled. */
export const PrintDocument = forwardRef<HTMLDivElement, { cycle: Cycle }>(
  ({ cycle }, ref) => {
    const { meta, prep, shared, signOff } = cycle;
    const p1 = meta.partner1 || "Partner 1";
    const p2 = meta.partner2 || "Partner 2";

    return (
      <div
        ref={ref}
        className="pdf-page"
        style={{ width: 700, padding: "8px 4px", boxSizing: "border-box" }}
      >
        {/* Masthead */}
        <div
          style={{
            textAlign: "center",
            paddingBottom: 18,
            borderBottom: `1px solid ${line}`,
            marginBottom: 26,
          }}
        >
          <div
            style={{
              fontSize: "9pt",
              letterSpacing: "0.75px",
              textTransform: "uppercase",
              color: muted,
              fontFamily: mono,
              marginBottom: 10,
            }}
          >
            Our Annual Plan
          </div>
          <h1
            style={{
              fontSize: "34pt",
              margin: "0 0 10px",
              color: ink,
              fontWeight: 400,
              fontFamily: serif,
              letterSpacing: "-1px",
            }}
          >
            {meta.year}
          </h1>
          <div style={{ fontSize: "11pt", color: soft }}>
            {p1} &amp; {p2}
          </div>
          {meta.meetingDate && (
            <div style={{ fontSize: "10pt", color: muted, marginTop: 4 }}>
              Met on {meta.meetingDate}
            </div>
          )}
        </div>

        {/* Prep, side by side */}
        <SectionHeading n="Part 1" title="What we each brought in" />
        <div style={{ display: "flex", gap: 22, marginBottom: 8 }}>
          {[
            { name: p1, a: prep.partner1 },
            { name: p2, a: prep.partner2 },
          ].map((col) => (
            <div key={col.name} style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "11pt",
                  fontWeight: 600,
                  color: ink,
                  marginBottom: 10,
                  fontFamily: serif,
                }}
              >
                {col.name}
              </div>
              {PREP_QUESTIONS.map((q) => (
                <div key={q.id} style={{ marginBottom: 12, breakInside: "avoid" }}>
                  <div style={{ fontSize: "9.5pt", color: muted, marginBottom: 3 }}>
                    {q.text}
                  </div>
                  <Answer text={col.a[q.id]} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Shared sections */}
        {SHARED_SECTIONS.map((step) => (
          <div key={step.part} style={{ marginTop: 22, breakInside: "avoid" }}>
            <SectionHeading n={`Part ${step.part}`} title={step.title} />
            {step.fields.map((f) => (
              <div key={f.id} style={{ marginBottom: 14, breakInside: "avoid" }}>
                <div
                  style={{
                    fontSize: "10.5pt",
                    fontWeight: 600,
                    color: ink,
                    marginBottom: 4,
                  }}
                >
                  {f.label}
                </div>
                <Answer text={shared[f.id] ?? ""} />
              </div>
            ))}
          </div>
        ))}

        {/* Sign-off */}
        <div
          style={{
            marginTop: 30,
            paddingTop: 22,
            borderTop: `1px solid ${line}`,
            breakInside: "avoid",
          }}
        >
          <SectionHeading n="Part 6" title="Our commitment" />
          <p
            style={{
              fontSize: "13pt",
              fontStyle: "italic",
              color: ink,
              lineHeight: 1.6,
              margin: "0 0 26px",
              fontFamily: serif,
              letterSpacing: "-0.3px",
            }}
          >
            We talked honestly, we agreed on where we’re headed, and we commit to
            the plan and goals we set today.
          </p>
          <div style={{ display: "flex", gap: 40, marginTop: 10 }}>
            {[signOff.partner1Name || p1, signOff.partner2Name || p2].map((nm, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: "17pt",
                    color: ink,
                    borderBottom: `1px solid ${line}`,
                    paddingBottom: 6,
                    minHeight: 26,
                  }}
                >
                  {nm}
                </div>
                <div style={{ fontSize: "8.5pt", color: muted, marginTop: 4 }}>
                  Signature
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "10pt", color: soft, marginTop: 18 }}>
            Signed {signOff.date || meta.meetingDate || meta.year}
          </div>
        </div>
      </div>
    );
  }
);

function SectionHeading({ n, title }: { n: string; title: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <span
        style={{
          fontSize: "8.5pt",
          letterSpacing: "0.75px",
          textTransform: "uppercase",
          color: muted,
          fontFamily: mono,
        }}
      >
        {n}
      </span>
      <h2
        style={{
          fontSize: "16pt",
          margin: "4px 0 0",
          color: ink,
          fontWeight: 400,
          fontFamily: serif,
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </h2>
    </div>
  );
}
