"use client";

import type { ReactNode } from "react";
import type { GameItem } from "@/types/class";
import type { ItemImageFolder } from "@/lib/icons";
import { ItemIcon } from "@/components/ItemIcon";

type CacVariant = "primary" | "secondary" | "attachment" | "square" | "wildcard";

interface CacSlotProps {
  variant: CacVariant;
  label?: string;
  title?: string;
  empty?: boolean;
  active?: boolean;
  disabled?: boolean;
  item?: GameItem | null;
  imageFolder?: ItemImageFolder;
  onClick: () => void;
  onClear?: () => void;
}

export function CacSlot({
  variant,
  label,
  title,
  empty = true,
  active = false,
  disabled = false,
  item,
  imageFolder,
  onClick,
  onClear,
}: CacSlotProps) {
  const isWeapon = variant === "primary" || variant === "secondary";
  const isSquare = variant === "square";
  const isAttachment = variant === "attachment";
  const isWildcard = variant === "wildcard";

  return (
    <div
      className={["cac-slot-wrap", isSquare ? "cac-slot-wrap--square" : ""].join(
        " ",
      )}
    >
      {label && !isSquare ? <div className="cac-slot-label">{label}</div> : null}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={[
          "cac-slot",
          `cac-slot--${variant}`,
          empty ? "cac-slot--empty" : "cac-slot--filled",
          active ? "cac-slot--active" : "",
          disabled ? "cac-slot--disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!empty && item ? (
          <div
            className={[
              "cac-slot-content",
              isWeapon ? "cac-slot-content--weapon" : "",
              isSquare ? "cac-slot-content--square" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <ItemIcon
              item={item}
              folder={imageFolder}
              size={isWeapon ? "xl" : isWildcard ? "md" : "sm"}
              className={
                isWeapon
                  ? "cac-weapon-img !h-[4.75rem] !w-full max-w-[320px] md:!h-28"
                  : isSquare
                    ? "!h-full !w-full"
                    : isAttachment
                      ? "!h-8 !w-14"
                      : "!h-10 !w-16"
              }
              alt={item.name}
            />
            {!isSquare ? (
              <div className="cac-slot-name">{title ?? item.name}</div>
            ) : null}
          </div>
        ) : null}

        {empty && isWeapon ? <div className="cac-slot-placeholder" /> : null}
      </button>

      {!empty && onClear ? (
        <button
          type="button"
          aria-label={`Remove ${title ?? item?.name ?? "item"}`}
          className="cac-clear"
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

interface CacRowProps {
  label: string;
  children: ReactNode;
}

export function CacRow({ label, children }: CacRowProps) {
  return (
    <div className="cac-row">
      <div className="cac-row-label">{label}</div>
      <div className="cac-row-slots">{children}</div>
    </div>
  );
}
