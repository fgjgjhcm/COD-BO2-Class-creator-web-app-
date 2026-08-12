import type { MetadataRoute } from "next";
import { attachments } from "@/data/attachments";
import { equipment } from "@/data/equipment";
import { perks } from "@/data/perks";
import { weapons } from "@/data/weapons";
import { wildcards } from "@/data/wildcards";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/home`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/weapons`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/attachments`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/perks`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/equipment`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/wildcards`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guide/pick-10`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const weaponRoutes = weapons.map((weapon) => ({
    url: `${SITE_URL}/weapons/${weapon.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const attachmentRoutes = attachments.map((attachment) => ({
    url: `${SITE_URL}/attachments/${attachment.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const perkRoutes = perks.map((perk) => ({
    url: `${SITE_URL}/perks/${perk.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const equipmentRoutes = equipment.map((item) => ({
    url: `${SITE_URL}/equipment/${item.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const wildcardRoutes = wildcards.map((wildcard) => ({
    url: `${SITE_URL}/wildcards/${wildcard.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...weaponRoutes,
    ...attachmentRoutes,
    ...perkRoutes,
    ...equipmentRoutes,
    ...wildcardRoutes,
  ];
}
