import { getSelectedActions } from "./sessionActions";
import type { SessionState } from "../types";

/** Apple Notes / Reminders turn this into a tappable checklist item */
const CHECKBOX = "\u2610";

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

function formatFeelingsHtml(feelings: string[]): string {
  const items = feelings.map((f) => f.trim()).filter(Boolean);
  if (items.length === 0) return "&nbsp;";
  return items.map((f) => `<em>${escapeHtml(f)}</em>`).join(", ");
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

/** One section: heading, blank line, body, extra air before next block */
function plainSection(heading: string, body: string): string[] {
  const content = trimBody(body);
  return [heading, "", content, "", "", ""];
}

export function buildNotesPlainText(session: SessionState, actions: string[]): string {
  const lines: string[] = [
    formatNotesExportDate(),
    "",
    "Rewired thoughts",
    "",
    "",
    ...plainSection("What I want:", session.goals),
    ...plainSection("Feelings behind it:", formatFeelings(session.selectedFeelings)),
    ...plainSection("Why I can already feel this:", session.deserveReasons),
    "Actions to feel this today:",
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

const NOTE_REASON_STYLE =
  'margin:0 0 2.25em;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:14px;font-weight:300;line-height:1.65;letter-spacing:-0.02em;color:#202020;';

function htmlSection(
  heading: string,
  bodyHtml: string,
  paragraphStyle = NOTE_BODY_STYLE,
): string {
  return `<h3 style="font-size:17px;font-weight:600;margin:2em 0 0.65em;color:#141414;">${escapeHtml(heading)}</h3>
<p style="${paragraphStyle}">${bodyHtml}</p>`;
}

function htmlChecklistItem(text: string): string {
  return `<p style="margin:0.55em 0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;font-weight:300;line-height:1.65;letter-spacing:-0.02em;color:#202020;">${CHECKBOX} ${escapeHtml(trimBody(text))}</p>`;
}

export function buildNotesHtml(session: SessionState, actions: string[]): string {
  const actionBlock =
    actions.length > 0
      ? actions.map((a) => htmlChecklistItem(a)).join("")
      : htmlChecklistItem("");

  const goalsHtml = escapeHtml(trimBody(session.goals)) || "&nbsp;";
  const feelingsHtml = formatFeelingsHtml(session.selectedFeelings);
  const reasonsHtml = escapeHtml(trimBody(session.deserveReasons)) || "&nbsp;";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#202020;line-height:1.5;margin:0;padding:0;">
<p style="font-size:13px;color:#555;margin:0 0 1.5em;">${escapeHtml(formatNotesExportDate())}</p>
<h2 style="font-size:20px;font-weight:600;margin:0 0 2em;color:#141414;">Rewired thoughts</h2>
${htmlSection("What I want:", goalsHtml)}
${htmlSection("Feelings behind it:", feelingsHtml)}
${htmlSection("Why I can already feel this:", reasonsHtml, NOTE_REASON_STYLE)}
<h3 style="font-size:17px;font-weight:600;margin:2em 0 0.65em;color:#141414;">Actions to feel this today:</h3>
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
