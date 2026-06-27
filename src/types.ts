export type Phase = "setup" | "prep" | "meeting" | "review";

export type PrepAnswers = {
  bestPart: string;
  wantDifferent: string;
  unspokenWorry: string;
  tenYearLife: string;
};

export const EMPTY_PREP: PrepAnswers = {
  bestPart: "",
  wantDifferent: "",
  unspokenWorry: "",
  tenYearLife: "",
};

/** Keyed by section field id (see content.ts). */
export type SharedAnswers = Record<string, string>;

export type SignOff = {
  partner1Name: string;
  partner2Name: string;
  date: string;
};

export type CycleStatus = "setup" | "prep" | "meeting" | "review" | "archived";

export type Cycle = {
  id: string;
  meta: {
    partner1: string;
    partner2: string;
    year: string;
    meetingDate: string;
    createdAt: string;
    status: CycleStatus;
  };
  prep: {
    partner1: PrepAnswers;
    partner2: PrepAnswers;
    partner1Ready: boolean;
    partner2Ready: boolean;
  };
  shared: SharedAnswers;
  signOff: SignOff;
};

export type AppState = {
  version: number;
  currentId: string | null;
  cycles: Cycle[];
};
