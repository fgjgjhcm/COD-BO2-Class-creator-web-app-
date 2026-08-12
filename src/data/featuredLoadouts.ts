import type { ClassBuild, WildcardId } from "@/types/class";
import { createEmptyBuild, countUsedPoints, sanitizeBuild } from "@/lib/pick10";
import { SITE_URL } from "@/lib/site";
import { encodeBuild } from "@/lib/share";

export type FeaturedLoadoutGroup = "mode" | "playstyle" | "ragebait";

export interface FeaturedLoadoutDef {
  slug: string;
  name: string;
  tagline: string;
  /** Longer SEO body copy */
  description: string;
  group: FeaturedLoadoutGroup;
  /** Search intents this page should capture */
  goals: string[];
  seoTitle: string;
  seoDescription: string;
  streaksNote?: string;
  build: ClassBuild;
}

type BuildInput = {
  name: string;
  primaryWeaponId?: string | null;
  secondaryWeaponId?: string | null;
  primaryAttachmentIds?: string[];
  secondaryAttachmentIds?: string[];
  perk1Ids?: string[];
  perk2Ids?: string[];
  perk3Ids?: string[];
  lethalIds?: string[];
  tacticalIds?: string[];
  wildcardIds?: WildcardId[];
};

function pad(ids: string[] | undefined, length: number): (string | null)[] {
  const next: (string | null)[] = [...(ids ?? [])];
  while (next.length < length) next.push(null);
  return next.slice(0, length);
}

/** Build a sanitized Pick 10 class from a compact definition. */
export function defineBuild(input: BuildInput): ClassBuild {
  const build = sanitizeBuild({
    ...createEmptyBuild(input.name),
    name: input.name,
    primaryWeaponId: input.primaryWeaponId ?? null,
    secondaryWeaponId: input.secondaryWeaponId ?? null,
    primaryAttachmentIds: pad(input.primaryAttachmentIds, 3),
    secondaryAttachmentIds: pad(input.secondaryAttachmentIds, 2),
    perk1Ids: pad(input.perk1Ids, 2),
    perk2Ids: pad(input.perk2Ids, 2),
    perk3Ids: pad(input.perk3Ids, 2),
    lethalIds: pad(input.lethalIds, 2),
    tacticalIds: pad(input.tacticalIds, 2),
    wildcardIds: pad(input.wildcardIds, 4) as (string | null)[],
  });

  const points = countUsedPoints(build);
  if (points > 10) {
    throw new Error(`Loadout "${input.name}" uses ${points}/10 Pick 10 points`);
  }

  return build;
}

