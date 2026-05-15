import type { RewireResponse } from "../types";

/**
 * Mock "AI" that maps a user's free-form goal text into the emotional layer
 * the app is built around. Architected to be replaced later by an OpenAI call
 * or an n8n webhook — keep the input/output shape stable.
 *
 * Replace the body with `await fetch(...)` when wiring a backend; the rest of
 * the app only depends on the returned `RewireResponse` shape.
 */

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
    "Make a tiny plan for something that excites you",
    "Spend 20 minutes building your future instead of consuming content",
  ],
  confidence: [
    "Wear the outfit that makes you feel a little powerful",
    "Finish one small thing you've been avoiding",
    "Speak slower today, especially when you're unsure",
    "Save one piece of proof that you're improving",
  ],
  peace: [
    "Put your phone in another room for 30 minutes",
    "Drink your next drink slowly, without doing anything else",
    "Write down one thing that doesn't need to be solved today",
    "Let one thing be enough exactly as it is",
  ],
  excitement: [
    "Write the first sentence of a future you want",
    "Send the message you've been overthinking",
    "Listen to a song that makes you feel like the main character",
    "Plan one small thing for a day that hasn't happened yet",
  ],
  security: [
    "Make your bed slowly and notice how the room feels after",
    "Check one boring practical thing off your list",
    "Eat a meal sitting down, without screens",
    "Text someone who feels like home, even just hi",
  ],
  love: [
    "Tell someone something kind that you usually only think",
    "Notice one moment today where you were already loved",
    "Touch your own face gently when you wash it tonight",
    "Reread a message that made you feel chosen",
  ],
  belonging: [
    "Reach out first to one person who actually matters",
    "Sit somewhere semi-public and just exist for 15 minutes",
    "Share something small you usually keep to yourself",
    "Reply to the message you've been leaving on read",
  ],
  calm: [
    "Put your phone away for 30 minutes",
    "Clean one small corner of your space",
    "Listen to music without multitasking",
    "Write down what actually matters today",
  ],
  validation: [
    "Acknowledge one thing you did that nobody saw",
    "Re-read a recent compliment slowly",
    "Write one sentence you wish someone would say to you — then say it",
    "Catch yourself doing something well, out loud",
  ],
  clarity: [
    "Write the same question three times until the real answer shows up",
    "Close five tabs you've been keeping open just in case",
    "Decide one tiny thing you've been postponing",
    "Spend 10 minutes alone with no input — no music, no scroll",
  ],
  stability: [
    "Do one thing today the same way you did yesterday on purpose",
    "Eat a real meal at a real time",
    "Move your body for 10 minutes, gently",
    "Pick one anchor for tomorrow and write it down",
  ],
  joy: [
    "Do something on purpose that has no outcome",
    "Watch something that used to make you laugh as a kid",
    "Move your body in a way that isn't exercise",
    "Notice one beautiful thing on your way somewhere",
  ],
  creativity: [
    "Make something ugly on purpose for 10 minutes",
    "Collect three things today that catch your eye",
    "Write one sentence that nobody will ever read",
    "Rearrange one small surface in your space",
  ],
  "self-trust": [
    "Keep one promise to yourself before noon, no matter how small",
    "Don't ask for an opinion on something you already know",
    "Write down one thing your past self was right about",
    "Do the thing you'd respect yourself for, not the easy one",
  ],
  softness: [
    "Speak to yourself the way you'd speak to a tired friend",
    "Wear the most comfortable thing you own for an hour",
    "Let yourself not respond immediately",
    "Touch something warm — tea, sun, blanket — and notice it",
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
  // Keep a soft cap so tags don't overflow
  return Array.from(found).slice(0, 6);
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

  if (picked.length < 2 && feelings[0]) {
    for (const a of ACTIONS[feelings[0]]) {
      if (picked.length === 2) break;
      if (!used.has(a)) {
        picked.push(a);
        used.add(a);
      }
    }
  }

  while (picked.length < 2) {
    picked.push("Notice one small thing today that already feels like what you want");
  }

  return picked.slice(0, 2);
}

export async function generateRewireResponse(input: string): Promise<RewireResponse> {
  // Simulate a gentle "thinking" delay so the brain-activation moment lands.
  await new Promise((r) => setTimeout(r, 1100));

  const feelings = pickFeelings(input);
  const actions = pickActions(feelings);

  return {
    feelings,
    actions,
  };
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
