"use client";

import type { ReactNode } from "react";
import { ItemIcon } from "@/components/ItemIcon";
import type { ItemImageFolder } from "@/lib/icons";
import type { GameItem } from "@/types/class";

interface SlotCardProps {
  label: string;
  title: string;
  subtitle?: string;
  empty?: boolean;
  size?: "lg" | "md" | "sm";
  onClick: () => void;
  onClear?: () => void;
  disabled?: boolean;
  accent?: boolean;
  item?: GameItem | null;
  imageFolder?: ItemImageFolder;
  icon?: ReactNode;
}

export function SlotCard({
  label,
  title,
  subtitle,
  empty = false,
  size = "md",
  onClick,
  onClear,
  disabled = false,
  accent = false,
  item,
  imageFolder,
  icon,
}: SlotCardProps) {
  const isWeapon = size === "lg";
  const sizeClasses = isWeapon
    ? "min-h-[8.5rem] p-4"
    : size === "sm"
      ? "min-h-[4.5rem] p-3"
      : "min-h-[5.5rem] p-3.5";

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={[
          "slot-card relative w-full text-left transition-all duration-200",
          sizeClasses,
          empty ? "slot-card--empty" : "slot-card--filled",
          accent ? "slot-card--accent" : "",
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            "flex gap-3",
            isWeapon ? "items-center" : "items-start",
          ].join(" ")}
        >
          <div className="slot-icon shrink-0" aria-hidden>
            {icon ?? (
              <ItemIcon
                item={item}
                folder={imageFolder}
                empty={empty || !item}
                size={isWeapon ? "xl" : size === "sm" ? "sm" : "md"}
                alt={title}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="slot-label">{label}</div>
            <div
              className={[
                "slot-title truncate",
                isWeapon ? "text-xl md:text-2xl" : "text-base md:text-lg",
                empty ? "text-zinc-500" : "text-white",
              ].join(" ")}
            >
              {title}
            </div>
            {subtitle ? (
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
        <div className="slot-sheen" aria-hidden />
      </button>

      {!empty && onClear ? (
        <button
          type="button"
          aria-label={`Remove ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
          className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center border border-orange-500/40 bg-zinc-950 text-xs text-orange-400 opacity-100 shadow-lg transition hover:bg-orange-500 hover:text-black md:opacity-0 md:group-hover:opacity-100"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
