"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ClassBuild,
  GameItem,
  SelectorKind,
  SelectorTarget,
  Weapon,
  WeaponCategory,
} from "@/types/class";
import { weaponsById } from "@/data/weapons";
import {
  getAvailableItems,
  getItemSubtitle,
  getSelectorTitle,
  getWeaponCategoryLabel,
  groupWeaponsByCategory,
  isWeaponSelector,
} from "@/lib/items";
import { canAffordNewItem } from "@/lib/pick10";
import { ItemIcon } from "@/components/ItemIcon";
import type { ItemImageFolder } from "@/lib/icons";

interface ItemSelectorProps {
  open: boolean;
  target: SelectorTarget | null;
  build: ClassBuild;
  currentId: string | null;
  primaryWeapon?: Weapon;
  secondaryWeapon?: Weapon;
  onClose: () => void;
  onSelect: (id: string) => void;
  onClear: () => void;
}

function folderForKind(kind: SelectorKind): ItemImageFolder {
  switch (kind) {
    case "primaryWeapon":
    case "secondaryWeapon":
      return "weapons";
    case "primaryAttachment":
    case "secondaryAttachment":
      return "attachments";
    case "perk1":
    case "perk2":
    case "perk3":
      return "perks";
    case "lethal":
    case "tactical":
      return "equipment";
    case "wildcard":
      return "wildcards";
    default:
      return "weapons";
  }
}

function initialCategoryForOpen(
  browseKey: string | null,
  currentId: string | null,
): WeaponCategory | null {
  if (!browseKey || !currentId) return null;
  return weaponsById[currentId]?.category ?? null;
}

export function ItemSelector({
  open,
  target,
  build,
  currentId,
  primaryWeapon,
  secondaryWeapon,
  onClose,
  onSelect,
  onClear,
}: ItemSelectorProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const needsPoint = !currentId && !canAffordNewItem(build);

  const browseKey =
    open && target && isWeaponSelector(target.kind)
      ? `${target.kind}-${target.index}`
      : null;

  const [categoryState, setCategoryState] = useState<{
    key: string | null;
    category: WeaponCategory | null;
  }>({ key: null, category: null });

  // Adjust category drill-down when the open weapon selector changes.
  if (browseKey !== categoryState.key) {
    setCategoryState({
      key: browseKey,
      category: initialCategoryForOpen(browseKey, currentId),
    });
  }

  const weaponCategory = categoryState.category;
  const setWeaponCategory = (category: WeaponCategory | null) => {
    setCategoryState((prev) => ({ ...prev, category }));
  };

  const items = useMemo(() => {
    if (!target) return [] as GameItem[];
    return getAvailableItems(build, target, primaryWeapon, secondaryWeapon);
  }, [build, target, primaryWeapon, secondaryWeapon]);

  const weaponBrowse = browseKey !== null;
  const weaponGroups = useMemo(() => {
    if (!weaponBrowse) return [];
    return groupWeaponsByCategory(items as Weapon[]);
  }, [weaponBrowse, items]);

  const categoryWeapons = useMemo(() => {
    if (!weaponCategory) return [] as Weapon[];
    return (
      weaponGroups.find((group) => group.category === weaponCategory)?.weapons ??
      []
    );
  }, [weaponGroups, weaponCategory]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (weaponBrowse && weaponCategory) {
        setWeaponCategory(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, weaponBrowse, weaponCategory]);

  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open, target, weaponCategory]);

  if (!open || !target) return null;

  const folder = folderForKind(target.kind);
  const showingCategories = weaponBrowse && !weaponCategory;
  const showingWeaponList = weaponBrowse && !!weaponCategory;
  const listItems: GameItem[] = showingWeaponList
    ? categoryWeapons
    : weaponBrowse
      ? []
      : items;

  const title = showingWeaponList
    ? getWeaponCategoryLabel(weaponCategory)
    : getSelectorTitle(target.kind);

  const subtitle = needsPoint
    ? "No Pick 10 points remaining. Remove an item first."
    : showingCategories
      ? "Choose a weapon class."
      : showingWeaponList
        ? "Select a weapon — costs 1 point."
        : "Select an item — each costs 1 point.";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Close selector"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="selector-panel relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col outline-none md:max-h-[80vh] md:mx-4"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-4 py-4 md:px-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-orange-400">
              Create-a-Class
            </div>
            <h2 className="font-display text-2xl tracking-wide text-white md:text-3xl">
              {title}
            </h2>
            <p
              className={[
                "mt-1 text-sm",
                needsPoint ? "text-red-400" : "text-zinc-400",
              ].join(" ")}
            >
              {subtitle}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {showingWeaponList ? (
              <button
                type="button"
                onClick={() => setWeaponCategory(null)}
                className="border border-zinc-700 px-3 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300 transition hover:border-orange-500 hover:text-orange-400"
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="border border-zinc-700 px-3 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
          {showingCategories ? (
            weaponGroups.length === 0 ? (
              <div className="border border-dashed border-zinc-700 p-8 text-center text-zinc-500">
                No weapons available.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {weaponGroups.map((group) => {
                  const preview = group.weapons[0];
                  const containsSelected = group.weapons.some(
                    (weapon) => weapon.id === currentId,
                  );
                  return (
                    <button
                      key={group.category}
                      type="button"
                      onClick={() => setWeaponCategory(group.category)}
                      className={[
                        "selector-item group flex items-center gap-3 p-3 text-left transition hover:border-orange-500/60",
                        containsSelected ? "selector-item--selected" : "",
                      ].join(" ")}
                    >
                      <ItemIcon
                        item={preview}
                        folder="weapons"
                        size="lg"
                        className="!h-14 !w-28 shrink-0"
                        alt={group.label}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-lg tracking-wide text-white">
                          {group.label}
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                          {group.weapons.length} weapon
                          {group.weapons.length === 1 ? "" : "s"}
                        </div>
                      </div>
                      <div className="shrink-0 text-orange-400/80 transition group-hover:translate-x-0.5">
                        ›
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : listItems.length === 0 ? (
            <div className="border border-dashed border-zinc-700 p-8 text-center text-zinc-500">
              {target.kind.includes("Attachment")
                ? "Select a weapon before choosing attachments."
                : "No items available."}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {listItems.map((item) => {
                const selected = item.id === currentId;
                const disabled = needsPoint && !selected;
                const wide = folder === "weapons";
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(item.id)}
                    className={[
                      "selector-item group flex items-center gap-3 p-3 text-left transition",
                      selected ? "selector-item--selected" : "",
                      disabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:border-orange-500/60",
                    ].join(" ")}
                  >
                    <ItemIcon
                      item={item}
                      folder={folder}
                      size={wide ? "lg" : "md"}
                      className={wide ? "!h-14 !w-28 shrink-0" : "shrink-0"}
                      alt={item.name}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                        {getItemSubtitle(item)}
                      </div>
                      {"effect" in item && typeof item.effect === "string" ? (
                        <div className="mt-1 text-xs text-zinc-400">
                          {item.effect}
                        </div>
                      ) : null}
                    </div>
                    {selected ? (
                      <div className="ml-auto shrink-0 text-[10px] uppercase tracking-[0.2em] text-orange-400">
                        Equipped
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3 md:px-6">
          <button
            type="button"
            disabled={!currentId}
            onClick={onClear}
            className="text-xs uppercase tracking-[0.2em] text-zinc-400 transition hover:text-orange-400 disabled:opacity-30"
          >
            Remove Selection
          </button>
          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-600">
            {showingCategories
              ? `${weaponGroups.length} classes`
              : `${listItems.length} available`}
          </div>
        </div>
      </div>
    </div>
  );
}
