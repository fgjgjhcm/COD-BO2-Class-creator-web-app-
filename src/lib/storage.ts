import type { ClassBuild, SavedLoadoutsState } from "@/types/class";
import {
  LOADOUTS_STORAGE_KEY,
  MAX_LOADOUT_SLOTS,
  STORAGE_KEY,
} from "@/types/class";
import { createEmptyBuild, sanitizeBuild } from "@/lib/pick10";

export function defaultLoadoutName(slotIndex: number): string {
  return `Custom Class ${slotIndex + 1}`;
}

export function createEmptyLoadoutSlots(): ClassBuild[] {
  return Array.from({ length: MAX_LOADOUT_SLOTS }, (_, index) =>
    createEmptyBuild(defaultLoadoutName(index)),
  );
}

export function createDefaultLoadoutsState(): SavedLoadoutsState {
  return {
    activeIndex: 0,
    slots: createEmptyLoadoutSlots(),
  };
}

function clampActiveIndex(index: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.min(MAX_LOADOUT_SLOTS - 1, Math.max(0, Math.floor(index)));
}

function normalizeSlots(raw: unknown): ClassBuild[] {
  const fallback = createEmptyLoadoutSlots();
  if (!Array.isArray(raw)) return fallback;

  return fallback.map((empty, index) => {
    const entry = raw[index];
    if (!entry || typeof entry !== "object") return empty;
    return sanitizeBuild({
      ...empty,
      ...(entry as ClassBuild),
      name:
        typeof (entry as ClassBuild).name === "string" &&
        (entry as ClassBuild).name.trim()
          ? (entry as ClassBuild).name
          : empty.name,
    });
  });
}

export function isBuildEmpty(build: ClassBuild): boolean {
  return (
    !build.primaryWeaponId &&
    !build.secondaryWeaponId &&
    build.primaryAttachmentIds.every((id) => !id) &&
    build.secondaryAttachmentIds.every((id) => !id) &&
    build.perk1Ids.every((id) => !id) &&
    build.perk2Ids.every((id) => !id) &&
    build.perk3Ids.every((id) => !id) &&
    build.lethalIds.every((id) => !id) &&
    build.tacticalIds.every((id) => !id) &&
    build.wildcardIds.every((id) => !id)
  );
}

/** @deprecated Prefer loadLoadoutsState — kept for migration */
export function loadBuildFromStorage(): ClassBuild | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClassBuild;
    if (!parsed || typeof parsed !== "object") return null;
    return sanitizeBuild({ ...createEmptyBuild(), ...parsed });
  } catch {
    return null;
  }
}

/** @deprecated Prefer saveLoadoutsState */
export function saveBuildToStorage(build: ClassBuild): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
  } catch {
    // Ignore quota / private mode failures
  }
}

export function clearBuildStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function loadLoadoutsState(): SavedLoadoutsState {
  if (typeof window === "undefined") return createDefaultLoadoutsState();

  try {
    const raw = window.localStorage.getItem(LOADOUTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedLoadoutsState>;
      return {
        activeIndex: clampActiveIndex(parsed.activeIndex ?? 0),
        slots: normalizeSlots(parsed.slots),
      };
    }

    // Migrate legacy single-build key into slot 0.
    const legacy = loadBuildFromStorage();
    if (legacy) {
      const slots = createEmptyLoadoutSlots();
      slots[0] = sanitizeBuild({
        ...createEmptyBuild(defaultLoadoutName(0)),
        ...legacy,
        name: legacy.name?.trim() ? legacy.name : defaultLoadoutName(0),
      });
      const migrated: SavedLoadoutsState = { activeIndex: 0, slots };
      saveLoadoutsState(migrated);
      clearBuildStorage();
      return migrated;
    }
  } catch {
    // fall through to defaults
  }

  return createDefaultLoadoutsState();
}

export function saveLoadoutsState(state: SavedLoadoutsState): void {
  if (typeof window === "undefined") return;
  try {
    const payload: SavedLoadoutsState = {
      activeIndex: clampActiveIndex(state.activeIndex),
      slots: normalizeSlots(state.slots),
    };
    window.localStorage.setItem(LOADOUTS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota / private mode failures
  }
}

export function clearLoadoutSlot(
  state: SavedLoadoutsState,
  index: number,
): SavedLoadoutsState {
  const slots = [...state.slots];
  const safeIndex = clampActiveIndex(index);
  slots[safeIndex] = createEmptyBuild(defaultLoadoutName(safeIndex));
  return { ...state, slots };
}

export function clearAllLoadouts(): SavedLoadoutsState {
  return createDefaultLoadoutsState();
}
