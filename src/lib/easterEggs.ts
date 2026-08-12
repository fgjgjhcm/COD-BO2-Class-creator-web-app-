export type EasterEggId =
  | "dsr_fire"
  | "share_class"
  | "nuke_points"
  | "afterlife";

export interface EasterEggDef {
  id: EasterEggId;
  name: string;
  category: string;
  /** Shown before unlock */
  hint: string;
  /** Shown after unlock */
  description: string;
  unlockedIcon: string;
  lockedIcon: string;
}

export const EASTER_EGGS: EasterEggDef[] = [
  {
    id: "dsr_fire",
    name: "Diamond DSR",
    category: "Create-a-Class",
    hint: "Something loud is hiding on the class board…",
    description: "You found the DSR 50. It still hits different.",
    unlockedIcon: "/images/easter-eggs/diamond-dsr.png",
    lockedIcon: "/images/easter-eggs/diamond-dsr-silhouette.png",
  },
  {
    id: "share_class",
    name: "T.E.D.D.",
    category: "Create-a-Class",
    hint: "Pass a loadout to a friend…",
    description: "Shared a class. Destination: anywhere.",
    unlockedIcon: "/images/easter-eggs/teddee.gif",
    lockedIcon: "/images/easter-eggs/teddee-silhouette.png",
  },
  {
    id: "nuke_points",
    name: "Tactical Nuke",
    category: "Create-a-Class",
    hint: "Keep the streak alive. Thirty seals it.",
    description: "30 points allocated. That’s a nuke.",
    unlockedIcon: "/images/easter-eggs/nuke.png",
    lockedIcon: "/images/easter-eggs/nuke-silhouette.png",
  },
  {
    id: "afterlife",
    name: "Afterlife",
    category: "Mob of the Dead",
    hint: "Read the fine print. The walls still hum.",
    description: "Entered Afterlife. The blue world remembers.",
    unlockedIcon: "/images/easter-eggs/afterlife.png",
    lockedIcon: "/images/easter-eggs/afterlife-silhouette.png",
  },
];

export const EASTER_EGGS_BY_ID = Object.fromEntries(
  EASTER_EGGS.map((egg) => [egg.id, egg]),
) as Record<EasterEggId, EasterEggDef>;

export const EASTER_EGGS_STORAGE_KEY = "bo2-class-builder:easter-eggs";
export const EASTER_EGG_UNLOCK_EVENT = "bo2:easter-egg-unlock";
export const EASTER_EGG_VIEWED_EVENT = "bo2:easter-egg-viewed";

export interface EasterEggsState {
  unlocked: EasterEggId[];
  /** Unlocks the user has opened on the Easter Eggs page */
  viewed: EasterEggId[];
}

function sanitizeIds(ids: unknown): EasterEggId[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id): id is EasterEggId => typeof id === "string" && id in EASTER_EGGS_BY_ID);
}

export function emptyEasterEggsState(): EasterEggsState {
  return { unlocked: [], viewed: [] };
}

export function loadEasterEggsState(): EasterEggsState {
  if (typeof window === "undefined") return emptyEasterEggsState();
  try {
    const raw = window.localStorage.getItem(EASTER_EGGS_STORAGE_KEY);
    if (!raw) return emptyEasterEggsState();
    const parsed = JSON.parse(raw) as { unlocked?: unknown; viewed?: unknown };
    const unlocked = sanitizeIds(parsed.unlocked);
    // Only keep viewed ids that are still unlocked.
    const viewed = sanitizeIds(parsed.viewed).filter((id) =>
      unlocked.includes(id),
    );
    return { unlocked, viewed };
  } catch {
    return emptyEasterEggsState();
  }
}

export function saveEasterEggsState(state: EasterEggsState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EASTER_EGGS_STORAGE_KEY, JSON.stringify(state));
}

export function isEasterEggUnlocked(
  state: EasterEggsState,
  id: EasterEggId,
): boolean {
  return state.unlocked.includes(id);
}

export function hasUnseenEasterEggs(state: EasterEggsState = loadEasterEggsState()): boolean {
  return state.unlocked.some((id) => !state.viewed.includes(id));
}

/** Persist unlock and notify listeners. Returns true if newly unlocked. */
export function unlockEasterEgg(id: EasterEggId): boolean {
  if (typeof window === "undefined") return false;
  if (!(id in EASTER_EGGS_BY_ID)) return false;
  const state = loadEasterEggsState();
  if (state.unlocked.includes(id)) return false;
  const next: EasterEggsState = {
    unlocked: [...state.unlocked, id],
    viewed: state.viewed,
  };
  saveEasterEggsState(next);
  window.dispatchEvent(
    new CustomEvent(EASTER_EGG_UNLOCK_EVENT, { detail: { id } }),
  );
  return true;
}

/** Mark every currently unlocked egg as seen (visiting the EE page). */
export function markEasterEggsViewed(): EasterEggsState {
  const state = loadEasterEggsState();
  const next: EasterEggsState = {
    unlocked: state.unlocked,
    viewed: [...state.unlocked],
  };
  saveEasterEggsState(next);
  window.dispatchEvent(new CustomEvent(EASTER_EGG_VIEWED_EVENT));
  return next;
}

export function groupEasterEggsByCategory(): {
  category: string;
  eggs: EasterEggDef[];
}[] {
  const map = new Map<string, EasterEggDef[]>();
  for (const egg of EASTER_EGGS) {
    const list = map.get(egg.category) ?? [];
    list.push(egg);
    map.set(egg.category, list);
  }
  return [...map.entries()].map(([category, eggs]) => ({ category, eggs }));
}
