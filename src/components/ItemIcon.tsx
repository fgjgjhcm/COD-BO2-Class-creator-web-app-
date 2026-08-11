"use client";

import { useState } from "react";
import type { GameItem } from "@/types/class";
import {
  getItemImageSrc,
  inferImageFolder,
  type ItemImageFolder,
} from "@/lib/icons";

interface ItemIconProps {
  item?: GameItem | null;
  folder?: ItemImageFolder;
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  empty?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
  xl: "h-[4.5rem] w-40 md:h-20 md:w-52",
};

export function ItemIcon({
  item,
  folder,
  src,
  alt,
  size = "md",
  empty = false,
  className = "",
}: ItemIconProps) {
  const resolvedFolder = folder ?? (item ? inferImageFolder(item) : "weapons");
  const imageSrc =
    src ?? (item ? getItemImageSrc(item, resolvedFolder) : null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !!imageSrc && failedSrc === imageSrc;
  const label = alt ?? item?.name ?? "Item";
  const isWide = size === "xl";

  if (empty || !imageSrc || failed) {
    return (
      <div
        className={[
          "item-icon item-icon--empty flex items-center justify-center border border-zinc-700 bg-zinc-900/80 text-zinc-600",
          sizeMap[size],
          className,
        ].join(" ")}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className={isWide ? "h-7 w-7" : "h-5 w-5"}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 5v14M5 12h14" strokeLinecap="square" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={[
        "item-icon item-icon--sprite overflow-hidden",
        sizeMap[size],
        className,
      ].join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={label}
        className={[
          "item-icon__img h-full w-full object-contain",
          isWide ? "object-center p-1" : "p-1",
        ].join(" ")}
        draggable={false}
        onError={() => setFailedSrc(imageSrc)}
      />
    </div>
  );
}
