"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClassBuild, SelectorTarget, WildcardId } from "@/types/class";
import { MAX_LOADOUT_SLOTS, PICK_10_MAX } from "@/types/class";
import { attachmentsById, ATTACHMENT_CONFLICTS } from "@/data/attachments";
import { weaponsById } from "@/data/weapons";
import {
  canAffordNewItem,
  countUsedPoints,
  createEmptyBuild,
  getActiveWildcards,
  getRemainingPoints,
  getSlotLimits,
  sanitizeBuild,
} from "@/lib/pick10";
import {
  clearAllLoadouts as emptyAllLoadouts,
  clearLoadoutSlot,
  defaultLoadoutName,
  isBuildEmpty,
  loadLoadoutsState,
  saveLoadoutsState,
} from "@/lib/storage";
import { buildShareUrl, readBuildFromSearchParams } from "@/lib/share";
import { celebrateEasterEggUnlock } from "@/lib/uiSound";
import { isIceStaffClassName } from "@/lib/easterEggs";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { parseClassBuild } from "@/lib/community/validate";
import type { ClassBuild as ClassBuildType } from "@/types/class";

async function fetchCommunityBuild(
  id: string,
): Promise<ClassBuildType | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("loadouts")
      .select("loadout_data, title")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const parsed = parseClassBuild(data.loadout_data);
    if (!parsed) return null;
    return {
      ...parsed,
      name: data.title?.slice(0, 32) || parsed.name,
    };
  } catch {
    return null;
  }
}

function replaceAt(
  list: (string | null)[],
  index: number,
  value: string | null,
): (string | null)[] {
  const next = [...list];
  next[index] = value;
  return next;
}

