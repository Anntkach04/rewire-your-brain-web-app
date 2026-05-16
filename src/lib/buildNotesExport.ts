import { getSelectedActions } from "./sessionActions";
import type { SessionState } from "../types";

const BULLET = "\u2022";
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

/** Italic text in curly quotes — Apple Notes respects <em> from clipboard HTML */
function quotedItalicHtml(text: string): string {
  const t = trimBody(text);
  const inner = t ? escapeHtml(t) : "";
  return `<em style="font-style:italic;font-family:Georgia,'Times New Roman',serif;">${OPEN_QUOTE}${inner}${CLOSE_QUOTE}</em>`;
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

export function buildNotesPlainText(session: SessionState, actions: string[]): string {
  const lines = [
    formatNotesExportDate(),
    "",
    EXPORT_TITLE,
    "",
    "What I want:",
    curlyQuoted(session.goals),
    "",
    "Feelings behind it:",
    curlyQuoted(formatFeelings(session.selectedFeelings)),
    "",
    "Why I deserve to feel this way:",
    curlyQuoted(session.deserveReasons),
    "",
    "Actions to feel more this way:",
    "",
  ];

  if (actions.length === 0) {
    lines.push(`${BULLET} `);
  } else {
    actions.forEach((a) => lines.push(`${BULLET} ${trimBody(a)}`));
  }

  return lines.join("\n").trimEnd() + "\n";
}

const HEADING_STYLE =
  "margin:14px 0 4px 0;font-size:17px;font-weight:bold;font-family:-apple-system,Helvetica,sans-serif;color:#000000;";
const BODY_STYLE =
  "margin:0 0 10px 0;font-size:17px;line-height:1.45;font-family:-apple-system,Helvetica,sans-serif;color:#000000;";

function htmlSection(heading: string, body: string): string {
  return `<p style="${HEADING_STYLE}">${escapeHtml(heading)}</p>
<p style="${BODY_STYLE}">${quotedItalicHtml(body)}</p>`;
}

function htmlBulletLine(text: string): string {
  return `<p style="margin:0 0 6px 0;font-size:17px;line-height:1.45;font-family:-apple-system,Helvetica,sans-serif;color:#000000;">${BULLET}&nbsp;${escapeHtml(trimBody(text))}</p>`;
}

export function buildNotesHtml(session: SessionState, actions: string[]): string {
  const actionBlock =
    actions.length > 0
      ? actions.map((a) => htmlBulletLine(a)).join("")
      : htmlBulletLine("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,Helvetica,sans-serif;color:#000000;">
<p style="font-size:13px;color:#8E8E93;margin:0 0 12px 0;">${escapeHtml(formatNotesExportDate())}</p>
<p style="font-size:22px;font-weight:bold;margin:0 0 14px 0;">${escapeHtml(EXPORT_TITLE)}</p>
${htmlSection("What I want:", session.goals)}
${htmlSection("Feelings behind it:", formatFeelings(session.selectedFeelings))}
${htmlSection("Why I deserve to feel this way:", session.deserveReasons)}
<p style="${HEADING_STYLE}">Actions to feel more this way:</p>
${actionBlock}
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
    // fall through
  }

  try {
    await navigator.clipboard.writeText(plain);
    return true;
  } catch {
    return false;
  }
}
