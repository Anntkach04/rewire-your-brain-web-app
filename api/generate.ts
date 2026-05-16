import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateWithOpenAI, type GenerateRequest } from "../server/ai/generate";

export const config = {
  maxDuration: 30,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as GenerateRequest;
    if (!body?.goals?.trim()) {
      return res.status(400).json({ error: "goals is required" });
    }

    const mode = body.mode === "actions" ? "actions" : "full";
    const result = await generateWithOpenAI({
      mode,
      goals: body.goals,
      selectedFeelings: body.selectedFeelings,
      deserveReasons: body.deserveReasons,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("[api/generate]", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
}
