const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(raw: string): boolean {
  return USERNAME_RE.test(normalizeUsername(raw));
}

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "loadout";
}

export function uniqueSlug(title: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slugifyTitle(title)}-${suffix}`;
}
