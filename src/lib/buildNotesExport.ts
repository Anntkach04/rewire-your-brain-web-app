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

/** One section: heading, blank line, body, two blank lines after */
function plainSection(heading: string, body: string): string[] {
  const content = trimBody(body);
  return [heading, "", content, "", ""];
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

function htmlSection(heading: string, body: string): string {
  const content = escapeHtml(trimBody(body));
  return `<h3 style="font-size:17px;font-weight:600;margin:1.75em 0 0.5em;color:#141414;">${escapeHtml(heading)}</h3>
<p style="margin:0 0 1.75em;font-size:16px;line-height:1.5;">${content || "&nbsp;"}</p>`;
}

function htmlChecklistItem(text: string): string {
  return `<p style="margin:0.4em 0;font-size:16px;line-height:1.45;">${CHECKBOX} ${escapeHtml(trimBody(text))}</p>`;
}

export function buildNotesHtml(session: SessionState, actions: string[]): string {
  const feelingsBody = formatFeelings(session.selectedFeelings);
  const actionBlock =
    actions.length > 0
      ? actions.map((a) => htmlChecklistItem(a)).join("")
      : htmlChecklistItem("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Georgia,'Times New Roman',serif;color:#202020;line-height:1.5;margin:0;padding:0;">
<p style="font-size:13px;color:#555;margin:0 0 1.25em;">${escapeHtml(formatNotesExportDate())}</p>
<h2 style="font-size:20px;font-weight:600;margin:0 0 1.5em;color:#141414;">Rewired thoughts</h2>
${htmlSection("What I want:", session.goals)}
${htmlSection("Feelings behind it:", feelingsBody)}
${htmlSection("Why I can already feel this:", session.deserveReasons)}
<h3 style="font-size:17px;font-weight:600;margin:1.75em 0 0.5em;color:#141414;">Actions to feel this today:</h3>
<div style="margin:0 0 1.75em;">${actionBlock}</div>
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
