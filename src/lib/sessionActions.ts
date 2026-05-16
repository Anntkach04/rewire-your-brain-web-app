import type { SessionState } from "../types";

export function getAllActions(session: Pick<SessionState, "actions" | "customActions">): string[] {
  return [...session.actions, ...session.customActions];
}

/** Actions the user checked on step 4 */
export function getSelectedActions(
  session: Pick<SessionState, "actions" | "customActions" | "completedActions">
): string[] {
  const all = getAllActions(session);
  return session.completedActions
    .filter((i) => i >= 0 && i < all.length)
    .map((i) => all[i]);
}
