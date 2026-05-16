import { getSelectedActions } from "./sessionActions";
import type { SessionState } from "../types";

const CHECKBOX = "\u2610"; // ☐ — Apple Notes often turns these into tappable checklists

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function quoteForExport(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '""';
  const inner = trimmed.replace(/"/g, "'");
  return `"${inner}"`;
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
  const feelings =
    session.selectedFeelings.length > 0
      ? quoteForExport(session.selectedFeelings.join(", "))
      : '""';

  const lines: string[] = [
    formatNotesExportDate(),
    "",
    "Rewired thoughts",
    "",
    "What I want:",
    quoteForExport(session.goals),
    "",
    "Feelings behind it:",
    feelings,
    "",
    "Why I can already feel this:",
    quoteForExport(session.deserveReasons),
    "",
    "Actions to feel this today:",
  ];

  if (actions.length === 0) {
    lines.push(`${CHECKBOX} `);
  } else {
    actions.forEach((a) => lines.push(`${CHECKBOX} ${a.trim()}`));
  }

  return lines.join("\n");
}

export function buildNotesHtml(session: SessionState, actions: string[]): string {
  const feelingsQuoted =
    session.selectedFeelings.length > 0
      ? quoteForExport(session.selectedFeelings.join(", "))
      : '""';

  const actionItems =
    actions.length > 0
      ? actions
          .map(
            (a) =>
              `<li style="list-style:none;margin:0.35em 0;padding-left:0;">${CHECKBOX} ${escapeHtml(a.trim())}</li>`
          )
          .join("")
      : `<li style="list-style:none;">${CHECKBOX} </li>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Georgia,serif;color:#202020;line-height:1.5;">
<p style="font-size:13px;color:#555;margin:0 0 1em;">${escapeHtml(formatNotesExportDate())}</p>
<h2 style="font-size:20px;font-weight:normal;margin:0 0 1em;">Rewired thoughts</h2>
<h3 style="font-size:16px;font-weight:normal;margin:1.25em 0 0.35em;">What I want:</h3>
<p style="margin:0 0 0.5em;font-style:italic;">${escapeHtml(quoteForExport(session.goals))}</p>
<h3 style="font-size:16px;font-weight:normal;margin:1.25em 0 0.35em;">Feelings behind it:</h3>
<p style="margin:0 0 0.5em;font-style:italic;">${escapeHtml(feelingsQuoted)}</p>
<h3 style="font-size:16px;font-weight:normal;margin:1.25em 0 0.35em;">Why I can already feel this:</h3>
<p style="margin:0 0 0.5em;font-style:italic;">${escapeHtml(quoteForExport(session.deserveReasons))}</p>
<h3 style="font-size:16px;font-weight:normal;margin:1.25em 0 0.35em;">Actions to feel this today:</h3>
<ul style="list-style:none;padding-left:0;margin:0.5em 0 0;">${actionItems}</ul>
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
