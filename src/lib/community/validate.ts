import type { ClassBuild } from "@/types/class";
import { createEmptyBuild, countUsedPoints, sanitizeBuild } from "@/lib/pick10";
import { weaponsById } from "@/data/weapons";
import { attachmentsById } from "@/data/attachments";
import { perksById } from "@/data/perks";
import { equipmentById } from "@/data/equipment";
import { wildcardsById } from "@/data/wildcards";

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isIdArray(value: unknown): value is (string | null)[] {
  return Array.isArray(value) && value.every(isStringOrNull);
}

export function parseClassBuild(raw: unknown): ClassBuild | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  if (typeof data.name !== "string") return null;
  if (!isStringOrNull(data.primaryWeaponId)) return null;
  if (!isStringOrNull(data.secondaryWeaponId)) return null;
  if (!isIdArray(data.primaryAttachmentIds)) return null;
  if (!isIdArray(data.secondaryAttachmentIds)) return null;
  if (!isIdArray(data.perk1Ids)) return null;
  if (!isIdArray(data.perk2Ids)) return null;
  if (!isIdArray(data.perk3Ids)) return null;
  if (!isIdArray(data.lethalIds)) return null;
  if (!isIdArray(data.tacticalIds)) return null;
  if (!isIdArray(data.wildcardIds)) return null;

  return sanitizeBuild({
    ...createEmptyBuild(data.name.slice(0, 32) || "Custom Class"),
    name: data.name.slice(0, 32) || "Custom Class",
    primaryWeaponId: data.primaryWeaponId,
    secondaryWeaponId: data.secondaryWeaponId,
    primaryAttachmentIds: data.primaryAttachmentIds,
    secondaryAttachmentIds: data.secondaryAttachmentIds,
    perk1Ids: data.perk1Ids,
    perk2Ids: data.perk2Ids,
    perk3Ids: data.perk3Ids,
    lethalIds: data.lethalIds,
    tacticalIds: data.tacticalIds,
    wildcardIds: data.wildcardIds,
  });
}

function assertKnownId(
  id: string | null,
  lookup: Record<string, unknown>,
  label: string,
  errors: string[],
) {
  if (id && !(id in lookup)) {
    errors.push(`Unknown ${label}: ${id}`);
  }
}

/** Validate catalog IDs and Pick 10 budget after sanitize. */
export function validateClassBuild(build: ClassBuild): string[] {
  const errors: string[] = [];

  assertKnownId(build.primaryWeaponId, weaponsById, "primary weapon", errors);
  assertKnownId(build.secondaryWeaponId, weaponsById, "secondary weapon", errors);

  for (const id of build.primaryAttachmentIds) {
    assertKnownId(id, attachmentsById, "attachment", errors);
  }
  for (const id of build.secondaryAttachmentIds) {
    assertKnownId(id, attachmentsById, "attachment", errors);
  }
  for (const id of [...build.perk1Ids, ...build.perk2Ids, ...build.perk3Ids]) {
    assertKnownId(id, perksById, "perk", errors);
  }
  for (const id of [...build.lethalIds, ...build.tacticalIds]) {
    assertKnownId(id, equipmentById, "equipment", errors);
  }
  for (const id of build.wildcardIds) {
    assertKnownId(id, wildcardsById, "wildcard", errors);
  }

  const points = countUsedPoints(build);
  if (points > 10) {
    errors.push(`Loadout uses ${points}/10 Pick 10 points`);
  }
  if (points < 1 || !build.primaryWeaponId) {
    errors.push("Loadout needs at least a primary weapon");
  }

  return errors;
}
