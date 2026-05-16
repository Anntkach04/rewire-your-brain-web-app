import type { RewireResponse } from "../types";

export type GenerateContext = {
  mode?: "full" | "actions";
  goals?: string;
  selectedFeelings?: string[];
  deserveReasons?: string;
};

type FeelingKey =
  | "freedom"
  | "confidence"
  | "peace"
  | "excitement"
  | "security"
  | "love"
  | "belonging"
  | "calm"
  | "validation"
  | "clarity"
  | "stability"
  | "joy"
  | "creativity"
  | "self-trust"
  | "softness";

const KEYWORD_TO_FEELINGS: Array<[RegExp, FeelingKey[]]> = [
  [/\b(money|rich|wealth|financial|income|salary|debt|broke)\b/i, ["freedom", "security", "stability"]],
  [/\b(travel|abroad|move|relocat|escape|nomad)\b/i, ["freedom", "excitement", "joy"]],
  [/\b(success|career|promotion|job|business|founder|launch)\b/i, ["confidence", "validation", "clarity"]],
  [/\b(love|relationship|partner|boyfriend|girlfriend|husband|wife|date|dating)\b/i, ["love", "belonging", "softness"]],
  [/\b(friend|community|lonely|alone|connect)\b/i, ["belonging", "love", "joy"]],
  [/\b(beautiful|pretty|attractive|body|skin|weight|fit|gym)\b/i, ["confidence", "self-trust", "joy"]],
  [/\b(anxious|anxiety|stress|overwhelm|panic|worry|scared|afraid|fear)\b/i, ["calm", "peace", "stability"]],
  [/\b(time|wasting|behind|late|productive|procrastinat)\b/i, ["clarity", "self-trust", "peace"]],
  [/\b(create|write|paint|draw|art|music|design|build)\b/i, ["creativity", "joy", "self-trust"]],
  [/\b(confident|confidence|self-esteem|self esteem|worth)\b/i, ["confidence", "self-trust", "validation"]],
  [/\b(calm|quiet|rest|sleep|burnout|exhaust)\b/i, ["calm", "peace", "softness"]],
  [/\b(clarity|focus|direction|purpose|lost|stuck)\b/i, ["clarity", "self-trust", "peace"]],
  [/\b(future|dream|vision|hope|someday)\b/i, ["excitement", "clarity", "joy"]],
  [/\b(safe|safety|secure|stable|home)\b/i, ["security", "stability", "calm"]],
  [/\b(joy|happy|fun|playful|laugh)\b/i, ["joy", "softness", "excitement"]],
];

const ACTIONS: Record<FeelingKey, string[]> = {
  freedom: [
    "Take a walk without your phone for 10 minutes",
    "Say no to one thing you don't actually want to do",
  ],
  confidence: [
    "Wear the outfit that makes you feel a little powerful",
    "Finish one small thing you've been avoiding",
  ],
  peace: [
    "Put your phone in another room for 30 minutes",
    "Let one thing be enough exactly as it is",
  ],
  excitement: [
    "Write the first sentence of a future you want",
    "Plan one small thing for a day that hasn't happened yet",
  ],
  security: [
    "Make your bed slowly and notice how the room feels after",
    "Eat a meal sitting down, without screens",
  ],
  love: [
    "Tell someone something kind that you usually only think",
    "Notice one moment today where you were already loved",
  ],
  belonging: [
    "Reach out first to one person who actually matters",
    "Share something small you usually keep to yourself",
  ],
  calm: [
    "Put your phone away for 30 minutes",
    "Write down what actually matters today",
  ],
  validation: [
    "Acknowledge one thing you did that nobody saw",
    "Catch yourself doing something well, out loud",
  ],
  clarity: [
    "Write the same question three times until the real answer shows up",
    "Spend 10 minutes alone with no input — no music, no scroll",
  ],
  stability: [
    "Eat a real meal at a real time",
    "Pick one anchor for tomorrow and write it down",
  ],
  joy: [
    "Do something on purpose that has no outcome",
    "Notice one beautiful thing on your way somewhere",
  ],
  creativity: [
    "Make something ugly on purpose for 10 minutes",
    "Write one sentence that nobody will ever read",
  ],
  "self-trust": [
    "Keep one promise to yourself before noon, no matter how small",
    "Do the thing you'd respect yourself for, not the easy one",
  ],
  softness: [
    "Speak to yourself the way you'd speak to a tired friend",
    "Let yourself not respond immediately",
  ],
};

const DEFAULT_FEELINGS: FeelingKey[] = ["clarity", "self-trust", "calm"];

function pickFeelings(input: string): FeelingKey[] {
  const found = new Set<FeelingKey>();
  for (const [pattern, feelings] of KEYWORD_TO_FEELINGS) {
    if (pattern.test(input)) {
      feelings.forEach((f) => found.add(f));
    }
  }
  if (found.size === 0) DEFAULT_FEELINGS.forEach((f) => found.add(f));
  return Array.from(found).slice(0, 5);
}

function pickActions(feelings: FeelingKey[]): string[] {
  const picked: string[] = [];
  const used = new Set<string>();

  for (const f of feelings) {
    const pool = ACTIONS[f];
    if (!pool) continue;
    for (const a of pool) {
      if (!used.has(a)) {
        picked.push(a);
        used.add(a);
        break;
      }
    }
    if (picked.length === 2) break;
  }

  while (picked.length < 2) {
    picked.push("Notice what instantly drains your energy today");
  }

  return picked.slice(0, 2);
}

function apiUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api/generate`;
  }
  return "/api/generate";
}

async function generateWithApi(
  goals: string,
  context: GenerateContext
): Promise<RewireResponse | null> {
  const mode = context.mode ?? "full";
  const payload = JSON.stringify({
    mode,
    goals,
    selectedFeelings: context.selectedFeelings,
    deserveReasons: context.deserveReasons,
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45_000);

    try {
      const response = await fetch(apiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn("[generate] API error", response.status, errText.slice(0, 120));
        continue;
      }

      const data = (await response.json()) as RewireResponse;
      if (!Array.isArray(data.actions) || data.actions.length === 0) continue;
      if (mode === "full" && (!Array.isArray(data.feelings) || data.feelings.length === 0)) {
        continue;
      }

      return {
        feelings: data.feelings ?? [],
        actions: data.actions,
        realization: data.realization,
      };
    } catch (error) {
      console.warn("[generate] API request failed", error);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return null;
}

function generateMock(input: string, context: GenerateContext): RewireResponse {
  const feelings = pickFeelings(input);
  const actions = pickActions(feelings);

  if (context.mode === "actions") {
    return { feelings: [], actions };
  }

  return { feelings, actions };
}

/** Calls OpenAI via /api/generate; falls back to local mock if unavailable. */
export async function generateRewireResponse(
  input: string,
  context: GenerateContext = {}
): Promise<RewireResponse> {
  const goals = (context.goals ?? input).trim();
  const fromApi = await generateWithApi(goals, context);
  if (fromApi) return fromApi;

  console.warn("[generate] Using offline fallback — API unreachable or invalid response");
  await new Promise((r) => setTimeout(r, 600));
  return generateMock(input, context);
}

export const ALL_FEELINGS: FeelingKey[] = [
  "freedom",
  "confidence",
  "peace",
  "excitement",
  "security",
  "love",
  "belonging",
  "calm",
  "validation",
  "clarity",
  "stability",
  "joy",
  "creativity",
  "self-trust",
  "softness",
];
