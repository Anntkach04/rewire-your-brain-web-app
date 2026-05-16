import { getSelectedActions } from "./sessionActions";
import type { SessionState } from "../types";

/** Apple Notes / Reminders turn this into a tappable checklist item */
const CHECKBOX = "\u2610";

const EXPORT_TITLE = "\uD83E\uDDE0 Rewired thoughts";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function trimBody(text: string): string {
  return text.trim();
}

function formatFeelings(feelings: string[]): string {
  if (feelings.length === 0) return "";
  return feelings.map((f) => f.trim()).filter(Boolean).join(", ");
}

function quotedPlain(text: string): string {
  const t = trimBody(text);
  if (!t) return '""';
  return `"${t}"`;
}

function quotedHtml(text: string): string {
  const t = trimBody(text);
  if (!t) return "<em>&quot;&quot;</em>";
  return `<em>&quot;${escapeHtml(t)}&quot;</em>`;
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

/** One section: bold-style heading, blank line, quoted body, extra air before next block */
function plainQuotedSection(heading: string, body: string): string[] {
  return [heading, "", quotedPlain(body), "", "", ""];
}

export function buildNotesPlainText(session: SessionState, actions: string[]): string {
  const lines: string[] = [
    formatNotesExportDate(),
    "",
    EXPORT_TITLE,
    "",
    "",
    ...plainQuotedSection("What I want:", session.goals),
    ...plainQuotedSection("Feelings behind it:", formatFeelings(session.selectedFeelings)),
    ...plainQuotedSection("Why I deserve to feel this way:", session.deserveReasons),
    "Actions to feel more this way:",
    "",
  ];

  if (actions.length === 0) {
    lines.push(`${CHECKBOX} `, "");
  } else {
    actions.forEach((a) => {
      lines.push(`${CHECKBOX} ${trimBody(a)}`);
    });
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

const NOTE_BODY_STYLE =
  'margin:0 0 2.25em;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;font-weight:300;line-height:1.65;letter-spacing:-0.02em;color:#202020;';

function htmlQuotedSection(heading: string, body: string): string {
  return `<p style="margin:2em 0 0.65em;font-size:17px;font-weight:600;color:#141414;"><strong>${escapeHtml(heading)}</strong></p>
<p style="${NOTE_BODY_STYLE}">${quotedHtml(body)}</p>`;
}

function htmlChecklistItem(text: string): string {
  return `<p style="margin:0.55em 0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;font-weight:300;line-height:1.65;letter-spacing:-0.02em;color:#202020;">${CHECKBOX} ${escapeHtml(trimBody(text))}</p>`;
}

export function buildNotesHtml(session: SessionState, actions: string[]): string {
  const actionBlock =
    actions.length > 0
      ? actions.map((a) => htmlChecklistItem(a)).join("")
      : htmlChecklistItem("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#202020;line-height:1.5;margin:0;padding:0;">
<p style="font-size:13px;color:#555;margin:0 0 1.5em;">${escapeHtml(formatNotesExportDate())}</p>
<p style="font-size:20px;font-weight:600;margin:0 0 2em;color:#141414;"><strong>${escapeHtml(EXPORT_TITLE)}</strong></p>
${htmlQuotedSection("What I want:", session.goals)}
${htmlQuotedSection("Feelings behind it:", formatFeelings(session.selectedFeelings))}
${htmlQuotedSection("Why I deserve to feel this way:", session.deserveReasons)}
<p style="margin:2em 0 0.65em;font-size:17px;font-weight:600;color:#141414;"><strong>Actions to feel more this way:</strong></p>
<div style="margin:0 0 2.25em;">${actionBlock}</div>
</body></html>`;
}

export async function copyNotesToClipboard(session: SessionState): Promise<boolean> {
  const actions = getSelectedActions(session);
  const plain = buildNotesPlainText(session, actions);
  const html = buildNotesHtml(session, actions);

  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([plain], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
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
