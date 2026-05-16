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

function quotedItalicHtml(text: string): string {
  const t = trimBody(text);
  const inner = t ? escapeHtml(t) : "";
  return `<em style="font-style:italic;">${OPEN_QUOTE}${inner}${CLOSE_QUOTE}</em>`;
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

/**
 * Export layout (each block separated by one blank line):
 * date → title → [subheading → body italic]×n → actions subheading → bullets
 */
export function buildNotesPlainText(session: SessionState, actions: string[]): string {
  const sections: string[] = [
    formatNotesExportDate(),
    "",
    EXPORT_TITLE,
    "",
    "What I want:",
    "",
    curlyQuoted(session.goals),
    "",
    "Feelings behind it:",
    "",
    curlyQuoted(formatFeelings(session.selectedFeelings)),
    "",
    "Why I deserve to feel this way:",
    "",
    curlyQuoted(session.deserveReasons),
    "",
    "Actions to feel more this way:",
    "",
  ];

  if (actions.length === 0) {
    sections.push(`${BULLET} `);
  } else {
    actions.forEach((a, i) => {
      sections.push(`${BULLET} ${trimBody(a)}`);
      if (i < actions.length - 1) sections.push("");
    });
  }

  return sections.join("\n").trimEnd() + "\n";
}

const DATE_STYLE =
  "margin:0 0 16px 0;font-size:13px;font-weight:normal;color:#8E8E93;font-family:-apple-system,Helvetica,sans-serif;";
const TITLE_STYLE =
  "margin:0 0 16px 0;font-size:22px;font-weight:bold;color:#000000;font-family:-apple-system,Helvetica,sans-serif;";
const SUBHEAD_STYLE =
  "margin:0 0 16px 0;font-size:17px;font-weight:bold;color:#000000;font-family:-apple-system,Helvetica,sans-serif;";
const BODY_STYLE =
  "margin:0 0 16px 0;font-size:17px;font-weight:normal;line-height:1.4;color:#000000;font-family:-apple-system,Helvetica,sans-serif;";
const BULLET_STYLE =
  "margin:0 0 8px 0;font-size:17px;font-weight:normal;line-height:1.4;color:#000000;font-family:-apple-system,Helvetica,sans-serif;";

function htmlSubsection(heading: string, body: string): string {
  return `<p style="${SUBHEAD_STYLE}">${escapeHtml(heading)}</p>
<p style="${BODY_STYLE}">${quotedItalicHtml(body)}</p>`;
}

function htmlBulletLine(text: string): string {
  return `<p style="${BULLET_STYLE}">${BULLET}&nbsp;${escapeHtml(trimBody(text))}</p>`;
}

export function buildNotesHtml(session: SessionState, actions: string[]): string {
  const bullets =
    actions.length > 0
      ? actions.map((a) => htmlBulletLine(a)).join("")
      : htmlBulletLine("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;">
<p style="${DATE_STYLE}">${escapeHtml(formatNotesExportDate())}</p>
<p style="${TITLE_STYLE}">${escapeHtml(EXPORT_TITLE)}</p>
${htmlSubsection("What I want:", session.goals)}
${htmlSubsection("Feelings behind it:", formatFeelings(session.selectedFeelings))}
${htmlSubsection("Why I deserve to feel this way:", session.deserveReasons)}
<p style="${SUBHEAD_STYLE}">Actions to feel more this way:</p>
${bullets}
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
