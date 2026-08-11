import type {
  ClassBuild,
  SlotLimits,
  WildcardId,
} from "@/types/class";
import { MAX_WILDCARD_SLOTS, PICK_10_MAX } from "@/types/class";
import { weaponsById } from "@/data/weapons";
import { sanitizeEquippedAttachments } from "@/data/attachments";

export function createEmptyBuild(name = "Custom Class 1"): ClassBuild {
  return {
    name,
    primaryWeaponId: null,
    secondaryWeaponId: null,
    primaryAttachmentIds: [null, null, null],
    secondaryAttachmentIds: [null, null],
    perk1Ids: [null, null],
    perk2Ids: [null, null],
    perk3Ids: [null, null],
    lethalIds: [null, null],
    tacticalIds: [null, null],
    wildcardIds: [null, null, null, null],
  };
}

export function getActiveWildcards(build: ClassBuild): Set<WildcardId> {
  const active = new Set<WildcardId>();
  for (const id of build.wildcardIds) {
    if (id) active.add(id as WildcardId);
  }
  return active;
}

export function getSlotLimits(build: ClassBuild): SlotLimits {
  const wildcards = getActiveWildcards(build);
  const tactician = wildcards.has("tactician");
  const dangerClose = wildcards.has("danger_close");

  return {
    primaryAttachments: wildcards.has("primary_gunfighter") ? 3 : 2,
    secondaryAttachments: wildcards.has("secondary_gunfighter") ? 2 : 1,
    perk1: wildcards.has("perk1_greed") ? 2 : 1,
    perk2: wildcards.has("perk2_greed") ? 2 : 1,
    perk3: wildcards.has("perk3_greed") ? 2 : 1,
    // Tactician replaces lethal with a second tactical
    lethals: tactician ? 0 : dangerClose ? 2 : 1,
    tacticals: tactician ? 2 : 1,
    wildcards: MAX_WILDCARD_SLOTS,
  };
}

function countFilled(ids: (string | null)[], limit: number): number {
  return ids.slice(0, limit).filter(Boolean).length;
}

export function countUsedPoints(build: ClassBuild): number {
  const limits = getSlotLimits(build);

  return (
    (build.primaryWeaponId ? 1 : 0) +
    (build.secondaryWeaponId ? 1 : 0) +
    countFilled(build.primaryAttachmentIds, limits.primaryAttachments) +
    countFilled(build.secondaryAttachmentIds, limits.secondaryAttachments) +
    countFilled(build.perk1Ids, limits.perk1) +
    countFilled(build.perk2Ids, limits.perk2) +
    countFilled(build.perk3Ids, limits.perk3) +
    countFilled(build.lethalIds, limits.lethals) +
    countFilled(build.tacticalIds, limits.tacticals) +
    build.wildcardIds.filter(Boolean).length
  );
}

export function getRemainingPoints(build: ClassBuild): number {
  return PICK_10_MAX - countUsedPoints(build);
}

export function canAffordNewItem(build: ClassBuild): boolean {
  return getRemainingPoints(build) > 0;
}

/**
 * After wildcards change (or weapon changes), trim overflow selections
 * that are no longer allowed so point totals stay accurate.
 */
export function sanitizeBuild(build: ClassBuild): ClassBuild {
  const next: ClassBuild = {
    ...build,
    primaryAttachmentIds: [...build.primaryAttachmentIds],
    secondaryAttachmentIds: [...build.secondaryAttachmentIds],
    perk1Ids: [...build.perk1Ids],
    perk2Ids: [...build.perk2Ids],
    perk3Ids: [...build.perk3Ids],
    lethalIds: [...build.lethalIds],
    tacticalIds: [...build.tacticalIds],
    wildcardIds: [...build.wildcardIds],
  };

  const wildcards = getActiveWildcards(next);
  const limits = getSlotLimits(next);

  // Ensure array lengths
  while (next.primaryAttachmentIds.length < 3) next.primaryAttachmentIds.push(null);
  while (next.secondaryAttachmentIds.length < 2) next.secondaryAttachmentIds.push(null);
  while (next.perk1Ids.length < 2) next.perk1Ids.push(null);
  while (next.perk2Ids.length < 2) next.perk2Ids.push(null);
  while (next.perk3Ids.length < 2) next.perk3Ids.push(null);
  while (next.lethalIds.length < 2) next.lethalIds.push(null);
  while (next.tacticalIds.length < 2) next.tacticalIds.push(null);
  while (next.wildcardIds.length < MAX_WILDCARD_SLOTS) next.wildcardIds.push(null);

  // Clear attachments beyond limits
  for (let i = limits.primaryAttachments; i < next.primaryAttachmentIds.length; i++) {
    next.primaryAttachmentIds[i] = null;
  }
  for (let i = limits.secondaryAttachments; i < next.secondaryAttachmentIds.length; i++) {
    next.secondaryAttachmentIds[i] = null;
  }
  for (let i = limits.perk1; i < next.perk1Ids.length; i++) next.perk1Ids[i] = null;
  for (let i = limits.perk2; i < next.perk2Ids.length; i++) next.perk2Ids[i] = null;
  for (let i = limits.perk3; i < next.perk3Ids.length; i++) next.perk3Ids[i] = null;
  for (let i = limits.lethals; i < next.lethalIds.length; i++) next.lethalIds[i] = null;
  for (let i = limits.tacticals; i < next.tacticalIds.length; i++) next.tacticalIds[i] = null;

  // Overkill removed → clear primary-as-secondary
  if (!wildcards.has("overkill") && next.secondaryWeaponId) {
    const secondary = weaponsById[next.secondaryWeaponId];
    if (secondary?.isPrimary) {
      next.secondaryWeaponId = null;
      next.secondaryAttachmentIds = next.secondaryAttachmentIds.map(() => null);
    }
  }

  // Clear attachments if weapon missing, incompatible, or weapon has none
  if (!next.primaryWeaponId) {
    next.primaryAttachmentIds = next.primaryAttachmentIds.map(() => null);
  } else {
    const primary = weaponsById[next.primaryWeaponId];
    next.primaryAttachmentIds = sanitizeEquippedAttachments(
      primary,
      next.primaryAttachmentIds,
    );
  }
  if (!next.secondaryWeaponId) {
    next.secondaryAttachmentIds = next.secondaryAttachmentIds.map(() => null);
  } else {
    const secondary = weaponsById[next.secondaryWeaponId];
    next.secondaryAttachmentIds = sanitizeEquippedAttachments(
      secondary,
      next.secondaryAttachmentIds,
    );
  }

  return next;
}

export function clearSlotArray(
  ids: (string | null)[],
  index: number,
): (string | null)[] {
  const copy = [...ids];
  copy[index] = null;
  return copy;
}
