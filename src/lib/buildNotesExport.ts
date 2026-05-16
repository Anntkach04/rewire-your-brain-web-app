import { getSelectedActions } from "./sessionActions";
import type { SessionState } from "../types";

/** Ballot box — Apple Notes often turns lines starting with this into a checklist */
const CHECKBOX = "\u2610";
const EXPORT_TITLE = "\uD83E\uDDE0 Rewired thoughts";
const OPEN_QUOTE = "\u201C";
const CLOSE_QUOTE = "\u201D";
const BLOCK_GAP = "\n\n\n";

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

function plainSection(heading: string, body: string): string {
  return `${heading}\n\n${curlyQuoted(body)}`;
}

function htmlSpacer(): string {
  return `<p style="margin:0;padding:0;line-height:18px;font-size:18px;">&nbsp;</p>`;
}

function htmlSection(heading: string, body: string): string {
  return `${htmlSpacer()}<h2 style="font-size:17px;font-weight:bold;margin:0 0 0.5em;color:#000000;">${escapeHtml(heading)}</h2>
<p style="font-size:17px;font-weight:normal;margin:0 0 0.25em;line-height:1.5;color:#000000;">${curlyQuotedItalicHtml(body)}</p>`;
}

function htmlChecklistItem(text: string): string {
  return `<p style="font-size:17px;margin:0.85em 0 0;line-height:1.5;color:#000000;">${CHECKBOX}&nbsp;${escapeHtml(trimBody(text))}</p>`;
}

export function buildNotesPlainText(session: SessionState, actions: string[]): string {
  const blocks: string[] = [
    formatNotesExportDate(),
    "",
    EXPORT_TITLE,
    "",
    plainSection("What I want:", session.goals),
    plainSection("Feelings behind it:", formatFeelings(session.selectedFeelings)),
    plainSection("Why I deserve to feel this way:", session.deserveReasons),
    "Actions to feel more this way:",
    "",
  ];

  if (actions.length === 0) {
    blocks.push(`${CHECKBOX} `);
  } else {
    actions.forEach((a, i) => {
      if (i > 0) blocks.push("");
      blocks.push(`${CHECKBOX} ${trimBody(a)}`);
    });
  }

  return blocks.join(BLOCK_GAP).trimEnd() + "\n";
}

export function buildNotesHtml(session: SessionState, actions: string[]): string {
  const actionItems =
    actions.length > 0
      ? `${htmlSpacer()}${actions.map((a) => htmlChecklistItem(a)).join("")}`
      : htmlChecklistItem("");

  const body = [
    `<p style="font-size:13px;color:#8E8E93;margin:0 0 0.25em;">${escapeHtml(formatNotesExportDate())}</p>`,
    htmlSpacer(),
    `<h1 style="font-size:28px;font-weight:bold;margin:0;line-height:1.2;color:#000000;">${escapeHtml(EXPORT_TITLE)}</h1>`,
    htmlSection("What I want:", session.goals),
    htmlSection("Feelings behind it:", formatFeelings(session.selectedFeelings)),
    htmlSection("Why I deserve to feel this way:", session.deserveReasons),
    `${htmlSpacer()}<h2 style="font-size:17px;font-weight:bold;margin:0 0 0.5em;color:#000000;">Actions to feel more this way:</h2>`,
    actionItems,
  ].join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="Generator" content="Rewire Your Brain">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,sans-serif;color:#000000;margin:0;padding:0;">
${body}
</body>
</html>`;
}

function extractBodyHtml(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1] : html;
}

/** CF_HTML wrapper — improves paste into Apple Notes on iOS/macOS */
function wrapCfHtml(html: string): string {
  const inner = extractBodyHtml(html);
  const start = "<!--StartFragment-->";
  const end = "<!--EndFragment-->";
  const fragment = start + inner + end;
  const full = `<!DOCTYPE html><html><body>${fragment}</body></html>`;
  const startHtml = full.indexOf(start);
  const endHtml = full.indexOf(end) + end.length;
  const pad = (n: number) => String(n).padStart(10, "0");
  const header =
    "Version:0.9\r\n" +
    `StartHTML:${pad(0)}\r\n` +
    `EndHTML:${pad(full.length)}\r\n` +
    `StartFragment:${pad(startHtml)}\r\n` +
    `EndFragment:${pad(endHtml)}\r\n`;
  return header + full;
}

function copyViaHiddenElement(html: string): boolean {
  if (typeof document === "undefined") return false;

  const host = document.createElement("div");
  host.contentEditable = "true";
  host.innerHTML = extractBodyHtml(html);
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;";

  document.body.appendChild(host);

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(host);
  selection?.removeAllRanges();
  selection?.addRange(range);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  selection?.removeAllRanges();
  document.body.removeChild(host);
  return ok;
}

export async function copyNotesToClipboard(session: SessionState): Promise<boolean> {
  const actions = getSelectedActions(session);
  const plain = buildNotesPlainText(session, actions);
  const html = buildNotesHtml(session, actions);
  const cfHtml = wrapCfHtml(html);

  // iOS Safari pastes rich text more reliably from a selected DOM node
  if (copyViaHiddenElement(html)) {
    return true;
  }

  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([cfHtml], { type: "text/html" }),
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
