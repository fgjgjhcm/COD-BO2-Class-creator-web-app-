import type { Weapon } from "@/types/class";

/**
 * Representative BO2 weapon set. Expand this list freely —
 * UI and Pick 10 logic read from this data, not hard-coded names.
 */
export const weapons: Weapon[] = [
  // Assault Rifles
  {
    id: "mtar",
    name: "MTAR",
    category: "assault_rifle",
    slot: "primary",
    isPrimary: true,
    description: "Assault Rifle",
    icon: "/images/weapons/mtar.webp",
  },
  {
    id: "type_25",
    name: "Type 25",
    category: "assault_rifle",
    slot: "primary",
    isPrimary: true,
    description: "Assault Rifle",
    icon: "/images/weapons/type_25.webp",
  },
  {
    id: "swat_556",
    name: "SWAT-556",
    category: "assault_rifle",
    slot: "primary",
    isPrimary: true,
    description: "Assault Rifle",
    icon: "/images/weapons/swat_556.webp",
  },
  {
    id: "fal_osw",
    name: "FAL OSW",
    category: "assault_rifle",
    slot: "primary",
    isPrimary: true,
    description: "Assault Rifle",
    icon: "/images/weapons/fal_osw.webp",
  },
  {
    id: "m27",
    name: "M27",
    category: "assault_rifle",
    slot: "primary",
    isPrimary: true,
    description: "Assault Rifle",
    icon: "/images/weapons/m27.webp",
  },
  {
    id: "scar_h",
    name: "SCAR-H",
    category: "assault_rifle",
    slot: "primary",
    isPrimary: true,
    description: "Assault Rifle",
    icon: "/images/weapons/scar_h.webp",
  },
  {
    id: "smr",
    name: "SMR",
    category: "assault_rifle",
    slot: "primary",
    isPrimary: true,
    description: "Assault Rifle",
    icon: "/images/weapons/smr.webp",
  },
  {
    id: "an_94",
    name: "AN-94",
    category: "assault_rifle",
    slot: "primary",
    isPrimary: true,
    description: "Assault Rifle",
    icon: "/images/weapons/an_94.webp",
  },
  // SMGs
  {
    id: "mp7",
    name: "MP7",
    category: "smg",
    slot: "primary",
    isPrimary: true,
    description: "SMG",
    icon: "/images/weapons/mp7.webp",
  },
  {
    id: "pdw_57",
    name: "PDW-57",
    category: "smg",
    slot: "primary",
    isPrimary: true,
    description: "SMG",
    icon: "/images/weapons/pdw_57.webp",
  },
  {
    id: "vector_k10",
    name: "Vector K10",
    category: "smg",
    slot: "primary",
    isPrimary: true,
    description: "SMG",
    icon: "/images/weapons/vector_k10.webp",
  },
  {
    id: "msmc",
    name: "MSMC",
    category: "smg",
    slot: "primary",
    isPrimary: true,
    description: "SMG",
    icon: "/images/weapons/msmc.webp",
  },
  {
    id: "chicom_cqb",
    name: "Chicom CQB",
    category: "smg",
    slot: "primary",
    isPrimary: true,
    description: "SMG",
    icon: "/images/weapons/chicom_cqb.webp",
  },
  {
    id: "skorpion_evo",
    name: "Skorpion EVO",
    category: "smg",
    slot: "primary",
    isPrimary: true,
    description: "SMG",
    icon: "/images/weapons/skorpion_evo.webp",
  },
  {
    id: "peacekeeper",
    name: "Peacekeeper",
    category: "smg",
    slot: "primary",
    isPrimary: true,
    description: "SMG",
    icon: "/images/weapons/peacekeeper.webp",
  },
  // Snipers
  {
    id: "dsr_50",
    name: "DSR 50",
    category: "sniper",
    slot: "primary",
    isPrimary: true,
    description: "Sniper Rifle",
    icon: "/images/weapons/dsr_50.webp",
  },
  {
    id: "ballista",
    name: "Ballista",
    category: "sniper",
    slot: "primary",
    isPrimary: true,
    description: "Sniper Rifle",
    icon: "/images/weapons/ballista.webp",
  },
  {
    id: "xpr_50",
    name: "XPR-50",
    category: "sniper",
    slot: "primary",
    isPrimary: true,
    description: "Sniper Rifle",
    icon: "/images/weapons/xpr_50.webp",
  },
  {
    id: "svu_as",
    name: "SVU-AS",
    category: "sniper",
    slot: "primary",
    isPrimary: true,
    description: "Sniper Rifle",
    icon: "/images/weapons/svu_as.webp",
  },
  // LMGs
  {
    id: "qbb_lsw",
    name: "QBB LSW",
    category: "lmg",
    slot: "primary",
    isPrimary: true,
    description: "LMG",
    icon: "/images/weapons/qbb_lsw.webp",
  },
  {
    id: "lsat",
    name: "LSAT",
    category: "lmg",
    slot: "primary",
    isPrimary: true,
    description: "LMG",
    icon: "/images/weapons/lsat.webp",
  },
  {
    id: "hamr",
    name: "HAMR",
    category: "lmg",
    slot: "primary",
    isPrimary: true,
    description: "LMG",
    icon: "/images/weapons/hamr.webp",
  },
  {
    id: "mk48",
    name: "Mk 48",
    category: "lmg",
    slot: "primary",
    isPrimary: true,
    description: "LMG",
    icon: "/images/weapons/mk48.webp",
  },
  // Shotguns
  {
    id: "remington_870_mcs",
    name: "Remington 870 MCS",
    category: "shotgun",
    slot: "primary",
    isPrimary: true,
    description: "Shotgun",
    icon: "/images/weapons/remington_870_mcs.webp",
  },
  {
    id: "s12",
    name: "S12",
    category: "shotgun",
    slot: "primary",
    isPrimary: true,
    description: "Shotgun",
    icon: "/images/weapons/s12.webp",
  },
  {
    id: "ksg",
    name: "KSG",
    category: "shotgun",
    slot: "primary",
    isPrimary: true,
    description: "Shotgun",
    icon: "/images/weapons/ksg.webp",
  },
  {
    id: "m1216",
    name: "M1216",
    category: "shotgun",
    slot: "primary",
    isPrimary: true,
    description: "Shotgun",
    icon: "/images/weapons/m1216.webp",
  },
  // Special (primary)
  {
    id: "assault_shield",
    name: "Assault Shield",
    category: "special",
    slot: "primary",
    isPrimary: true,
    description: "Special",
    icon: "/images/weapons/assault_shield.webp",
  },
  // Secondaries — Pistols
  {
    id: "five_seven",
    name: "Five-Seven",
    category: "pistol",
    slot: "secondary",
    isPrimary: false,
    description: "Pistol",
    icon: "/images/weapons/five_seven.webp",
  },
  {
    id: "tac_45",
    name: "TAC-45",
    category: "pistol",
    slot: "secondary",
    isPrimary: false,
    description: "Pistol",
    icon: "/images/weapons/tac_45.webp",
  },
  {
    id: "b23r",
    name: "B23R",
    category: "pistol",
    slot: "secondary",
    isPrimary: false,
    description: "Pistol",
    icon: "/images/weapons/b23r.webp",
  },
  {
    id: "executioner",
    name: "Executioner",
    category: "pistol",
    slot: "secondary",
    isPrimary: false,
    description: "Pistol",
    icon: "/images/weapons/executioner.webp",
  },
  {
    id: "kap_40",
    name: "KAP-40",
    category: "pistol",
    slot: "secondary",
    isPrimary: false,
    description: "Pistol",
    icon: "/images/weapons/kap_40.webp",
  },
  // Launchers
  {
    id: "smaw",
    name: "SMAW",
    category: "launcher",
    slot: "secondary",
    isPrimary: false,
    description: "Launcher",
    icon: "/images/weapons/smaw.webp",
  },
  {
    id: "fhj_18_aa",
    name: "FHJ-18 AA",
    category: "launcher",
    slot: "secondary",
    isPrimary: false,
    description: "Launcher",
    icon: "/images/weapons/fhj_18_aa.webp",
  },
  {
    id: "rpg",
    name: "RPG",
    category: "launcher",
    slot: "secondary",
    isPrimary: false,
    description: "Launcher",
    icon: "/images/weapons/rpg.webp",
  },
  // Special
  {
    id: "crossbow",
    name: "Crossbow",
    category: "special",
    slot: "secondary",
    isPrimary: false,
    description: "Special",
    icon: "/images/weapons/crossbow.png",
  },
  {
    id: "ballistic_knife",
    name: "Ballistic Knife",
    category: "special",
    slot: "secondary",
    isPrimary: false,
    description: "Special",
    icon: "/images/weapons/ballistic_knife.webp",
  },
];

export const weaponsById = Object.fromEntries(
  weapons.map((weapon) => [weapon.id, weapon]),
) as Record<string, Weapon>;

export function getPrimaryWeapons(): Weapon[] {
  return weapons.filter((weapon) => weapon.isPrimary);
}

export function getSecondaryWeapons(allowOverkill: boolean): Weapon[] {
  if (allowOverkill) {
    return weapons;
  }
  return weapons.filter((weapon) => !weapon.isPrimary);
}

/** Launchers, Ballistic Knife, and Assault Shield have no attachment slots. */
export function weaponSupportsAttachments(weapon: Weapon): boolean {
  if (weapon.category === "launcher") return false;
  if (weapon.id === "ballistic_knife") return false;
  if (weapon.id === "assault_shield") return false;
  return true;
}
