import type { Perk, PerkTier } from "@/types/class";

export const perks: Perk[] = [
  // Perk 1
  {
    id: "lightweight",
    name: "Lightweight",
    tier: 1,
    description: "Move faster.",
    icon: "/images/perks/lightweight.webp",
  },
  {
    id: "hardline",
    name: "Hardline",
    tier: 1,
    description: "Earn scorestreaks faster.",
    icon: "/images/perks/hardline.webp",
  },
  {
    id: "blind_eye",
    name: "Blind Eye",
    tier: 1,
    description: "Undetectable by AI-controlled air support.",
    icon: "/images/perks/blind_eye.webp",
  },
  {
    id: "flak_jacket",
    name: "Flak Jacket",
    tier: 1,
    description: "Take less explosive damage.",
    icon: "/images/perks/flak_jacket.webp",
  },
  {
    id: "ghost",
    name: "Ghost",
    tier: 1,
    description: "Invisible to UAVs while moving.",
    icon: "/images/perks/ghost.webp",
  },
  // Perk 2
  {
    id: "toughness",
    name: "Toughness",
    tier: 2,
    description: "Flinch less when shot.",
    icon: "/images/perks/toughness.webp",
  },
  {
    id: "scavenger",
    name: "Scavenger",
    tier: 2,
    description: "Replenish ammo from fallen enemies.",
    icon: "/images/perks/scavenger.webp",
  },
  {
    id: "cold_blooded",
    name: "Cold Blooded",
    tier: 2,
    description: "Immune to targeting systems and dual-band.",
    icon: "/images/perks/cold_blooded.webp",
  },
  {
    id: "fast_hands",
    name: "Fast Hands",
    tier: 2,
    description: "Swap weapons and use equipment faster.",
    icon: "/images/perks/fast_hands.webp",
  },
  {
    id: "hard_wired",
    name: "Hard Wired",
    tier: 2,
    description: "Immune to Counter-UAV, EMP, and scrambles.",
    icon: "/images/perks/hard_wired.webp",
  },
  // Perk 3
  {
    id: "dexterity",
    name: "Dexterity",
    tier: 3,
    description: "Aim faster after sprinting. Climb obstacles faster.",
    icon: "/images/perks/dexterity.webp",
  },
  {
    id: "extreme_conditioning",
    name: "Extreme Conditioning",
    tier: 3,
    description: "Sprint for longer distances.",
    icon: "/images/perks/extreme_conditioning.webp",
  },
  {
    id: "engineer",
    name: "Engineer",
    tier: 3,
    description: "Show enemy equipment and scorestreaks.",
    icon: "/images/perks/engineer.webp",
  },
  {
    id: "tactical_mask",
    name: "Tactical Mask",
    tier: 3,
    description: "Reduce effects of tactical grenades.",
    icon: "/images/perks/tactical_mask.webp",
  },
  {
    id: "dead_silence",
    name: "Dead Silence",
    tier: 3,
    description: "Move silently.",
    icon: "/images/perks/dead_silence.webp",
  },
];

export const perksById = Object.fromEntries(
  perks.map((perk) => [perk.id, perk]),
) as Record<string, Perk>;

export function getPerksByTier(tier: PerkTier): Perk[] {
  return perks.filter((perk) => perk.tier === tier);
}
