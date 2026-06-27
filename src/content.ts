import type { PrepAnswers } from "./types";

/* ---- Prep questions (verbatim) ----------------------------------------- */
export const PREP_QUESTIONS: { id: keyof PrepAnswers; text: string }[] = [
  { id: "bestPart", text: "The best part of this past year for me was…" },
  {
    id: "wantDifferent",
    text: "The thing I most want to be different a year from now is…",
  },
  {
    id: "unspokenWorry",
    text: "One worry I've been sitting on but haven't said out loud is…",
  },
  {
    id: "tenYearLife",
    text: "If money were not a constraint, the life I'd want in 10 years looks like…",
  },
];

/* ---- Meeting agenda (verbatim) ----------------------------------------- */
export type Field = { id: string; label: string; helper?: string };

export type Step =
  | { kind: "reveal"; part: number; title: string; intro: string }
  | { kind: "fields"; part: number; title: string; intro?: string; fields: Field[] }
  | { kind: "signoff"; part: number; title: string; intro: string; line: string };

export const STEPS: Step[] = [
  {
    kind: "reveal",
    part: 1,
    title: "Read our prep to each other",
    intro:
      "Take this slowly. Read each answer out loud to one another before moving on. Nothing to fill in here, just a moment to really hear each other.",
  },
  {
    kind: "fields",
    part: 2,
    title: "Reconnect and look back at the last year",
    fields: [
      {
        id: "team_year",
        label:
          "How we did as a team this past year. Where did we have each other's backs, and where did we drop the ball?",
      },
      { id: "three_wins", label: "Three wins worth celebrating." },
      { id: "didnt_go", label: "What didn't go the way we hoped, and why." },
    ],
  },
  {
    kind: "fields",
    part: 3,
    title: "Our 5-year plan, with specifics",
    fields: [
      {
        id: "home_location",
        label: "Home & location",
        helper:
          "What city or area? Renting or owning by year five, and if owning, what down payment and when do we start saving? What does the home look like?",
      },
      {
        id: "family",
        label: "Family",
        helper:
          "Kids by year five, trying, or further out? What shifts in work, location, money to make room? Will either set of parents need support?",
      },
      {
        id: "careers_income",
        label: "Careers & income",
        helper:
          "Each of our roles and income at year five? Anyone switching fields, going back to school, or starting something? Building toward one of us working less?",
      },
      {
        id: "lifestyle",
        label: "Lifestyle & experiences",
        helper:
          "Trips or big experiences behind us by year five? How should a normal week feel? Hobbies we want to have actually invested in?",
      },
      {
        id: "us_people",
        label: "Us & the people around us",
        helper:
          "What should our relationship feel like five years in? Where do we want to be rooted for friends and community? Any shared project we want to have built?",
      },
    ],
  },
  {
    kind: "fields",
    part: 4,
    title: "Where we are financially, and what has to happen",
    fields: [
      {
        id: "money_targets",
        label:
          "Our 5-year money targets (set the destination first, with numbers and dates)",
        helper:
          "Net worth target, emergency fund target, debt-free timeline, retirement invested and on pace, any savings target tied to the plan above.",
      },
      {
        id: "where_now",
        label: "Where we are now",
        helper:
          "Net worth today, combined income, debts with rates, monthly savings, cash cushion in months.",
      },
      {
        id: "what_must_happen",
        label: "What has to happen to reach the targets",
        helper:
          "The gap, the per-year and per-month math, on pace or behind, this year's single most important financial move.",
      },
      {
        id: "fin_commitments",
        label:
          "Our financial commitments coming out of this meeting (up to three).",
      },
    ],
  },
  {
    kind: "fields",
    part: 5,
    title: "Before we close",
    fields: [
      { id: "unresolved", label: "Anything we flagged as still unresolved" },
      { id: "commitment_owners", label: "Owner for each commitment" },
      { id: "next_meeting", label: "Next meeting date" },
    ],
  },
  {
    kind: "signoff",
    part: 6,
    title: "Our commitment",
    intro: "When you both feel good about the plan, sign it together.",
    line: "We talked honestly, we agreed on where we're headed, and we commit to the plan and goals we set today.",
  },
];

/** All shared-answer field ids, in agenda order (used by export + summary). */
export const SHARED_SECTIONS = STEPS.filter(
  (s): s is Extract<Step, { kind: "fields" }> => s.kind === "fields"
);
