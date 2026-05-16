import { ACTIONS_INSTRUCTION } from "./actions-prompt";

/** Focused system prompt for step-4 action suggestions only. */
export const ACTIONS_SYSTEM_PROMPT = `You suggest small daily behaviors for a self-concept app.

${ACTIONS_INSTRUCTION}

Return valid JSON only. No markdown.`;
