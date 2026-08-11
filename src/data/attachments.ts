import type { Attachment, Weapon, WeaponCategory } from "@/types/class";

const AR: WeaponCategory[] = ["assault_rifle"];
const SMG: WeaponCategory[] = ["smg"];
const LMG: WeaponCategory[] = ["lmg"];
const SNIPER: WeaponCategory[] = ["sniper"];
const SHOTGUN: WeaponCategory[] = ["shotgun"];
const PISTOL: WeaponCategory[] = ["pistol"];
const SPECIAL: WeaponCategory[] = ["special"];

const AR_SMG_LMG: WeaponCategory[] = [...AR, ...SMG, ...LMG];
const AR_LMG: WeaponCategory[] = [...AR, ...LMG];
const AR_SMG: WeaponCategory[] = [...AR, ...SMG];
const AR_SMG_SHOTGUN: WeaponCategory[] = [...AR, ...SMG, ...SHOTGUN];
const SMG_LMG: WeaponCategory[] = [...SMG, ...LMG];
const SMG_SHOTGUN_PISTOL: WeaponCategory[] = [...SMG, ...SHOTGUN, ...PISTOL];
const PRIMARY_WITH_QUICKDRAW: WeaponCategory[] = [
  ...AR,
  ...SMG,
  ...LMG,
  ...SHOTGUN,
];

/** Crossbow multiplayer optic/mod pool (no FMJ / Fast Mag / Suppressor). */
const CROSSBOW_ONLY = ["crossbow"] as const;

function weaponAllowsAttachments(weapon: Weapon): boolean {
  if (weapon.category === "launcher") return false;
  if (weapon.id === "ballistic_knife") return false;
  if (weapon.id === "assault_shield") return false;
  return true;
}

/**
 * BO2 multiplayer attachment pairs that cannot be equipped together.
 * (Category collisions like two optics are handled separately.)
 */
export const ATTACHMENT_CONFLICTS: ReadonlyArray<readonly [string, string]> = [
  ["select_fire", "grenade_launcher"],
  ["select_fire", "eotech"], // Hybrid Optic
  ["fast_mag", "extended_mag"],
  ["mms", "fmj"],
  ["ballistics_cpu", "acog"],
  ["ballistics_cpu", "iron_sights"],
];

/**
 * BO2 multiplayer attachment compatibility.
 * Category filters first; weapon id allow/deny lists handle per-gun exceptions.
 */
