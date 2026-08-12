"use client";

import { useEffect, type ReactNode } from "react";
import {
  isInternalPathHref,
  labelMatchesCreateAClass,
  playUiSound,
  preloadUiSounds,
} from "@/lib/uiSound";

/**
 * Global UI SFX (pointerdown for lower perceived latency than click):
 * - "create a class" / "open class builder" → create-a-class
 * - internal link to another route → new-page
 * Weapon select SFX is fired from ItemSelector when a weapon is picked.
 */
export function UiSoundProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    preloadUiSounds();
  }, []);

  useEffect(() => {
    const unlock = () => {
      preloadUiSounds();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const el = (event.target as HTMLElement | null)?.closest(
        "a,button,[role='button']",
      );
      if (!el) return;

      const label = el.textContent ?? "";
      if (labelMatchesCreateAClass(label)) {
        playUiSound("create-a-class");
        return;
      }

      if (el.tagName === "A") {
        const nextPath = isInternalPathHref(el.getAttribute("href"));
        if (nextPath && nextPath !== window.location.pathname) {
          playUiSound("new-page");
        }
      }
    };

    // Capture + pointerdown beats click (fires before mouseup/navigation).
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return children;
}
