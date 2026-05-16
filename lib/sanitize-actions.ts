const ABSTRACT_PATTERNS = [
  /\breflect\b/i,
  /\breflection\b/i,
  /\bvisuali[sz]e\b/i,
  /\bimagine\b/i,
  /\bconsider what\b/i,
  /\bjot down\b/i,
  /\bwrite down (any|your) emotions\b/i,
  /\bfuture self\b/i,
  /\bsit in silence\b/i,
  /\bnotice (any )?patterns\b/i,
  /\bengage with your (current )?followers\b/i,
  /\bwhat (they|it) (means|mean) to you\b/i,
  /\bemotions that arise\b/i,
  /\bauthentic self\b/i,
  /\bvalues you want to share\b/i,
];

export const GOAL_ACTION_PATTERNS: Array<[RegExp, string]> = [
  [/\b(instagram|insta|reels?|tiktok|youtube|followers?|influencer|content creator)\b/i, "Post one video on Instagram"],
  [/\b(10k steps|steps|walk|run|fitness|gym|exercise|workout)\b/i, "Get 10k steps today"],
  [/\b(water|hydrat|2\.?5\s*l)\b/i, "Drink 2.5L water today"],
  [/\b(launch|startup|business|clients?|customers?)\b/i, "Send one message that moves your business forward"],
  [/\b(book|write|novel|chapter|essay)\b/i, "Write 200 words on your project today"],
  [/\b(money|income|sales|revenue)\b/i, "Do one revenue-related task you've been avoiding"],
];

const GENERIC_FALLBACKS = [
  "Do the next obvious small step on your goal",
  "Keep one promise to yourself before noon, no matter how small",
  "Put your phone away for 30 minutes",
  "Finish one small thing you've been avoiding",
];

export function isAbstractAction(text: string): boolean {
  const t = text.trim();
  if (t.length > 100) return true;
  return ABSTRACT_PATTERNS.some((p) => p.test(t));
}

export function goalBasedActions(goals: string, max = 2): string[] {
  const picked: string[] = [];
  const lower = goals.toLowerCase();
  for (const [pattern, action] of GOAL_ACTION_PATTERNS) {
    if (pattern.test(lower) && !picked.includes(action)) {
      picked.push(action);
    }
    if (picked.length >= max) break;
  }
  return picked;
}

export function sanitizeActions(
  raw: string[],
  context: { goals: string; feelings?: string[] },
  max = 2,
): string[] {
  const goals = context.goals.trim();
  const pool = [...goalBasedActions(goals, max), ...GENERIC_FALLBACKS];
  const out: string[] = [];
  const used = new Set<string>();

  for (const action of raw) {
    const trimmed = action.trim();
    if (!trimmed || isAbstractAction(trimmed) || used.has(trimmed)) continue;
    out.push(trimmed);
    used.add(trimmed);
    if (out.length >= max) return out;
  }

  for (const fallback of pool) {
    if (out.length >= max) break;
    if (!used.has(fallback)) {
      out.push(fallback);
      used.add(fallback);
    }
  }

  return out.slice(0, max);
}
