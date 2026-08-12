export const SITE_URL = "https://bo2loadouts.com";
export const SITE_NAME = "BO2 Loadouts";
/** Display brand in the SEO header */
export const SITE_DOMAIN = "bo2loadouts.com";
export const SITE_ICON = "/icon.png";

export const SEO_NAV = [
  { href: "/weapons", label: "Weapons", blurb: "ARs, SMGs, LMGs, snipers, and more" },
  { href: "/attachments", label: "Attachments", blurb: "Optics, barrels, mags, and stocks" },
  { href: "/perks", label: "Perks", blurb: "Perk 1, 2, and 3 for Pick 10" },
  { href: "/equipment", label: "Equipment", blurb: "Lethals and tacticals" },
  { href: "/wildcards", label: "Wildcards", blurb: "Gunfighter, Overkill, Greed, and more" },
  {
    href: "/zombies",
    label: "Zombies Leaderboards",
    blurb: "BO2 high-round leaderboards by map",
  },
  { href: "/guide/pick-10", label: "Guide", blurb: "How the Pick 10 system works" },
  { href: "/about", label: "About", blurb: "Fan project disclaimer" },
] as const;