export const attachments: Attachment[] = [
  // Optics
  {
    id: "iron_sights",
    name: "Iron Sights",
    category: "optic",
    compatibleCategories: SNIPER,
    compatibleWeaponIds: ["ballista"],
    description: "Optic",
    icon: "/images/attachments/iron_sights.webp",
  },
  {
    id: "reflex",
    name: "Reflex Sight",
    category: "optic",
    compatibleCategories: [...AR_SMG_LMG, ...SHOTGUN, ...PISTOL, ...SPECIAL],
    incompatibleWeaponIds: ["ballistic_knife", "assault_shield"],
    description: "Optic",
    icon: "/images/attachments/reflex.webp",
  },
  {
    id: "eotech_sight",
    name: "EOTech Sight",
    category: "optic",
    // Holographic sight — ARs, SMGs, and LMGs
    compatibleCategories: AR_SMG_LMG,
    description: "Optic",
    icon: "/images/attachments/eotech_sight.png",
  },
  {
    id: "eotech",
    name: "Hybrid Optic",
    category: "optic",
    // Flip optic — ARs and LMGs only (not SMGs)
    compatibleCategories: AR_LMG,
    description: "Optic",
    icon: "/images/attachments/eotech.webp",
  },
  {
    id: "acog",
    name: "ACOG Sight",
    category: "optic",
    // Not on SMGs, shotguns, or pistols
    compatibleCategories: [...AR, ...LMG, ...SNIPER, ...SPECIAL],
    incompatibleWeaponIds: ["ballistic_knife", "assault_shield"],
    description: "Optic",
    icon: "/images/attachments/acog.png",
  },
  {
    id: "target_finder",
    name: "Target Finder",
    category: "optic",
    compatibleCategories: AR_SMG_LMG,
    description: "Optic",
    icon: "/images/attachments/target_finder.webp",
  },
  {
    id: "mms",
    name: "Millimeter Scanner",
    category: "optic",
    compatibleCategories: AR_SMG_SHOTGUN,
    description: "Optic",
    icon: "/images/attachments/mms.png",
  },
  {
    id: "dual_band",
    name: "Dual Band",
    category: "optic",
    compatibleCategories: [...LMG, ...SNIPER, ...SPECIAL],
    incompatibleWeaponIds: ["ballistic_knife", "assault_shield"],
    description: "Optic",
    icon: "/images/attachments/dual_band.webp",
  },
  {
    id: "variable_zoom",
    name: "Variable Zoom",
    category: "optic",
    compatibleCategories: [...SNIPER, ...LMG, ...SPECIAL],
    incompatibleWeaponIds: ["ballistic_knife", "assault_shield"],
    description: "Optic",
    icon: "/images/attachments/variable_zoom.png",
  },
  // Barrel / muzzle
  {
    id: "suppressor",
    name: "Suppressor",
    category: "barrel",
    compatibleCategories: [...AR_SMG_LMG, ...SNIPER, ...SHOTGUN, ...PISTOL],
    description: "Barrel",
    icon: "/images/attachments/suppressor.png",
  },
  {
    id: "long_barrel",
    name: "Long Barrel",
    category: "barrel",
    compatibleCategories: SMG_SHOTGUN_PISTOL,
    description: "Barrel",
    icon: "/images/attachments/long_barrel.png",
  },
  {
    id: "quickdraw",
    name: "Quickdraw Handle",
    category: "other",
    compatibleCategories: PRIMARY_WITH_QUICKDRAW,
    description: "Handle",
    icon: "/images/attachments/quickdraw.png",
  },
  {
    id: "fmj",
    name: "FMJ",
    category: "other",
    // Not shotguns or Crossbow
    compatibleCategories: [...AR_SMG_LMG, ...SNIPER, ...PISTOL],
    description: "Ammunition",
    icon: "/images/attachments/fmj.webp",
  },
  {
    id: "laser",
    name: "Laser Sight",
    category: "other",
    compatibleCategories: [...AR_SMG_LMG, ...SNIPER, ...SHOTGUN, ...PISTOL],
    description: "Accessory",
    icon: "/images/attachments/laser.webp",
  },
  {
    id: "select_fire",
    name: "Select Fire",
    category: "other",
    compatibleCategories: AR_SMG,
    description: "Fire Mode",
    icon: "/images/attachments/select_fire.webp",
  },
  {
    id: "rapid_fire",
    name: "Rapid Fire",
    category: "other",
    compatibleCategories: SMG_LMG,
    description: "Fire Rate",
    icon: "/images/attachments/rapid_fire.webp",
  },
  {
    id: "ballistics_cpu",
    name: "Ballistics CPU",
    category: "other",
    compatibleCategories: SNIPER,
    description: "Stability",
    icon: "/images/attachments/ballistics_cpu.webp",
  },
  {
    id: "tri_bolt",
    name: "Tri-Bolt",
    category: "other",
    compatibleCategories: SPECIAL,
    compatibleWeaponIds: [...CROSSBOW_ONLY],
    description: "Ammunition",
    icon: "/images/attachments/tri_bolt.webp",
  },
  // Underbarrel
  {
    id: "grip",
    name: "Fore Grip",
    category: "underbarrel",
    compatibleCategories: AR_SMG_LMG,
    description: "Underbarrel",
    icon: "/images/attachments/grip.png",
  },
  {
    id: "grenade_launcher",
    name: "Grenade Launcher",
    category: "underbarrel",
    // All assault rifles in multiplayer (conflicts with Select Fire / Hybrid when equipped)
    compatibleCategories: AR,
    description: "Underbarrel",
    icon: "/images/attachments/grenade_launcher.png",
  },
  {
    id: "tactical_knife",
    name: "Tactical Knife",
    category: "underbarrel",
    compatibleCategories: PISTOL,
    description: "Melee",
    icon: "/images/attachments/tactical_knife.webp",
  },
  // Magazines
  {
    id: "fast_mag",
    name: "Fast Mag",
    category: "magazine",
    // Not LMGs or Crossbow
    compatibleCategories: [...AR, ...SMG, ...SNIPER, ...SHOTGUN, ...PISTOL],
    description: "Magazine",
    icon: "/images/attachments/fast_mag.webp",
  },
  {
    id: "extended_mag",
    name: "Extended Clip",
    category: "magazine",
    compatibleCategories: [...AR_SMG_LMG, ...SNIPER, ...SHOTGUN, ...PISTOL],
    // Executioner cannot take Extended Clip
    incompatibleWeaponIds: ["executioner"],
    description: "Magazine",
    icon: "/images/attachments/extended_mag.png",
  },
  // Stock
  {
    id: "stock",
    name: "Stock",
    category: "stock",
    compatibleCategories: [...AR_SMG_LMG, ...SHOTGUN],
    description: "Stock",
    icon: "/images/attachments/stock.webp",
  },
  {
    id: "dual_wield",
    name: "Dual Wield",
    category: "other",
    compatibleCategories: PISTOL,
    description: "Pistol",
    icon: "/images/attachments/dual_wield.webp",
  },
];

