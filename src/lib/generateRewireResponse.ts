import { GOAL_ACTION_PATTERNS, sanitizeActions } from "../../lib/sanitize-actions";
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
  for (const [pattern, action] of GOAL_ACTION_PATTERNS) {
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
        actions: sanitizeActions(data.actions, {
          goals,
          feelings: context.selectedFeelings,
        }),
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
  const goals = (context.goals ?? input).trim();
  const feelings = pickFeelings(goals || input);
  const actions = pickActions(feelings, goals || input);

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
