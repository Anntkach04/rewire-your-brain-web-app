const SYSTEM_PROMPT = `You are the emotional reflection engine behind a self-concept transformation app inspired by the book "Beyond Belief".

Your purpose is to help users uncover hidden beliefs, emotional patterns, identity contradictions, and quiet truths about themselves through subtle emotional prompts and small psychological actions.

Based on user input, generate emotionally intelligent content.

Tone: introspective, honest, emotionally cinematic, calm, never generic motivation, never productivity-focused, never "girlboss".

Avoid: affirmations, manifestation language, productivity advice, "you got this".

Actions should feel like subtle psychological prompts (e.g. notice what drains energy, write the same question three times until the real answer shows up).

Always respond with valid JSON only, no markdown.`;

const FULL_SCHEMA = `{"realization":"one short emotional realization","feelings":["3 to 5 short feeling labels, 1-2 words, lowercase"],"tasks":["2 to 4 suggested actions"]}`;
const ACTIONS_SCHEMA = `{"tasks":["2 to 4 suggested actions"]}`;

export type GenerateRequest = {
  mode?: "full" | "actions";
  goals?: string;
  selectedFeelings?: string[];
  deserveReasons?: string;
};

type OpenAIJson = {
  realization?: string;
  feeling?: string;
  feelings?: string[];
  tasks?: string[];
};

function normalizeList(items: unknown, max: number, fallback: string[]): string[] {
  if (!Array.isArray(items)) return fallback.slice(0, max);
  const cleaned = items
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
  if (cleaned.length === 0) return fallback.slice(0, max);
  return cleaned.slice(0, max);
}

function parseResult(raw: string, mode: "full" | "actions") {
  const parsed = JSON.parse(raw) as OpenAIJson;
  const realization =
    typeof parsed.realization === "string"
      ? parsed.realization.trim()
      : typeof parsed.feeling === "string"
        ? parsed.feeling.trim()
        : undefined;

  const feelings =
    mode === "actions"
      ? []
      : normalizeList(parsed.feelings, 5, ["clarity", "self-trust", "calm"]).map((f) => {
          const words = f.split(/\s+/).filter(Boolean);
          return words.length <= 3 ? f : words.slice(0, 2).join(" ");
        });

  const actions = normalizeList(parsed.tasks, 4, [
    "Write the same question three times until the real answer shows up",
    "Keep one promise to yourself before noon, no matter how small",
  ]);

  return { feelings, actions, realization };
}

function buildUserMessage(body: GenerateRequest, mode: "full" | "actions"): string {
  const parts = [`User goal:\n${(body.goals ?? "").trim()}`];
  if (body.selectedFeelings?.length) {
    parts.push(`Feelings they chose:\n${body.selectedFeelings.join(", ")}`);
  }
  if (body.deserveReasons?.trim()) {
    parts.push(`Why they can already feel this way:\n${body.deserveReasons.trim()}`);
  }
  parts.push(
    mode === "actions"
      ? `\nGenerate only new actions.\nOutput JSON:\n${ACTIONS_SCHEMA}`
      : `\nGenerate realization, feeling chips, and tasks.\nOutput JSON:\n${FULL_SCHEMA}`,
  );
  return parts.join("\n\n");
}

/** Shared handler for /api/generate (Vercel middleware + optional api route). */
export async function handleGenerateRequest(request: Request): Promise<Response> {
  if (request.method === "GET") {
    return Response.json({
      ok: true,
      message: "Rewire API is live. Send POST with { mode, goals }.",
    });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  try {
    const body = (await request.json()) as GenerateRequest;
    if (!body?.goals?.trim()) {
      return Response.json({ error: "goals is required" }, { status: 400 });
    }

    const mode = body.mode === "actions" ? "actions" : "full";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
          { role: "user", content: buildUserMessage(body, mode) },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return Response.json(
        { error: `OpenAI error ${openaiRes.status}`, detail: errText.slice(0, 200) },
        { status: 502 },
      );
    }

    const data = (await openaiRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return Response.json({ error: "Empty OpenAI response" }, { status: 502 });
    }

    const result = parseResult(content, mode);
    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[rewire-generate]", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 },
    );
  }
}
