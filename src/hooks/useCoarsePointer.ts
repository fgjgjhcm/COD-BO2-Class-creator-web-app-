"use client";

import { useEffect, useState } from "react";

/** True on phones/tablets (coarse pointer or touch primary). */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => {
      const touchPrimary =
        "ontouchstart" in window ||
        (navigator.maxTouchPoints ?? 0) > 0;
      setCoarse(mq.matches || (touchPrimary && !window.matchMedia("(hover: hover)").matches));
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return coarse;
}
