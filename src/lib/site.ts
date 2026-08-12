export const SITE_URL = "https://www.bo2loadouts.com";
export const SITE_NAME = "BO2 Loadouts";
/** Display brand in the SEO header */
export const SITE_DOMAIN = "bo2loadouts.com";
export const SITE_ICON = "/icon.png";

/** Top-bar destinations (not arsenal reference) */
export const SEO_HUB_NAV = [
  {
    href: "/community",
    label: "Community",
    icon: "/images/prestige2.png",
    glow: "prestige" as const,
  },
  {
    href: "/zombies",
    label: "Zombies",
    icon: "/images/weapons/pack-a-punch.webp",
    glow: "pap" as const,
  },
] as const;

export const SEO_NAV = [
  { href: "/loadouts", label: "Loadouts", blurb: "Mode and playstyle class setups" },
  { href: "/weapons", label: "Weapons", blurb: "ARs, SMGs, LMGs, snipers, and more" },
  { href: "/attachments", label: "Attachments", blurb: "Optics, barrels, mags, and stocks" },
  { href: "/perks", label: "Perks", blurb: "Perk 1, 2, and 3 for Pick 10" },
  { href: "/equipment", label: "Equipment", blurb: "Lethals and tacticals" },
  { href: "/wildcards", label: "Wildcards", blurb: "Gunfighter, Overkill, Greed, and more" },
  { href: "/guide/pick-10", label: "Guide", blurb: "How the Pick 10 system works" },
  { href: "/about", label: "About", blurb: "Fan project disclaimer" },
] as const;
