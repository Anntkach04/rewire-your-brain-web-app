import { ACTIONS_OUTPUT_SCHEMA, FULL_OUTPUT_SCHEMA, SYSTEM_PROMPT } from "./prompt";

export type GenerateMode = "full" | "actions";

export type GenerateRequest = {
  mode: GenerateMode;
  goals: string;
  selectedFeelings?: string[];
  deserveReasons?: string;
};

export type GenerateResult = {
  feelings: string[];
  actions: string[];
  realization?: string;
};

type OpenAIJson = {
  realization?: string;
  feeling?: string;
  feelings?: string[];
  tasks?: string[];
};

function buildUserMessage(body: GenerateRequest): string {
  const parts = [`User goal:\n${body.goals.trim()}`];

  if (body.selectedFeelings?.length) {
    parts.push(`Feelings they chose:\n${body.selectedFeelings.join(", ")}`);
  }
  if (body.deserveReasons?.trim()) {
    parts.push(`Why they can already feel this way:\n${body.deserveReasons.trim()}`);
  }

  if (body.mode === "actions") {
    parts.push(
      "\nGenerate only new actions (tasks) aligned with their goal and chosen feelings.",
      `Output JSON:\n${ACTIONS_OUTPUT_SCHEMA}`
    );
  } else {
    parts.push(
      "\nGenerate a realization, feeling chip labels, and initial tasks.",
      `Output JSON:\n${FULL_OUTPUT_SCHEMA}`
    );
  }

  return parts.join("\n\n");
}

function normalizeList(items: unknown, min: number, max: number, fallback: string[]): string[] {
  if (!Array.isArray(items)) return fallback.slice(0, max);
  const cleaned = items
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length > 0);
  if (cleaned.length === 0) return fallback.slice(0, max);
  if (cleaned.length >= min) return cleaned.slice(0, max);
  return [...cleaned, ...fallback].slice(0, max);
}

function parseOpenAIContent(raw: string, mode: GenerateMode): GenerateResult {
  const parsed = JSON.parse(raw) as OpenAIJson;

  const realization =
    typeof parsed.realization === "string"
      ? parsed.realization.trim()
      : typeof parsed.feeling === "string"
        ? parsed.feeling.trim()
        : undefined;

  const feelingsFromTags = normalizeList(parsed.feelings, 3, 5, [
    "clarity",
    "self-trust",
    "calm",
  ]);

  const feelings =
    mode === "actions"
      ? []
      : feelingsFromTags
          .map((f) => {
            const words = f.split(/\s+/).filter(Boolean);
            if (words.length <= 3) return f;
            return words.slice(0, 2).join(" ");
          })
          .slice(0, 5);

  const actions = normalizeList(parsed.tasks, 2, 4, [
    "Write the same question three times until the real answer shows up",
    "Keep one promise to yourself before noon, no matter how small",
  ]);

  return {
    feelings: mode === "actions" ? [] : feelings,
    actions,
    realization,
  };
}

export async function generateWithOpenAI(body: GenerateRequest): Promise<GenerateResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.85,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(body) },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI response");

  return parseOpenAIContent(content, body.mode);
}
