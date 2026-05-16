export type RewireResponse = {
  feelings: string[];
  actions: string[];
  /** Optional one-line realization from OpenAI (not always shown in UI) */
  realization?: string;
};

export type SessionState = {
  goals: string;
  /** One-line AI realization shown on step 2 */
  realization?: string;
  suggestedFeelings: string[];
  selectedFeelings: string[];
  /** Step 3 — user-written reasons they deserve the feeling */
  deserveReasons: string;
  /** Two suggested actions from the mock generator */
  actions: string[];
  customActions: string[];
  /** Indices into [...actions, ...customActions] checked on step 4 */
  completedActions: number[];
};

export type StepId = 1 | 2 | 3 | 4 | 5;