export const FEATURED_LOADOUTS: FeaturedLoadoutDef[] = [
  // —— Game mode / goal pages (SEO-first) ——
  {
    slug: "search-and-destroy",
    name: "One Life Lease",
    tagline: "Quiet feet. Loud trades. No respawns.",
    description:
      "Best Search and Destroy class for Black Ops 2: stay off the UAV, win the first gunfight, and plant or retake without advertising every footstep. Built for SnD / S&D lobbies where one death ends the round.",
    group: "mode",
    goals: ["search and destroy", "snd", "s&d", "bomb"],
    seoTitle: "Best Search and Destroy Class — BO2 SnD Loadout",
    seoDescription:
      "BO2 Search and Destroy class with MSMC, Ghost, Dead Silence, and smoke. Open it in the Pick 10 builder.",
    build: defineBuild({
      name: "One Life Lease",
      primaryWeaponId: "msmc",
      primaryAttachmentIds: ["long_barrel", "fast_mag"],
      secondaryWeaponId: "five_seven",
      perk1Ids: ["ghost"],
      perk2Ids: ["toughness"],
      perk3Ids: ["dead_silence"],
      lethalIds: ["semtex"],
      tacticalIds: ["smoke_grenade"],
    }),
  },
  {
    slug: "nuclear",
    name: "30 Before Lobby Dies",
    tagline: "Hardline math for a 30-kill Nuclear.",
    description:
      "Best Black Ops 2 class for nukes / nuclears: stack Hardline and Scavenger, keep the AN-94 feeding, and chase the 30-kill Nuclear medal. Built for high-killstreak pub stomps when the lobby still has enough bodies left.",
    group: "mode",
    goals: ["nuclear", "nuke", "nukes", "nuclears", "30 kill", "killstreak"],
    seoTitle: "Best Class for Nukes — BO2 Nuclear Loadout",
    seoDescription:
      "BO2 nuclear class for a 30-kill streak: AN-94, Hardline, Scavenger, and Perk Greed. Open in the Pick 10 builder.",
    streaksNote:
      "Suggested streaks: UAV → Orbital VSAT → Swarm (or CUAV / Lightning Strike / Stealth Chopper).",
    build: defineBuild({
      name: "30 Before Lobby Dies",
      primaryWeaponId: "an_94",
      primaryAttachmentIds: ["stock", "fast_mag"],
      perk1Ids: ["lightweight", "hardline"],
      perk2Ids: ["toughness", "scavenger"],
      perk3Ids: ["dexterity"],
      wildcardIds: ["perk1_greed", "perk2_greed"],
    }),
  },
  {
    slug: "domination",
    name: "B Flag HOA",
    tagline: "Nade spam is a lifestyle. Flak is the HOA fee.",
    description:
      "Best Domination class in Black Ops 2 for holding B and surviving explosive spam. Flak Jacket, Trophy System, and a hard-hitting SCAR-H keep you planted on the point.",
    group: "mode",
    goals: ["domination", "dom", "objective", "b flag"],
    seoTitle: "Best Domination Class — BO2 Dom Loadout",
    seoDescription:
      "BO2 Domination loadout with SCAR-H, Flak Jacket, Claymore, and Trophy System. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "B Flag HOA",
      primaryWeaponId: "scar_h",
      primaryAttachmentIds: ["grip", "fast_mag"],
      secondaryWeaponId: "b23r",
      perk1Ids: ["flak_jacket"],
      perk2Ids: ["toughness"],
      perk3Ids: ["tactical_mask"],
      lethalIds: ["claymore"],
      tacticalIds: ["trophy_system"],
    }),
  },
  {
    slug: "hardpoint",
    name: "Rotator Rights",
    tagline: "Sprint the rotate. Stun the stack. Leave.",
    description:
      "Best Hardpoint / Headquarters style class for Black Ops 2: mobility to rotate, Tactical Mask for the stun party, and an MP7 that cleans hills up close.",
    group: "mode",
    goals: ["hardpoint", "headquarters", "hq", "hill"],
    seoTitle: "Best Hardpoint Class — BO2 HQ / Hill Loadout",
    seoDescription:
      "BO2 Hardpoint class with MP7, Lightweight, Extreme Conditioning, and Tactical Mask. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Rotator Rights",
      primaryWeaponId: "mp7",
      primaryAttachmentIds: ["suppressor", "fast_mag"],
      perk1Ids: ["lightweight"],
      perk2Ids: ["toughness"],
      perk3Ids: ["extreme_conditioning", "tactical_mask"],
      lethalIds: ["semtex"],
      tacticalIds: ["concussion"],
      wildcardIds: ["perk3_greed"],
    }),
  },
  {
    slug: "kill-confirmed",
    name: "Tag Tax",
    tagline: "Collect tags. Collect salty messages.",
    description:
      "Best Kill Confirmed class for Black Ops 2: MSMC speed to confirm tags and win the trade before someone yoinks your pile.",
    group: "mode",
    goals: ["kill confirmed", "kc", "tags"],
    seoTitle: "Best Kill Confirmed Class — BO2 KC Loadout",
    seoDescription:
      "BO2 Kill Confirmed loadout with MSMC, Lightweight, Extreme Conditioning, and Primary Gunfighter. Open in the builder.",
    build: defineBuild({
      name: "Tag Tax",
      primaryWeaponId: "msmc",
      primaryAttachmentIds: ["long_barrel", "quickdraw", "fast_mag"],
      perk1Ids: ["lightweight"],
      perk2Ids: ["toughness"],
      perk3Ids: ["extreme_conditioning"],
      lethalIds: ["semtex"],
      tacticalIds: ["concussion"],
      wildcardIds: ["primary_gunfighter"],
    }),
  },
  {
    slug: "free-for-all",
    name: "Everyone's Problem",
    tagline: "No teammates. No excuses. Ghost on.",
    description:
      "Best Free-for-All class for Black Ops 2: suppressed SWAT-556, Ghost, and Dead Silence so the whole lobby is hunting you and failing.",
    group: "mode",
    goals: ["free for all", "ffa"],
    seoTitle: "Best Free-for-All Class — BO2 FFA Loadout",
    seoDescription:
      "BO2 Free-for-All class with SWAT-556, Suppressor, Ghost, and Dead Silence. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Everyone's Problem",
      primaryWeaponId: "swat_556",
      primaryAttachmentIds: ["suppressor", "fast_mag", "stock"],
      perk1Ids: ["ghost"],
      perk2Ids: ["toughness"],
      perk3Ids: ["dead_silence"],
      lethalIds: ["semtex"],
      tacticalIds: ["flashbang"],
      wildcardIds: ["primary_gunfighter"],
    }),
  },
  {
    slug: "capture-the-flag",
    name: "Flag Courier Fraud",
    tagline: "Illegal amounts of sprint.",
    description:
      "Best Capture the Flag class for Black Ops 2: PDW speed, Lightweight, and Extreme Conditioning to steal the flag and disappear before mid-map exists.",
    group: "mode",
    goals: ["capture the flag", "ctf", "flag"],
    seoTitle: "Best Capture the Flag Class — BO2 CTF Loadout",
    seoDescription:
      "BO2 CTF class with PDW-57, Lightweight, and Extreme Conditioning for flag runs. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Flag Courier Fraud",
      primaryWeaponId: "pdw_57",
      primaryAttachmentIds: ["extended_mag", "stock"],
      perk1Ids: ["lightweight"],
      perk2Ids: ["toughness"],
      perk3Ids: ["extreme_conditioning"],
      lethalIds: ["semtex"],
      tacticalIds: ["concussion"],
    }),
  },
  {
    slug: "hardcore",
    name: "One Bullet Resume",
    tagline: "TTK already filed the paperwork.",
    description:
      "Best Hardcore class for Black Ops 2: suppressed FAL OSW, Ghost, and Dead Silence. In Hardcore, positioning and radar discipline beat attachment bloat.",
    group: "mode",
    goals: ["hardcore", "hc"],
    seoTitle: "Best Hardcore Class — BO2 HC Loadout",
    seoDescription:
      "BO2 Hardcore loadout with FAL OSW, Suppressor, Ghost, and Dead Silence. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "One Bullet Resume",
      primaryWeaponId: "fal_osw",
      primaryAttachmentIds: ["suppressor", "fast_mag"],
      perk1Ids: ["ghost"],
      perk2Ids: ["fast_hands"],
      perk3Ids: ["dead_silence"],
      lethalIds: ["semtex"],
      tacticalIds: ["smoke_grenade"],
    }),
  },
  {
    slug: "tryhard",
    name: "No Excuses",
    tagline: "The default answer to “what’s meta?”",
    description:
      "Best overall tryhard / meta class for Black Ops 2 pubs: AN-94 with Gunfighter attachments, Ghost, Toughness, and Dexterity. The clean Pick 10 when you just want to win gunfights.",
    group: "mode",
    goals: ["best class", "meta", "tryhard", "ranked"],
    seoTitle: "Best Meta Class — BO2 Tryhard Loadout",
    seoDescription:
      "BO2 meta tryhard class with AN-94, Suppressor, Stock, Extended Clip, and Ghost. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "No Excuses",
      primaryWeaponId: "an_94",
      primaryAttachmentIds: ["suppressor", "stock", "extended_mag"],
      perk1Ids: ["ghost"],
      perk2Ids: ["toughness"],
      perk3Ids: ["dexterity"],
      lethalIds: ["semtex"],
      tacticalIds: ["concussion"],
      wildcardIds: ["primary_gunfighter"],
    }),
  },

  // —— Playstyle ——
  {
    slug: "lobby-lease",
    name: "Lobby Lease",
    tagline: "The SMG that still collects rent.",
    description:
      "Classic MSMC rush class for Black Ops 2. Long Barrel, Quickdraw, Fast Mag, and Perk 2 Greed — the close-range lease agreement every Hijacked lobby signs.",
    group: "playstyle",
    goals: ["msmc", "smg", "rush", "aggressive"],
    seoTitle: "Lobby Lease — Best MSMC Rush Class",
    seoDescription:
      "BO2 MSMC rush loadout with Long Barrel, Quickdraw, Fast Mag, Lightweight, and Toughness. Open in the builder.",
    build: defineBuild({
      name: "Lobby Lease",
      primaryWeaponId: "msmc",
      primaryAttachmentIds: ["long_barrel", "quickdraw", "fast_mag"],
      perk1Ids: ["lightweight"],
      perk2Ids: ["toughness", "scavenger"],
      perk3Ids: ["tactical_mask"],
      wildcardIds: ["primary_gunfighter", "perk2_greed"],
    }),
  },
  {
    slug: "silent-treatment",
    name: "Silent Treatment",
    tagline: "They never heard the second magazine.",
    description:
      "Stealth MP7 class for Black Ops 2: Suppressor, Ghost, Dead Silence, and a KAP-40 backup. Built for flanks and people who refuse to show on the minimap.",
    group: "playstyle",
    goals: ["stealth", "silencer", "ninja", "mp7"],
    seoTitle: "Silent Treatment — Stealth MP7 Class",
    seoDescription:
      "BO2 stealth MP7 class with Suppressor, Ghost, and Dead Silence. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Silent Treatment",
      primaryWeaponId: "mp7",
      primaryAttachmentIds: ["suppressor", "fast_mag"],
      secondaryWeaponId: "kap_40",
      secondaryAttachmentIds: ["laser"],
      perk1Ids: ["ghost"],
      perk2Ids: ["scavenger"],
      perk3Ids: ["dead_silence"],
      lethalIds: ["semtex"],
      tacticalIds: ["concussion"],
    }),
  },
  {
    slug: "two-shot-tax",
    name: "Two-Shot Tax",
    tagline: "AN-94 opening burst collects payment.",
    description:
      "Proven AN-94 all-map class for Black Ops 2. Suppressor, Stock, Extended Clip, and Ghost — the assault rifle tax bracket for mid-range lanes.",
    group: "playstyle",
    goals: ["an-94", "assault rifle", "all map"],
    seoTitle: "Two-Shot Tax — Best AN-94 Class",
    seoDescription:
      "BO2 AN-94 class with Suppressor, Stock, Extended Clip, and Ghost. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Two-Shot Tax",
      primaryWeaponId: "an_94",
      primaryAttachmentIds: ["suppressor", "stock", "extended_mag"],
      perk1Ids: ["ghost"],
      perk2Ids: ["toughness"],
      perk3Ids: ["dexterity"],
      lethalIds: ["semtex"],
      tacticalIds: ["concussion"],
      wildcardIds: ["primary_gunfighter"],
    }),
  },
  {
    slug: "three-round-resume",
    name: "Three-Round Resume",
    tagline: "Burst discipline. Mid-map unemployment line.",
    description:
      "SWAT-556 burst class for Black Ops 2 lane control. Suppressor, Fast Mag, Stock — for players who can actually land bursts.",
    group: "playstyle",
    goals: ["swat", "burst", "lane"],
    seoTitle: "Three-Round Resume — SWAT-556 Burst Class",
    seoDescription:
      "BO2 SWAT-556 burst loadout with Suppressor, Fast Mag, and Stock. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Three-Round Resume",
      primaryWeaponId: "swat_556",
      primaryAttachmentIds: ["suppressor", "fast_mag", "stock"],
      perk1Ids: ["ghost"],
      perk2Ids: ["toughness"],
      perk3Ids: ["dexterity"],
      lethalIds: ["semtex"],
      tacticalIds: ["concussion"],
      wildcardIds: ["primary_gunfighter"],
    }),
  },
  {
    slug: "trigger-finger-therapy",
    name: "Trigger Finger Therapy",
    tagline: "Semi-auto. Pure skill. Pure salt.",
    description:
      "FAL OSW class for Black Ops 2 tap-fire demons. Target Finder and Fast Mag with a B23R secondary for when the therapy session gets close.",
    group: "playstyle",
    goals: ["fal", "semi auto", "tap fire"],
    seoTitle: "Trigger Finger Therapy — FAL OSW Class",
    seoDescription:
      "BO2 FAL OSW class with Target Finder, Fast Mag, and B23R. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Trigger Finger Therapy",
      primaryWeaponId: "fal_osw",
      primaryAttachmentIds: ["target_finder", "fast_mag"],
      secondaryWeaponId: "b23r",
      secondaryAttachmentIds: ["laser"],
      perk1Ids: ["lightweight"],
      perk2Ids: ["toughness"],
      perk3Ids: ["dexterity"],
      lethalIds: ["semtex"],
      tacticalIds: ["flashbang"],
    }),
  },
  {
    slug: "quickscopers-alibi",
    name: "Quickscoper's Alibi",
    tagline: "“I was holding an angle.” Sure.",
    description:
      "Ballista sniper class for Black Ops 2 with Ballistics CPU, Fast Mag, and a B23R panic button. Dexterity plus Dead Silence for the classic quickscope alibi.",
    group: "playstyle",
    goals: ["sniper", "ballista", "quickscope"],
    seoTitle: "Quickscoper's Alibi — Best Ballista Class",
    seoDescription:
      "BO2 Ballista sniper class with Ballistics CPU, Fast Mag, and B23R. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Quickscoper's Alibi",
      primaryWeaponId: "ballista",
      primaryAttachmentIds: ["ballistics_cpu", "fast_mag"],
      secondaryWeaponId: "b23r",
      secondaryAttachmentIds: ["extended_mag"],
      perk1Ids: ["hardline"],
      perk2Ids: ["toughness"],
      perk3Ids: ["dexterity", "dead_silence"],
      wildcardIds: ["perk3_greed"],
    }),
  },
  {
    slug: "hipfire-apology",
    name: "Hipfire Apology",
    tagline: "Sorry about your K/D.",
    description:
      "Remington 870 MCS shotgun class for Black Ops 2. Laser Sight and Long Barrel for hallway negotiations that end abruptly.",
    group: "playstyle",
    goals: ["shotgun", "remington", "hipfire"],
    seoTitle: "Hipfire Apology — Remington 870 Class",
    seoDescription:
      "BO2 Remington 870 MCS class with Laser Sight and Long Barrel. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Hipfire Apology",
      primaryWeaponId: "remington_870_mcs",
      primaryAttachmentIds: ["laser", "long_barrel"],
      secondaryWeaponId: "five_seven",
      perk1Ids: ["lightweight"],
      perk2Ids: ["toughness"],
      perk3Ids: ["dexterity"],
      lethalIds: ["semtex"],
      tacticalIds: ["concussion"],
    }),
  },

  // —— Rage bait ——
  {
    slug: "human-traffic-cone",
    name: "Human Traffic Cone",
    tagline: "Walks into your lane. Files a complaint.",
    description:
      "Assault Shield rage-bait class for Black Ops 2. KAP-40, double Bettys, Shock Charge, and Danger Close — peak reportable objective play.",
    group: "ragebait",
    goals: ["assault shield", "shield", "camping", "troll"],
    seoTitle: "Human Traffic Cone — Assault Shield Rage Class",
    seoDescription:
      "BO2 Assault Shield class with KAP-40, Bouncing Bettys, and Shock Charge. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Human Traffic Cone",
      primaryWeaponId: "assault_shield",
      secondaryWeaponId: "kap_40",
      secondaryAttachmentIds: ["extended_mag"],
      perk1Ids: ["flak_jacket"],
      perk2Ids: ["toughness"],
      perk3Ids: ["tactical_mask"],
      lethalIds: ["bouncing_betty", "bouncing_betty"],
      tacticalIds: ["shock_charge"],
      wildcardIds: ["danger_close"],
    }),
  },
  {
    slug: "cowards-cape",
    name: "Coward's Cape",
    tagline: "Gun in front. Excuse on your spine.",
    description:
      "Overkill MSMC with Assault Shield on the back — the classic Black Ops 2 coward meta. Sprint in, ignore the backshots, pretend it was strategy.",
    group: "ragebait",
    goals: ["overkill", "shield back", "coward"],
    seoTitle: "Coward's Cape — Overkill Shield Back Class",
    seoDescription:
      "BO2 Overkill class with MSMC and Assault Shield on your back. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Coward's Cape",
      primaryWeaponId: "msmc",
      primaryAttachmentIds: ["long_barrel", "fast_mag"],
      secondaryWeaponId: "assault_shield",
      perk1Ids: ["lightweight"],
      perk2Ids: ["toughness"],
      perk3Ids: ["extreme_conditioning"],
      lethalIds: ["semtex"],
      tacticalIds: ["concussion"],
      wildcardIds: ["overkill"],
    }),
  },
  {
    slug: "site-closed-hoa",
    name: "Site Closed (HOA)",
    tagline: "Plant denial with a clipboard energy.",
    description:
      "Search and Destroy / Domination shield camping class. Plant the Bettys, drop the Shock Charge, and tell the enemy the site is closed for renovations.",
    group: "ragebait",
    goals: ["shield camp", "snd shield", "site lock"],
    seoTitle: "Site Closed (HOA) — Shield Camp Class",
    seoDescription:
      "BO2 Assault Shield camping class with C4 and EMP for site denial. Open in the Pick 10 builder.",
    build: defineBuild({
      name: "Site Closed (HOA)",
      primaryWeaponId: "assault_shield",
      secondaryWeaponId: "b23r",
      perk1Ids: ["flak_jacket"],
      perk2Ids: ["fast_hands"],
      perk3Ids: ["engineer"],
      lethalIds: ["c4"],
      tacticalIds: ["emp_grenade"],
    }),
  },
];

export const featuredLoadoutsBySlug = Object.fromEntries(
  FEATURED_LOADOUTS.map((loadout) => [loadout.slug, loadout]),
) as Record<string, FeaturedLoadoutDef>;

export function getFeaturedLoadoutsByGroup(group: FeaturedLoadoutGroup) {
  return FEATURED_LOADOUTS.filter((loadout) => loadout.group === group);
}

export function getBuilderHref(loadout: FeaturedLoadoutDef): string {
  return `/builder?c=${encodeBuild(loadout.build)}`;
}

export function getAbsoluteBuilderHref(loadout: FeaturedLoadoutDef): string {
  return `${SITE_URL}${getBuilderHref(loadout)}`;
}

export const LOADOUT_GROUP_LABELS: Record<FeaturedLoadoutGroup, string> = {
  mode: "By game mode",
  playstyle: "By playstyle",
  ragebait: "Rage bait",
};