export const attachmentsById = Object.fromEntries(
  attachments.map((attachment) => [attachment.id, attachment]),
) as Record<string, Attachment>;

function attachmentsConflict(a: string, b: string): boolean {
  if (a === b) return true;
  if (a === "dual_wield" || b === "dual_wield") return true;
  return ATTACHMENT_CONFLICTS.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
}

export function isAttachmentCompatibleWithWeapon(
  attachment: Attachment,
  weapon: Weapon,
): boolean {
  if (!weaponAllowsAttachments(weapon)) {
    return false;
  }
  if (!attachment.compatibleCategories.includes(weapon.category)) {
    return false;
  }
  if (
    attachment.compatibleWeaponIds &&
    !attachment.compatibleWeaponIds.includes(weapon.id)
  ) {
    return false;
  }
  if (attachment.incompatibleWeaponIds?.includes(weapon.id)) {
    return false;
  }
  return true;
}

export function getAttachmentsForWeapon(weapon: Weapon): Attachment[] {
  if (!weaponAllowsAttachments(weapon)) {
    return [];
  }
  return attachments.filter((attachment) =>
    isAttachmentCompatibleWithWeapon(attachment, weapon),
  );
}

/**
 * Attachments available for a weapon, excluding ones that conflict with
 * already-equipped attachments (other slots) or duplicate categories.
 */
export function getAttachmentsForWeaponSlot(
  weapon: Weapon,
  equippedIds: (string | null)[],
  slotIndex: number,
): Attachment[] {
  const equipped = equippedIds
    .map((id, index) => ({ id, index }))
    .filter(
      (entry): entry is { id: string; index: number } =>
        !!entry.id && entry.index !== slotIndex,
    );

  return getAttachmentsForWeapon(weapon).filter((attachment) => {
    for (const { id: otherId } of equipped) {
      if (attachmentsConflict(attachment.id, otherId)) {
        return false;
      }
      const other = attachmentsById[otherId];
      if (
        other &&
        attachment.category === other.category &&
        attachment.category !== "other"
      ) {
        return false;
      }
    }
    return true;
  });
}

/** Drop equipped attachments that conflict with each other or the weapon. */
export function sanitizeEquippedAttachments(
  weapon: Weapon | undefined,
  ids: (string | null)[],
): (string | null)[] {
  if (!weapon || !weaponAllowsAttachments(weapon)) {
    return ids.map(() => null);
  }

  const next = [...ids];
  for (let i = 0; i < next.length; i++) {
    const id = next[i];
    if (!id) continue;
    const attachment = attachmentsById[id];
    if (!attachment || !isAttachmentCompatibleWithWeapon(attachment, weapon)) {
      next[i] = null;
      continue;
    }
    for (let j = 0; j < i; j++) {
      const otherId = next[j];
      if (!otherId) continue;
      const other = attachmentsById[otherId];
      if (!other) {
        next[j] = null;
        continue;
      }
      if (attachmentsConflict(id, otherId)) {
        next[i] = null;
        break;
      }
      if (
        attachment.category === other.category &&
        attachment.category !== "other"
      ) {
        next[i] = null;
        break;
      }
    }
  }
  return next;
}

/** @deprecated Prefer getAttachmentsForWeapon for per-gun rules */
export function getAttachmentsForWeaponCategory(
  category: WeaponCategory,
): Attachment[] {
  return attachments.filter((attachment) =>
    attachment.compatibleCategories.includes(category),
  );
}
