import { getSelectedActions } from "./sessionActions";
import type { SessionState } from "../types";

const CHECKBOX_EMPTY = "\u2610";
const EXPORT_TITLE = "\uD83E\uDDE0 Rewired thoughts";
const OPEN_QUOTE = "\u201C";
const CLOSE_QUOTE = "\u201D";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function trimBody(text: string): string {
  return text.trim();
}

function formatFeelings(feelings: string[]): string {
  if (feelings.length === 0) return "";
  return feelings.map((f) => f.trim()).filter(Boolean).join(", ");
}

function curlyQuoted(text: string): string {
  const t = trimBody(text);
  if (!t) return `${OPEN_QUOTE}${CLOSE_QUOTE}`;
  return `${OPEN_QUOTE}${t}${CLOSE_QUOTE}`;
}

function curlyQuotedItalicHtml(text: string): string {
  const t = trimBody(text);
  if (!t) {
    return `<i>${OPEN_QUOTE}${CLOSE_QUOTE}</i>`;
  }
  return `<i>${OPEN_QUOTE}${escapeHtml(t)}${CLOSE_QUOTE}</i>`;
}

export function formatNotesExportDate(date = new Date()): string {
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day} at ${time}`;
}

function plainQuotedSection(heading: string, body: string): string[] {
  return [heading, curlyQuoted(body), "", ""];
}

export function buildNotesPlainText(session: SessionState, actions: string[]): string {
  const lines: string[] = [
    formatNotesExportDate(),
    "",
    EXPORT_TITLE,
    "",
    ...plainQuotedSection("What I want:", session.goals),
    ...plainQuotedSection("Feelings behind it:", formatFeelings(session.selectedFeelings)),
    ...plainQuotedSection("Why I deserve to feel this way:", session.deserveReasons),
    "Actions to feel more this way:",
    "",
  ];

  if (actions.length === 0) {
    lines.push(`${CHECKBOX_EMPTY} `);
  } else {
    actions.forEach((a) => {
      lines.push(`${CHECKBOX_EMPTY} ${trimBody(a)}`);
    });
  }

  return lines.join("\n").trimEnd() + "\n";
}

function htmlSection(heading: string, body: string): string {
  return `<h2 style="font-size:17px;font-weight:bold;margin:1.25em 0 0.35em;color:#000000;">${escapeHtml(heading)}</h2>
<p style="font-size:17px;font-weight:normal;margin:0 0 0.75em;color:#000000;">${curlyQuotedItalicHtml(body)}</p>`;
}

function htmlChecklistItem(text: string): string {
  return `<li style="font-size:17px;margin:0.35em 0;list-style-type:none;">${CHECKBOX_EMPTY} ${escapeHtml(trimBody(text))}</li>`;
}

export function buildNotesHtml(session: SessionState, actions: string[]): string {
  const actionItems =
    actions.length > 0
      ? actions.map((a) => htmlChecklistItem(a)).join("")
      : htmlChecklistItem("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="Generator" content="Rewire Your Brain">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,sans-serif;color:#000000;margin:0;padding:0;">
<p style="font-size:13px;color:#8E8E93;margin:0 0 1em;">${escapeHtml(formatNotesExportDate())}</p>
<h1 style="font-size:28px;font-weight:bold;margin:0 0 0.5em;color:#000000;">${escapeHtml(EXPORT_TITLE)}</h1>
${htmlSection("What I want:", session.goals)}
${htmlSection("Feelings behind it:", formatFeelings(session.selectedFeelings))}
${htmlSection("Why I deserve to feel this way:", session.deserveReasons)}
<h2 style="font-size:17px;font-weight:bold;margin:1.25em 0 0.35em;color:#000000;">Actions to feel more this way:</h2>
<ul style="margin:0 0 1em;padding:0;list-style-type:none;">${actionItems}</ul>
</body>
</html>`;
}

export async function copyNotesToClipboard(session: SessionState): Promise<boolean> {
  const actions = getSelectedActions(session);
  const plain = buildNotesPlainText(session, actions);
  const html = buildNotesHtml(session, actions);

  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
      return true;
    }
  } catch {
    // Rich clipboard blocked — fall back to plain text
  }

  try {
    await navigator.clipboard.writeText(plain);
    return true;
  } catch {
    return false;
  }
}
