"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { celebrateEasterEggUnlock } from "@/lib/uiSound";

const HOLD_MS = 1100;
const AFTERLIFE_AUDIO_SRC = "/sounds/afterlife.mp3";

type AfterlifeContextValue = {
  active: boolean;
  /** True while the MotD box station is on-screen / available */
  atStation: boolean;
  holdProgress: number;
  /** Touch / coarse-pointer UI (no Space key) */
  isTouchUi: boolean;
  setAtStation: (near: boolean) => void;
  beginHold: () => void;
  stopHold: () => void;
  exit: () => void;
};

const AfterlifeContext = createContext<AfterlifeContextValue | null>(null);

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function AfterlifeProvider({ children }: { children: ReactNode }) {
  const isTouchUi = useCoarsePointer();
  const [active, setActive] = useState(false);
  const [atStation, setAtStation] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStartedAt = useRef<number | null>(null);
  const rafRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const holding = useRef(false);
  const activeRef = useRef(active);
  const atStationRef = useRef(atStation);
  activeRef.current = active;
  atStationRef.current = atStation;

  const setAtStationSafe = useCallback((near: boolean) => {
    atStationRef.current = near;
    setAtStation(near);
  }, []);

  const stopHold = useCallback(() => {
    holdStartedAt.current = null;
    holding.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setHoldProgress(0);
  }, []);

  const exit = useCallback(() => {
    setActive(false);
    stopHold();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    document.documentElement.classList.remove("afterlife-active");
  }, [stopHold]);

  const enter = useCallback(() => {
    setActive(true);
    stopHold();
    document.documentElement.classList.add("afterlife-active");
    celebrateEasterEggUnlock("afterlife");

    if (!audioRef.current) {
      const audio = new Audio(AFTERLIFE_AUDIO_SRC);
      audio.loop = true;
      audio.preload = "auto";
      audioRef.current = audio;
    }
    const audio = audioRef.current;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, [stopHold]);

  const tickHold = useCallback(() => {
    if (holdStartedAt.current == null) return;
    const elapsed = performance.now() - holdStartedAt.current;
    const progress = Math.min(1, elapsed / HOLD_MS);
    setHoldProgress(progress);
    if (progress >= 1) {
      holdStartedAt.current = null;
      holding.current = false;
      if (activeRef.current) {
        exit();
      } else {
        enter();
      }
      return;
    }
    rafRef.current = requestAnimationFrame(tickHold);
  }, [enter, exit]);

  const beginHold = useCallback(() => {
    if (holding.current) return;
    if (!activeRef.current && !atStationRef.current) return;
    holding.current = true;
    holdStartedAt.current = performance.now();
    setHoldProgress(0.01);
    rafRef.current = requestAnimationFrame(tickHold);
  }, [tickHold]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.key !== " ") return;
      if (event.repeat) return;
      if (isTypingTarget(event.target)) return;

      const canHold = active || atStation;
      if (!canHold) return;

      event.preventDefault();
      beginHold();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.key !== " ") return;
      if (holding.current) {
        event.preventDefault();
        stopHold();
      }
    };

    const onBlur = () => stopHold();

    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", onBlur);
      stopHold();
    };
  }, [active, atStation, beginHold, stopHold]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("afterlife-active");
      audioRef.current?.pause();
    };
  }, []);

  const onHoldPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      beginHold();
    },
    [beginHold],
  );

  const onHoldPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      stopHold();
    },
    [stopHold],
  );

  const value = useMemo(
    () => ({
      active,
      atStation,
      holdProgress,
      isTouchUi,
      setAtStation: setAtStationSafe,
      beginHold,
      stopHold,
      exit,
    }),
    [
      active,
      atStation,
      holdProgress,
      isTouchUi,
      setAtStationSafe,
      beginHold,
      stopHold,
      exit,
    ],
  );

  const showPrompt = (atStation && !active) || active;

  return (
    <AfterlifeContext.Provider value={value}>
      {children}
      {showPrompt ? (
        <div className="afterlife-prompt" aria-live="polite">
          <div
            className="afterlife-prompt-ring"
            style={{ "--hold": holdProgress } as CSSProperties}
          />
          <p>
            {isTouchUi ? (
              <>Hold to {active ? "leave" : "enter"} Afterlife</>
            ) : (
              <>
                Hold <kbd>SPACE</kbd> to {active ? "leave" : "enter"} Afterlife
              </>
            )}
          </p>
          {isTouchUi ? (
            <button
              type="button"
              className="afterlife-hold-btn"
              aria-label={
                active ? "Hold to leave Afterlife" : "Hold to enter Afterlife"
              }
              onPointerDown={onHoldPointerDown}
              onPointerUp={onHoldPointerEnd}
              onPointerCancel={onHoldPointerEnd}
              onLostPointerCapture={stopHold}
            >
              Hold
            </button>
          ) : null}
          {active ? (
            <button type="button" className="afterlife-exit-btn" onClick={exit}>
              Return to Alcatraz
            </button>
          ) : null}
        </div>
      ) : null}
      {active ? <div className="afterlife-veil" aria-hidden="true" /> : null}
    </AfterlifeContext.Provider>
  );
}

export function useAfterlife(): AfterlifeContextValue {
  const ctx = useContext(AfterlifeContext);
  if (!ctx) {
    throw new Error("useAfterlife must be used within AfterlifeProvider");
  }
  return ctx;
}
