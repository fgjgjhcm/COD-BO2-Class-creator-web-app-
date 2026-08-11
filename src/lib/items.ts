import type {
  ClassBuild,
  GameItem,
  SelectorKind,
  SelectorTarget,
  Weapon,
  WeaponCategory,
} from "@/types/class";
import { attachmentsById, getAttachmentsForWeaponSlot } from "@/data/attachments";
import { equipmentById, getEquipmentByType } from "@/data/equipment";
import { getPerksByTier, perksById } from "@/data/perks";
import { getPrimaryWeapons, getSecondaryWeapons, weaponsById } from "@/data/weapons";
import { wildcards, wildcardsById } from "@/data/wildcards";
import { getActiveWildcards } from "@/lib/pick10";

const WEAPON_CATEGORY_ORDER: WeaponCategory[] = [
  "assault_rifle",
  "smg",
  "lmg",
  "sniper",
  "shotgun",
  "pistol",
  "launcher",
  "special",
];

const WEAPON_CATEGORY_LABELS: Record<WeaponCategory, string> = {
  assault_rifle: "Assault Rifles",
  smg: "SMGs",
  lmg: "LMGs",
  sniper: "Sniper Rifles",
  shotgun: "Shotguns",
  pistol: "Pistols",
  launcher: "Launchers",
  special: "Special",
};

export function formatCategoryLabel(value: string): string {
  if (value in WEAPON_CATEGORY_LABELS) {
    return WEAPON_CATEGORY_LABELS[value as WeaponCategory];
  }
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getWeaponCategoryLabel(category: WeaponCategory): string {
  return WEAPON_CATEGORY_LABELS[category];
}

export function resolveItem(id: string | null | undefined): GameItem | null {
  if (!id) return null;
  return (
    weaponsById[id] ??
    attachmentsById[id] ??
    perksById[id] ??
    equipmentById[id] ??
    wildcardsById[id as keyof typeof wildcardsById] ??
    null
  );
}

export function getItemSubtitle(item: GameItem): string {
  if (
    "category" in item &&
    typeof (item as { category?: string }).category === "string"
  ) {
    const weaponOrAttachment = item as {
      category: string;
      description?: string;
    };
    return formatCategoryLabel(weaponOrAttachment.category);
  }
  if ("tier" in item) {
    return `Perk ${(item as { tier: number }).tier}`;
  }
  if ("type" in item) {
    return formatCategoryLabel((item as { type: string }).type);
  }
  if ("effect" in item) {
    return "Wildcard";
  }
  return item.description ?? "Item";
}

export function getSelectorTitle(kind: SelectorKind): string {
  switch (kind) {
    case "primaryWeapon":
      return "Primary Weapon";
    case "secondaryWeapon":
      return "Secondary Weapon";
    case "primaryAttachment":
      return "Primary Attachment";
    case "secondaryAttachment":
      return "Secondary Attachment";
    case "perk1":
      return "Perk 1";
    case "perk2":
      return "Perk 2";
    case "perk3":
      return "Perk 3";
    case "lethal":
      return "Lethal";
    case "tactical":
      return "Tactical";
    case "wildcard":
      return "Wildcard";
    default:
      return "Select Item";
  }
}

export function isWeaponSelector(kind: SelectorKind): boolean {
  return kind === "primaryWeapon" || kind === "secondaryWeapon";
}

export function getAvailableItems(
  build: ClassBuild,
  target: SelectorTarget,
  primaryWeapon?: Weapon,
  secondaryWeapon?: Weapon,
): GameItem[] {
  const overkill = getActiveWildcards(build).has("overkill");

  switch (target.kind) {
    case "primaryWeapon":
      return getPrimaryWeapons();
    case "secondaryWeapon":
      return getSecondaryWeapons(overkill);
    case "primaryAttachment":
      return primaryWeapon
        ? getAttachmentsForWeaponSlot(
            primaryWeapon,
            build.primaryAttachmentIds,
            target.index,
          )
        : [];
    case "secondaryAttachment":
      return secondaryWeapon
        ? getAttachmentsForWeaponSlot(
            secondaryWeapon,
            build.secondaryAttachmentIds,
            target.index,
          )
        : [];
    case "perk1":
      return getPerksByTier(1);
    case "perk2":
      return getPerksByTier(2);
    case "perk3":
      return getPerksByTier(3);
    case "lethal":
      return getEquipmentByType("lethal");
    case "tactical":
      return getEquipmentByType("tactical");
    case "wildcard":
      return wildcards;
    default:
      return [];
  }
}

export interface WeaponCategoryGroup {
  category: WeaponCategory;
  label: string;
  weapons: Weapon[];
}

/** Group available weapons by category, omitting empty categories. */
export function groupWeaponsByCategory(weapons: Weapon[]): WeaponCategoryGroup[] {
  const byCategory = new Map<WeaponCategory, Weapon[]>();
  for (const weapon of weapons) {
    const list = byCategory.get(weapon.category) ?? [];
    list.push(weapon);
    byCategory.set(weapon.category, list);
  }

  return WEAPON_CATEGORY_ORDER.filter((category) => byCategory.has(category)).map(
    (category) => ({
      category,
      label: getWeaponCategoryLabel(category),
      weapons: byCategory.get(category) ?? [],
    }),
  );
}
