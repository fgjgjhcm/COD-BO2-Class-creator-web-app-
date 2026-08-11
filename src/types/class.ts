export type WeaponCategory =
  | "assault_rifle"
  | "smg"
  | "lmg"
  | "sniper"
  | "shotgun"
  | "pistol"
  | "launcher"
  | "special";

export type WeaponSlotType = "primary" | "secondary";

export type AttachmentCategory =
  | "optic"
  | "barrel"
  | "underbarrel"
  | "magazine"
  | "stock"
  | "other";

export type PerkTier = 1 | 2 | 3;

export type EquipmentType = "lethal" | "tactical";

export type WildcardId =
  | "primary_gunfighter"
  | "secondary_gunfighter"
  | "overkill"
  | "perk1_greed"
  | "perk2_greed"
  | "perk3_greed"
  | "danger_close"
  | "tactician";

export interface GameItem {
  id: string;
  name: string;
  description?: string;
  /** Optional path for icon/image assets under /public (e.g. /images/weapons/mtar.svg) */
  icon?: string;
}

export interface Weapon extends GameItem {
  category: WeaponCategory;
  slot: WeaponSlotType;
  /** Primary weapons that Overkill can place in the secondary slot */
  isPrimary: boolean;
}

export interface Attachment extends GameItem {
  category: AttachmentCategory;
  /** Weapon categories this attachment can equip on */
  compatibleCategories: WeaponCategory[];
  /** If set, only these weapon ids may equip it (still must match a category) */
  compatibleWeaponIds?: string[];
  /** Explicit weapon exclusions even when the category matches */
  incompatibleWeaponIds?: string[];
}

export interface Perk extends GameItem {
  tier: PerkTier;
}

export interface Equipment extends GameItem {
  type: EquipmentType;
}

export interface Wildcard extends GameItem {
  id: WildcardId;
  effect: string;
}

export type SelectorKind =
  | "primaryWeapon"
  | "secondaryWeapon"
  | "primaryAttachment"
  | "secondaryAttachment"
  | "perk1"
  | "perk2"
  | "perk3"
  | "lethal"
  | "tactical"
  | "wildcard";

export interface SelectorTarget {
  kind: SelectorKind;
  index: number;
}

export interface ClassBuild {
  name: string;
  primaryWeaponId: string | null;
  secondaryWeaponId: string | null;
  primaryAttachmentIds: (string | null)[];
  secondaryAttachmentIds: (string | null)[];
  perk1Ids: (string | null)[];
  perk2Ids: (string | null)[];
  perk3Ids: (string | null)[];
  lethalIds: (string | null)[];
  tacticalIds: (string | null)[];
  wildcardIds: (string | null)[];
}

export interface SlotLimits {
  primaryAttachments: number;
  secondaryAttachments: number;
  perk1: number;
  perk2: number;
  perk3: number;
  lethals: number;
  tacticals: number;
  wildcards: number;
}

export const PICK_10_MAX = 10;
export const STORAGE_KEY = "bo2-class-builder:current";
export const LOADOUTS_STORAGE_KEY = "bo2-class-builder:loadouts";
export const MAX_LOADOUT_SLOTS = 5;
export const MAX_WILDCARD_SLOTS = 4;

export interface SavedLoadoutsState {
  activeIndex: number;
  slots: ClassBuild[];
}
