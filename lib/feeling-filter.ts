/** Feelings the user WANTS to feel — never current pain or struggle. */
export const DESIRED_FEELINGS_INSTRUCTION = `For "feelings" chips: suggest only emotional states the user WANTS to feel once their goal is real — desired states, not what they feel now.

NEVER suggest negative, painful, problem-focused, or lack-based labels.
FORBIDDEN: anxiety, doubt, fear, shame, guilt, sadness, stress, worry, overwhelm, insecurity, loneliness, grief, anger, longing, inadequacy, numbness, exhaustion, jealousy, despair, frustration, self-doubt, unworthiness.
GOOD: peace, confidence, freedom, security, love, excitement, calm, clarity, joy, self-trust, belonging, ease, worthiness, aliveness, safety, openness, groundedness.`;

const BLOCKED_FEELING =
  /\b(anxiety|anxious|doubt|doubts|fear|fears|afraid|worry|worried|stress|stressed|shame|ashamed|guilt|guilty|sadness|sad|grief|grieving|anger|angry|loneliness|lonely|longing|insecurity|insecure|overwhelm|overwhelmed|panic|dread|despair|hopeless|hopelessness|inadequacy|inadequate|numbness|numb|exhaustion|exhausted|jealousy|jealous|envy|envious|bitterness|bitter|resentment|resentful|frustration|frustrated|depression|depressed|misery|miserable|unworthy|unworthiness|self-hatred|hatred|hate|self-doubt)\b/i;

const DEFAULT_DESIRED = [
  "clarity",
  "self-trust",
  "calm",
  "confidence",
  "peace",
  "security",
  "freedom",
];

export function filterDesiredFeelings(feelings: string[], min = 3, max = 5): string[] {
  const cleaned = feelings
    .map((f) => f.trim().toLowerCase())
    .filter((f) => f.length > 0 && !BLOCKED_FEELING.test(f));

  const unique: string[] = [];
  for (const f of cleaned) {
    if (!unique.includes(f)) unique.push(f);
  }

  for (const fallback of DEFAULT_DESIRED) {
    if (unique.length >= min) break;
    if (!unique.includes(fallback)) unique.push(fallback);
  }

  return unique.slice(0, max);
}
