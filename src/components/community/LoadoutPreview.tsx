import type { ClassBuild } from "@/types/class";
import { weaponsById } from "@/data/weapons";
import { attachmentsById } from "@/data/attachments";
import { perksById } from "@/data/perks";
import { equipmentById } from "@/data/equipment";
import { wildcardsById } from "@/data/wildcards";
import { getItemImageSrc } from "@/lib/icons";
import { countUsedPoints } from "@/lib/pick10";
import type { GameItem } from "@/types/class";
import type { ItemImageFolder } from "@/lib/icons";

function Chip({
  item,
  folder,
}: {
  item: GameItem;
  folder: ItemImageFolder;
}) {
  return (
    <span className="loadout-chip">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={getItemImageSrc(item, folder)} alt="" className="loadout-chip-icon" />
      <span>{item.name}</span>
    </span>
  );
}

function resolve(
  ids: (string | null)[],
  map: Record<string, GameItem | undefined>,
) {
  return ids
    .filter((id): id is string => Boolean(id))
    .map((id) => map[id])
    .filter((item): item is GameItem => Boolean(item));
}

export function LoadoutPreview({
  build,
  compact = false,
}: {
  build: ClassBuild;
  compact?: boolean;
}) {
  const primary = build.primaryWeaponId
    ? weaponsById[build.primaryWeaponId]
    : null;
  const secondary = build.secondaryWeaponId
    ? weaponsById[build.secondaryWeaponId]
    : null;
  const points = countUsedPoints(build);

  const attachments = resolve(
    [...build.primaryAttachmentIds, ...build.secondaryAttachmentIds],
    attachmentsById,
  );
  const perks = resolve(
    [...build.perk1Ids, ...build.perk2Ids, ...build.perk3Ids],
    perksById,
  );
  const equipment = resolve(
    [...build.lethalIds, ...build.tacticalIds],
    equipmentById,
  );
  const wildcards = resolve(
    build.wildcardIds,
    wildcardsById as Record<string, GameItem>,
  );

  return (
    <div className={`community-preview${compact ? " community-preview--compact" : ""}`}>
      <div className="community-preview-weapons">
        {primary ? <Chip item={primary} folder="weapons" /> : null}
        {secondary ? <Chip item={secondary} folder="weapons" /> : null}
        <span className="community-preview-points">{points}/10</span>
      </div>
      {!compact ? (
        <>
          {attachments.length ? (
            <div className="loadout-chip-row">
              {attachments.map((item) => (
                <Chip key={`a-${item.id}`} item={item} folder="attachments" />
              ))}
            </div>
          ) : null}
          {perks.length ? (
            <div className="loadout-chip-row">
              {perks.map((item) => (
                <Chip key={`p-${item.id}`} item={item} folder="perks" />
              ))}
            </div>
          ) : null}
          {equipment.length || wildcards.length ? (
            <div className="loadout-chip-row">
              {equipment.map((item) => (
                <Chip key={`e-${item.id}`} item={item} folder="equipment" />
              ))}
              {wildcards.map((item) => (
                <Chip key={`w-${item.id}`} item={item} folder="wildcards" />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
