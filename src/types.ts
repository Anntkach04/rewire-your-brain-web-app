export type RewireResponse = {
  feelings: string[];
  actions: string[];
};

export type SessionState = {
  goals: string;
  suggestedFeelings: string[];
  selectedFeelings: string[];
  /** Step 3 — user-written reasons they deserve the feeling */
  deserveReasons: string;
  /** Two suggested actions from the mock generator */
  actions: string[];
  /** User-added actions (at least one required before step 5) */
  customActions: string[];
  completedActions: number[];
};

export type StepId = 1 | 2 | 3 | 4 | 5;
