import type { GameItem } from "@/types/class";

export type ItemImageFolder =
  | "weapons"
  | "attachments"
  | "perks"
  | "equipment"
  | "wildcards";

/** Convention: /images/{folder}/{id}.svg — override with item.icon when needed. */
export function getItemImageSrc(
  item: Pick<GameItem, "id" | "icon">,
  folder: ItemImageFolder,
): string {
  if (item.icon) return item.icon;
  return `/images/${folder}/${item.id}.svg`;
}

export function inferImageFolder(item: GameItem): ItemImageFolder {
  if ("isPrimary" in item) return "weapons";
  if ("compatibleCategories" in item) return "attachments";
  if ("tier" in item) return "perks";
  if ("type" in item) return "equipment";
  if ("effect" in item) return "wildcards";
  return "weapons";
}
