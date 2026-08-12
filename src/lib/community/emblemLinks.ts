export const EXTERNAL_EMBLEM_EDITOR_URL =
  "https://505e06b2.github.io/Black-Ops-2-Emblem-Editor";

export function emblemEditorLoadUrl(code: string): string {
  return `${EXTERNAL_EMBLEM_EDITOR_URL}/?load=${encodeURIComponent(code.trim())}`;
}
