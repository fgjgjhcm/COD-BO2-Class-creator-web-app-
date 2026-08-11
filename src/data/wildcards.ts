import type { Wildcard, WildcardId } from "@/types/class";

export const wildcards: Wildcard[] = [
  {
    id: "primary_gunfighter",
    name: "Primary Gunfighter",
    effect: "Take a third primary attachment.",
    description: "Wildcard",
    icon: "/images/wildcards/primary_gunfighter.webp",
  },
  {
    id: "secondary_gunfighter",
    name: "Secondary Gunfighter",
    effect: "Take a second secondary attachment.",
    description: "Wildcard",
    icon: "/images/wildcards/secondary_gunfighter.webp",
  },
  {
    id: "overkill",
    name: "Overkill",
    effect: "Take a primary weapon as your secondary.",
    description: "Wildcard",
    icon: "/images/wildcards/overkill.webp",
  },
  {
    id: "perk1_greed",
    name: "Perk 1 Greed",
    effect: "Take a second Perk 1.",
    description: "Wildcard",
    icon: "/images/wildcards/perk1_greed.webp",
  },
  {
    id: "perk2_greed",
    name: "Perk 2 Greed",
    effect: "Take a second Perk 2.",
    description: "Wildcard",
    icon: "/images/wildcards/perk2_greed.webp",
  },
  {
    id: "perk3_greed",
    name: "Perk 3 Greed",
    effect: "Take a second Perk 3.",
    description: "Wildcard",
    icon: "/images/wildcards/perk3_greed.webp",
  },
  {
    id: "danger_close",
    name: "Danger Close",
    effect: "Take a second lethal.",
    description: "Wildcard",
    icon: "/images/wildcards/danger_close.webp",
  },
  {
    id: "tactician",
    name: "Tactician",
    effect: "Replace lethal with a second tactical.",
    description: "Wildcard",
    icon: "/images/wildcards/tactician.webp",
  },
];

export const wildcardsById = Object.fromEntries(
  wildcards.map((wildcard) => [wildcard.id, wildcard]),
) as Record<WildcardId, Wildcard>;
