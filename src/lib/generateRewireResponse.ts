import { sanitizeActions } from "../../lib/sanitize-actions";
import type { RewireResponse } from "../types";

type ApiPayload = {
  feelings?: string[];
  actions?: string[];
  tasks?: string[];
  realization?: string;
  error?: string;
};

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
    "Take a 10-minute walk without your phone",
    "Say no to one thing you don't actually want to do",
  ],
  confidence: [
    "Post or send one thing you've been holding back",
    "Wear the outfit that makes you feel a little powerful",
  ],
  peace: [
    "Put your phone in another room for 30 minutes",
    "Drink a full glass of water slowly",
  ],
  excitement: [
    "Do one bold small thing you've been postponing",
    "Share one update about something you care about",
  ],
  security: [
    "Eat one meal sitting down, no screens",
    "Get 10k steps today",
  ],
  love: [
    "Send one honest message to someone you care about",
    "Give someone a real compliment out loud",
  ],
  belonging: [
    "Text one person who actually matters to you",
    "Show up to one place where you feel like yourself",
  ],
  calm: [
    "Put your phone away for 30 minutes",
    "Take 10 slow breaths before your next task",
  ],
  validation: [
    "Finish one small thing you've been avoiding",
    "Post or share one piece of work you're proud of",
  ],
  clarity: [
    "Write one sentence about what you want today",
    "Do the next obvious small step on your goal",
  ],
  stability: [
    "Eat a real meal at a real time",
    "Go to bed 30 minutes earlier tonight",
  ],
  joy: [
    "Do one thing today just because it feels good",
    "Play one song you love and don't multitask",
  ],
  creativity: [
    "Post one thing you made, even if it's unfinished",
    "Spend 15 minutes on your creative work",
  ],
  "self-trust": [
    "Keep one promise to yourself before noon, no matter how small",
    "Do the thing you'd respect yourself for, not the easy one",
  ],
  softness: [
    "Take a real break without guilt for 20 minutes",
    "Say no to one thing that drains you today",
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

function pickGoalActions(goals: string): string[] {
  const picked: string[] = [];
  const lower = goals.toLowerCase();
  const patterns: Array<[RegExp, string]> = [
    [/\b(instagram|insta|reels?|tiktok|youtube|followers?|influencer)\b/i, "Post one video on Instagram"],
    [/\b(10k steps|steps|walk|run|fitness|gym)\b/i, "Get 10k steps today"],
    [/\b(water|hydrat)\b/i, "Drink 2.5L water today"],
  ];
  for (const [pattern, action] of patterns) {
    if (pattern.test(lower) && !picked.includes(action)) {
      picked.push(action);
    }
    if (picked.length >= 2) break;
  }
  return picked;
}

function pickActions(feelings: FeelingKey[], goals: string): string[] {
  const picked = pickGoalActions(goals);
  const used = new Set(picked);

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
    picked.push("Do the next obvious small step on your goal");
  }

  return sanitizeActions(picked, { goals }, 2);
}

function apiUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api/generate`;
  }
  return "/api/generate";
}

function parseApiPayload(raw: string, mode: "full" | "actions"): RewireResponse | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    console.warn("[generate] Non-JSON response (got HTML?) — first chars:", trimmed.slice(0, 40));
    return null;
  }

  let data: ApiPayload;
  try {
    data = JSON.parse(trimmed) as ApiPayload;
  } catch {
    console.warn("[generate] JSON parse failed");
    return null;
  }

  if (data.error) {
    console.warn("[generate] API error:", data.error);
    return null;
  }

  const actionsRaw = data.actions ?? data.tasks ?? [];
  const actions = Array.isArray(actionsRaw)
    ? actionsRaw.map((a) => (typeof a === "string" ? a.trim() : "")).filter(Boolean)
    : [];

  if (actions.length === 0) return null;

  const feelings = Array.isArray(data.feelings)
    ? data.feelings.map((f) => (typeof f === "string" ? f.trim() : "")).filter(Boolean)
    : [];

  if (mode === "full" && feelings.length === 0) return null;

  return {
    feelings,
    actions,
    realization: typeof data.realization === "string" ? data.realization : undefined,
  };
}

const MAX_ATTEMPTS = 5;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Warm up the API connection (helps iOS Safari on first tap). */
export function warmupGenerateApi(): void {
  if (typeof window === "undefined") return;
  const url = apiUrl();
  window.setTimeout(() => {
    fetch(url, { method: "GET", cache: "no-cache" }).catch(() => {});
  }, 0);
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
  const url = apiUrl();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await wait(400 * attempt);
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: payload,
        cache: "no-cache",
        signal: controller.signal,
      });

      const raw = await response.text();

      if (!response.ok) {
        console.warn("[generate] API error", response.status, raw.slice(0, 120));
        continue;
      }

      const parsed = parseApiPayload(raw, mode);
      if (!parsed) continue;

      return {
        feelings: parsed.feelings,
        actions: sanitizeActions(parsed.actions, {
          goals,
          feelings: context.selectedFeelings,
        }),
        realization: parsed.realization,
        fromApi: true,
      };
    } catch (error) {
      console.warn(`[generate] API attempt ${attempt + 1}/${MAX_ATTEMPTS} failed`, error);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return null;
}

function generateMock(input: string, context: GenerateContext): RewireResponse {
  const goals = (context.goals ?? input).trim();
  const feelings = pickFeelings(goals || input);
  const actions = pickActions(feelings, goals || input);

  if (context.mode === "actions") {
    return { feelings: [], actions, fromApi: false };
  }

  return { feelings, actions, fromApi: false };
}

/** Calls OpenAI via /api/generate; falls back to local mock if unavailable. */
export async function generateRewireResponse(
  input: string,
  context: GenerateContext = {}
): Promise<RewireResponse> {
  const goals = (context.goals ?? input).trim();
  const fromApi = await generateWithApi(goals, context);
  if (fromApi) return fromApi;

  console.warn("[generate] Using offline fallback — API unreachable after retries");
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
