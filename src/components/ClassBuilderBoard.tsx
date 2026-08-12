"use client";

import type { ClassBuildController } from "@/hooks/useClassBuild";
import { CacRow, CacSlot } from "@/components/CacSlot";
import { resolveItem } from "@/lib/items";
import { weaponSupportsAttachments } from "@/data/weapons";
import type { SelectorTarget } from "@/types/class";
import { DSR_50_ID, playDsrEasterEgg } from "@/lib/uiSound";

interface ClassBuilderBoardProps {
  controller: ClassBuildController;
}

export function ClassBuilderBoard({ controller }: ClassBuilderBoardProps) {
  const {
    build,
    limits,
    primaryWeapon,
    secondaryWeapon,
    selector,
    openSelector,
    clearSelection,
  } = controller;

  const isActive = (target: SelectorTarget) =>
    !!selector &&
    selector.kind === target.kind &&
    selector.index === target.index;

  return (
    <div className="cac-board">
      <div className="cac-main">
        {/* Left: weapons */}
        <section className="cac-weapons">
          <div className="cac-weapon-block">
            <CacSlot
              variant="primary"
              label="Primary"
              title={primaryWeapon?.name}
              empty={!primaryWeapon}
              active={isActive({ kind: "primaryWeapon", index: 0 })}
              item={primaryWeapon}
              imageFolder="weapons"
              onClick={() => {
                if (primaryWeapon?.id === DSR_50_ID) {
                  playDsrEasterEgg();
                }
                openSelector({ kind: "primaryWeapon", index: 0 });
              }}
              onClear={
                primaryWeapon
                  ? () => clearSelection({ kind: "primaryWeapon", index: 0 })
                  : undefined
              }
            />
            <AttachmentStrip
              locked={!primaryWeapon || !weaponSupportsAttachments(primaryWeapon)}
              count={limits.primaryAttachments}
              ids={build.primaryAttachmentIds}
              kind="primaryAttachment"
              active={isActive}
              openSelector={openSelector}
              clearSelection={clearSelection}
            />
          </div>

          <div className="cac-weapon-block">
            <CacSlot
              variant="secondary"
              label="Secondary"
              title={secondaryWeapon?.name}
              empty={!secondaryWeapon}
              active={isActive({ kind: "secondaryWeapon", index: 0 })}
              item={secondaryWeapon}
              imageFolder="weapons"
              onClick={() => {
                if (secondaryWeapon?.id === DSR_50_ID) {
                  playDsrEasterEgg();
                }
                openSelector({ kind: "secondaryWeapon", index: 0 });
              }}
              onClear={
                secondaryWeapon
                  ? () => clearSelection({ kind: "secondaryWeapon", index: 0 })
                  : undefined
              }
            />
            <AttachmentStrip
              locked={
                !secondaryWeapon || !weaponSupportsAttachments(secondaryWeapon)
              }
              count={limits.secondaryAttachments}
              ids={build.secondaryAttachmentIds}
              kind="secondaryAttachment"
              active={isActive}
              openSelector={openSelector}
              clearSelection={clearSelection}
            />
          </div>
        </section>

        {/* Right: perks + equipment */}
        <section className="cac-side">
          <CacRow label="Perk 1">
            {Array.from({ length: limits.perk1 }).map((_, index) => {
              const item = resolveItem(build.perk1Ids[index]);
              return (
                <CacSlot
                  key={`p1-${index}`}
                  variant="square"
                  title={item?.name}
                  empty={!item}
                  active={isActive({ kind: "perk1", index })}
                  item={item}
                  imageFolder="perks"
                  onClick={() => openSelector({ kind: "perk1", index })}
                  onClear={
                    item
                      ? () => clearSelection({ kind: "perk1", index })
                      : undefined
                  }
                />
              );
            })}
          </CacRow>

          <CacRow label="Perk 2">
            {Array.from({ length: limits.perk2 }).map((_, index) => {
              const item = resolveItem(build.perk2Ids[index]);
              return (
                <CacSlot
                  key={`p2-${index}`}
                  variant="square"
                  title={item?.name}
                  empty={!item}
                  active={isActive({ kind: "perk2", index })}
                  item={item}
                  imageFolder="perks"
                  onClick={() => openSelector({ kind: "perk2", index })}
                  onClear={
                    item
                      ? () => clearSelection({ kind: "perk2", index })
                      : undefined
                  }
                />
              );
            })}
          </CacRow>

          <CacRow label="Perk 3">
            {Array.from({ length: limits.perk3 }).map((_, index) => {
              const item = resolveItem(build.perk3Ids[index]);
              return (
                <CacSlot
                  key={`p3-${index}`}
                  variant="square"
                  title={item?.name}
                  empty={!item}
                  active={isActive({ kind: "perk3", index })}
                  item={item}
                  imageFolder="perks"
                  onClick={() => openSelector({ kind: "perk3", index })}
                  onClear={
                    item
                      ? () => clearSelection({ kind: "perk3", index })
                      : undefined
                  }
                />
              );
            })}
          </CacRow>

          {limits.lethals > 0 ? (
            <CacRow label="Lethal">
              {Array.from({ length: limits.lethals }).map((_, index) => {
                const item = resolveItem(build.lethalIds[index]);
                return (
                  <CacSlot
                    key={`l-${index}`}
                    variant="square"
                    title={item?.name}
                    empty={!item}
                    active={isActive({ kind: "lethal", index })}
                    item={item}
                    imageFolder="equipment"
                    onClick={() => openSelector({ kind: "lethal", index })}
                    onClear={
                      item
                        ? () => clearSelection({ kind: "lethal", index })
                        : undefined
                    }
                  />
                );
              })}
            </CacRow>
          ) : (
            <CacRow label="Lethal">
              <div className="cac-replaced">Replaced</div>
            </CacRow>
          )}

          <CacRow label="Tactical">
            {Array.from({ length: limits.tacticals }).map((_, index) => {
              const item = resolveItem(build.tacticalIds[index]);
              return (
                <CacSlot
                  key={`t-${index}`}
                  variant="square"
                  title={item?.name}
                  empty={!item}
                  active={isActive({ kind: "tactical", index })}
                  item={item}
                  imageFolder="equipment"
                  onClick={() => openSelector({ kind: "tactical", index })}
                  onClear={
                    item
                      ? () => clearSelection({ kind: "tactical", index })
                      : undefined
                  }
                />
              );
            })}
          </CacRow>
        </section>
      </div>

      {/* Wildcards footer row */}
      <section className="cac-wildcards">
        <div className="cac-slot-label">Wildcards</div>
        <div className="cac-wildcard-grid">
          {[0, 1, 2].map((index) => {
            const item = resolveItem(build.wildcardIds[index]);
            return (
              <CacSlot
                key={`wc-${index}`}
                variant="wildcard"
                title={item?.name}
                empty={!item}
                active={isActive({ kind: "wildcard", index })}
                item={item}
                imageFolder="wildcards"
                onClick={() => openSelector({ kind: "wildcard", index })}
                onClear={
                  item
                    ? () => clearSelection({ kind: "wildcard", index })
                    : undefined
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function AttachmentStrip({
  locked,
  count,
  ids,
  kind,
  active,
  openSelector,
  clearSelection,
}: {
  locked: boolean;
  count: number;
  ids: (string | null)[];
  kind: "primaryAttachment" | "secondaryAttachment";
  active: (target: SelectorTarget) => boolean;
  openSelector: (target: SelectorTarget) => void;
  clearSelection: (target: SelectorTarget) => void;
}) {
  if (locked) {
    return (
      <div className="cac-attachments-locked">Attachments not available</div>
    );
  }

  return (
    <div className="cac-attachments">
      {Array.from({ length: count }).map((_, index) => {
        const item = resolveItem(ids[index]);
        return (
          <CacSlot
            key={`${kind}-${index}`}
            variant="attachment"
            title={item?.name}
            empty={!item}
            active={active({ kind, index })}
            item={item}
            imageFolder="attachments"
            onClick={() => openSelector({ kind, index })}
            onClear={
              item ? () => clearSelection({ kind, index }) : undefined
            }
          />
        );
      })}
    </div>
  );
}