export function useClassBuild() {
  const [slots, setSlots] = useState<ClassBuild[]>(() =>
    Array.from({ length: MAX_LOADOUT_SLOTS }, (_, index) =>
      createEmptyBuild(defaultLoadoutName(index)),
    ),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [selector, setSelector] = useState<SelectorTarget | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [remixOfId, setRemixOfId] = useState<string | null>(null);
  const [wantPublish, setWantPublish] = useState(false);

  const build = slots[activeIndex] ?? createEmptyBuild(defaultLoadoutName(0));

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = readBuildFromSearchParams(params);
    const communityId = params.get("community");
    const remix = params.get("remix") === "1";
    const publish = params.get("publish") === "1";
    const stored = loadLoadoutsState();
    const nextSlots = [...stored.slots];
    let nextActive = stored.activeIndex;

    const startedAt = performance.now();
    const minSplashMs = 700;

    void (async () => {
      let communityBuild: ClassBuildType | null = null;
      if (communityId) {
        communityBuild = await fetchCommunityBuild(communityId);
      }

      // Priority: community id > ?c= share payload > local storage
      if (communityBuild) {
        nextSlots[nextActive] = sanitizeBuild({
          ...createEmptyBuild(defaultLoadoutName(nextActive)),
          ...communityBuild,
        });
        if (remix) {
          setRemixOfId(communityId);
        }
      } else if (fromUrl) {
        nextSlots[nextActive] = sanitizeBuild({
          ...createEmptyBuild(defaultLoadoutName(nextActive)),
          ...fromUrl,
        });
      }

      if (publish) setWantPublish(true);

      if (cancelled) return;

      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, minSplashMs - elapsed);
      window.setTimeout(() => {
        if (cancelled) return;
        setSlots(nextSlots);
        setActiveIndex(nextActive);
        setHydrated(true);
      }, remaining);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveLoadoutsState({ activeIndex, slots });
  }, [slots, activeIndex, hydrated]);

  // Nuke EE: unlock when Pick 10 points across all 5 classes total 30+.
  useEffect(() => {
    if (!hydrated) return;
    const total = slots.reduce((sum, slot) => sum + countUsedPoints(slot), 0);
    if (total >= 30) {
      celebrateEasterEggUnlock("nuke_points");
    }
  }, [slots, hydrated]);

  // Ice Staff EE: unlock when any saved class is named after the Origins staff.
  useEffect(() => {
    if (!hydrated) return;
    if (slots.some((slot) => isIceStaffClassName(slot.name))) {
      celebrateEasterEggUnlock("ice_staff");
    }
  }, [slots, hydrated]);

  const usedPoints = useMemo(() => countUsedPoints(build), [build]);
  const remainingPoints = useMemo(() => getRemainingPoints(build), [build]);
  const limits = useMemo(() => getSlotLimits(build), [build]);
  const activeWildcards = useMemo(() => getActiveWildcards(build), [build]);

  const updateBuild = useCallback(
    (updater: (prev: ClassBuild) => ClassBuild) => {
      setSlots((prevSlots) => {
        const nextSlots = [...prevSlots];
        const current =
          nextSlots[activeIndex] ??
          createEmptyBuild(defaultLoadoutName(activeIndex));
        nextSlots[activeIndex] = sanitizeBuild(updater(current));
        return nextSlots;
      });
    },
    [activeIndex],
  );

  const setName = useCallback(
    (name: string) => {
      updateBuild((prev) => ({ ...prev, name }));
    },
    [updateBuild],
  );

  const selectLoadoutSlot = useCallback((index: number) => {
    const safeIndex = Math.min(
      MAX_LOADOUT_SLOTS - 1,
      Math.max(0, Math.floor(index)),
    );
    setActiveIndex(safeIndex);
    setSelector(null);
    setShareMessage(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  const resetClass = useCallback(() => {
    setSlots((prevSlots) => {
      const next = clearLoadoutSlot(
        { activeIndex, slots: prevSlots },
        activeIndex,
      );
      return next.slots;
    });
    setSelector(null);
    setShareMessage(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.pathname);
    }
  }, [activeIndex]);

  const clearAllLoadouts = useCallback(() => {
    const cleared = emptyAllLoadouts();
    setSlots(cleared.slots);
    setActiveIndex(cleared.activeIndex);
    setSelector(null);
    setShareMessage(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.pathname);
    }
  }, []);

  const openSelector = useCallback((target: SelectorTarget) => {
    setSelector(target);
  }, []);

  const closeSelector = useCallback(() => {
    setSelector(null);
  }, []);

  const clearSelection = useCallback(
    (target: SelectorTarget) => {
      updateBuild((prev) => {
        switch (target.kind) {
          case "primaryWeapon":
            return {
              ...prev,
              primaryWeaponId: null,
              primaryAttachmentIds: prev.primaryAttachmentIds.map(() => null),
            };
          case "secondaryWeapon":
            return {
              ...prev,
              secondaryWeaponId: null,
              secondaryAttachmentIds: prev.secondaryAttachmentIds.map(
                () => null,
              ),
            };
          case "primaryAttachment":
            return {
              ...prev,
              primaryAttachmentIds: replaceAt(
                prev.primaryAttachmentIds,
                target.index,
                null,
              ),
            };
          case "secondaryAttachment":
            return {
              ...prev,
              secondaryAttachmentIds: replaceAt(
                prev.secondaryAttachmentIds,
                target.index,
                null,
              ),
            };
          case "perk1":
            return {
              ...prev,
              perk1Ids: replaceAt(prev.perk1Ids, target.index, null),
            };
          case "perk2":
            return {
              ...prev,
              perk2Ids: replaceAt(prev.perk2Ids, target.index, null),
            };
          case "perk3":
            return {
              ...prev,
              perk3Ids: replaceAt(prev.perk3Ids, target.index, null),
            };
          case "lethal":
            return {
              ...prev,
              lethalIds: replaceAt(prev.lethalIds, target.index, null),
            };
          case "tactical":
            return {
              ...prev,
              tacticalIds: replaceAt(prev.tacticalIds, target.index, null),
            };
          case "wildcard":
            return {
              ...prev,
              wildcardIds: replaceAt(prev.wildcardIds, target.index, null),
            };
          default:
            return prev;
        }
      });
    },
    [updateBuild],
  );

  const getCurrentId = useCallback(
    (target: SelectorTarget): string | null => {
      switch (target.kind) {
        case "primaryWeapon":
          return build.primaryWeaponId;
        case "secondaryWeapon":
          return build.secondaryWeaponId;
        case "primaryAttachment":
          return build.primaryAttachmentIds[target.index] ?? null;
        case "secondaryAttachment":
          return build.secondaryAttachmentIds[target.index] ?? null;
        case "perk1":
          return build.perk1Ids[target.index] ?? null;
        case "perk2":
          return build.perk2Ids[target.index] ?? null;
        case "perk3":
          return build.perk3Ids[target.index] ?? null;
        case "lethal":
          return build.lethalIds[target.index] ?? null;
        case "tactical":
          return build.tacticalIds[target.index] ?? null;
        case "wildcard":
          return build.wildcardIds[target.index] ?? null;
        default:
          return null;
      }
    },
    [build],
  );

  const selectItem = useCallback(
    (target: SelectorTarget, itemId: string) => {
      updateBuild((prev) => {
        const currentId = (() => {
          switch (target.kind) {
            case "primaryWeapon":
              return prev.primaryWeaponId;
            case "secondaryWeapon":
              return prev.secondaryWeaponId;
            case "primaryAttachment":
              return prev.primaryAttachmentIds[target.index] ?? null;
            case "secondaryAttachment":
              return prev.secondaryAttachmentIds[target.index] ?? null;
            case "perk1":
              return prev.perk1Ids[target.index] ?? null;
            case "perk2":
              return prev.perk2Ids[target.index] ?? null;
            case "perk3":
              return prev.perk3Ids[target.index] ?? null;
            case "lethal":
              return prev.lethalIds[target.index] ?? null;
            case "tactical":
              return prev.tacticalIds[target.index] ?? null;
            case "wildcard":
              return prev.wildcardIds[target.index] ?? null;
            default:
              return null;
          }
        })();

        if (!currentId && !canAffordNewItem(prev)) {
          return prev;
        }

        switch (target.kind) {
          case "primaryWeapon": {
            const changed = prev.primaryWeaponId !== itemId;
            return {
              ...prev,
              primaryWeaponId: itemId,
              primaryAttachmentIds: changed
                ? prev.primaryAttachmentIds.map(() => null)
                : prev.primaryAttachmentIds,
            };
          }
          case "secondaryWeapon": {
            const changed = prev.secondaryWeaponId !== itemId;
            return {
              ...prev,
              secondaryWeaponId: itemId,
              secondaryAttachmentIds: changed
                ? prev.secondaryAttachmentIds.map(() => null)
                : prev.secondaryAttachmentIds,
            };
          }
          case "primaryAttachment": {
            const attachment = attachmentsById[itemId];
            if (!attachment) return prev;
            const blocked = prev.primaryAttachmentIds.some((id, i) => {
              if (i === target.index || !id) return false;
              if (id === itemId) return true;
              if (
                id === "dual_wield" ||
                itemId === "dual_wield" ||
                ATTACHMENT_CONFLICTS.some(
                  ([a, b]) =>
                    (a === id && b === itemId) || (a === itemId && b === id),
                )
              ) {
                return true;
              }
              const other = attachmentsById[id];
              return (
                !!other &&
                attachment.category === other.category &&
                attachment.category !== "other"
              );
            });
            if (blocked) return prev;
            return {
              ...prev,
              primaryAttachmentIds: replaceAt(
                prev.primaryAttachmentIds,
                target.index,
                itemId,
              ),
            };
          }
          case "secondaryAttachment": {
            const attachment = attachmentsById[itemId];
            if (!attachment) return prev;
            const blocked = prev.secondaryAttachmentIds.some((id, i) => {
              if (i === target.index || !id) return false;
              if (id === itemId) return true;
              if (
                id === "dual_wield" ||
                itemId === "dual_wield" ||
                ATTACHMENT_CONFLICTS.some(
                  ([a, b]) =>
                    (a === id && b === itemId) || (a === itemId && b === id),
                )
              ) {
                return true;
              }
              const other = attachmentsById[id];
              return (
                !!other &&
                attachment.category === other.category &&
                attachment.category !== "other"
              );
            });
            if (blocked) return prev;
            return {
              ...prev,
              secondaryAttachmentIds: replaceAt(
                prev.secondaryAttachmentIds,
                target.index,
                itemId,
              ),
            };
          }
          case "perk1": {
            if (
              prev.perk1Ids.some((id, i) => i !== target.index && id === itemId)
            ) {
              return prev;
            }
            return {
              ...prev,
              perk1Ids: replaceAt(prev.perk1Ids, target.index, itemId),
            };
          }
          case "perk2": {
            if (
              prev.perk2Ids.some((id, i) => i !== target.index && id === itemId)
            ) {
              return prev;
            }
            return {
              ...prev,
              perk2Ids: replaceAt(prev.perk2Ids, target.index, itemId),
            };
          }
          case "perk3": {
            if (
              prev.perk3Ids.some((id, i) => i !== target.index && id === itemId)
            ) {
              return prev;
            }
            return {
              ...prev,
              perk3Ids: replaceAt(prev.perk3Ids, target.index, itemId),
            };
          }
          case "lethal": {
            if (
              prev.lethalIds.some((id, i) => i !== target.index && id === itemId)
            ) {
              return prev;
            }
            return {
              ...prev,
              lethalIds: replaceAt(prev.lethalIds, target.index, itemId),
            };
          }
          case "tactical": {
            if (
              prev.tacticalIds.some(
                (id, i) => i !== target.index && id === itemId,
              )
            ) {
              return prev;
            }
            return {
              ...prev,
              tacticalIds: replaceAt(prev.tacticalIds, target.index, itemId),
            };
          }
          case "wildcard": {
            if (
              prev.wildcardIds.some(
                (id, i) => i !== target.index && id === itemId,
              )
            ) {
              return prev;
            }
            let wildcardIds = replaceAt(prev.wildcardIds, target.index, itemId);
            if (itemId === "tactician") {
              wildcardIds = wildcardIds.map((id) =>
                id === "danger_close" ? null : id,
              );
            }
            if (itemId === "danger_close") {
              wildcardIds = wildcardIds.map((id) =>
                id === "tactician" ? null : id,
              );
            }
            return { ...prev, wildcardIds };
          }
          default:
            return prev;
        }
      });
      setSelector(null);
    },
    [updateBuild],
  );

  const shareClass = useCallback(async () => {
    const url = buildShareUrl(build);
    const title = build.name?.trim() || "BO2 Class";
    const text = `Check out my Black Ops II Pick 10 class: ${title}`;
    let shared = false;

    // Mobile / supporting browsers: system share sheet (Messages, Mail, etc.)
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        shared = true;
        setShareMessage("Class shared");
      } catch (error) {
        // User canceled the sheet — don't treat as a share unlock.
        if (
          error instanceof DOMException &&
          (error.name === "AbortError" || error.name === "NotAllowedError")
        ) {
          setShareMessage(null);
          return;
        }
      }
    }

    if (!shared) {
      try {
        await navigator.clipboard.writeText(url);
        shared = true;
        setShareMessage("Class URL copied");
      } catch {
        setShareMessage("Could not copy — URL updated in address bar");
        // Still count as shared so desktop users aren't blocked.
        shared = true;
      }
    }

    window.history.replaceState({}, "", url);
    if (shared) {
      celebrateEasterEggUnlock("share_class");
    }
    window.setTimeout(() => setShareMessage(null), 2500);
  }, [build]);

  const primaryWeapon = build.primaryWeaponId
    ? weaponsById[build.primaryWeaponId]
    : undefined;
  const secondaryWeapon = build.secondaryWeaponId
    ? weaponsById[build.secondaryWeaponId]
    : undefined;

  const loadoutSlots = useMemo(
    () =>
      slots.map((slot, index) => ({
        index,
        name: slot.name || defaultLoadoutName(index),
        empty: isBuildEmpty(slot),
        active: index === activeIndex,
      })),
    [slots, activeIndex],
  );

  return {
    build,
    hydrated,
    selector,
    shareMessage,
    usedPoints,
    remainingPoints,
    maxPoints: PICK_10_MAX,
    limits,
    activeWildcards,
    primaryWeapon,
    secondaryWeapon,
    activeIndex,
    loadoutSlots,
    remixOfId,
    wantPublish,
    clearWantPublish: () => setWantPublish(false),
    clearRemixOfId: () => setRemixOfId(null),
    setName,
    resetClass,
    selectLoadoutSlot,
    clearAllLoadouts,
    openSelector,
    closeSelector,
    clearSelection,
    selectItem,
    getCurrentId,
    shareClass,
    hasWildcard: (id: WildcardId) => activeWildcards.has(id),
  };
}

export type ClassBuildController = ReturnType<typeof useClassBuild>;
