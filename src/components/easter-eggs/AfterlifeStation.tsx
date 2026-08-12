"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useAfterlife } from "@/components/easter-eggs/AfterlifeProvider";

/** MotD-style afterlife box — Hold Space (desktop) or press-and-hold (mobile). */
export function AfterlifeStation() {
  const {
    setAtStation,
    active,
    isTouchUi,
    beginHold,
    stopHold,
  } = useAfterlife();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setAtStation(!!entry?.isIntersecting);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      setAtStation(false);
    };
  }, [setAtStation]);

  const onHoldPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    // Ensure hold is allowed even if the observer hasn't fired yet.
    setAtStation(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    beginHold();
  };

  const onHoldPointerEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    stopHold();
  };

  const hint = active
    ? isTouchUi
      ? "Hold the box to leave Afterlife"
      : "Hold Space to leave Afterlife"
    : isTouchUi
      ? "Hold the box to enter Afterlife"
      : "Hold Space to enter Afterlife";

  return (
    <section
      ref={ref}
      className={`afterlife-station${active ? " is-afterlife" : ""}`}
      aria-label="Afterlife junction box"
    >
      <button
        type="button"
        className="afterlife-box afterlife-box-btn"
        aria-label={
          active ? "Hold to leave Afterlife" : "Hold to enter Afterlife"
        }
        onPointerDown={onHoldPointerDown}
        onPointerUp={onHoldPointerEnd}
        onPointerCancel={onHoldPointerEnd}
        onLostPointerCapture={stopHold}
      >
        <div className="afterlife-box-face" aria-hidden="true">
          <div className="afterlife-box-badge">
            <span className="afterlife-bolt" />
          </div>
        </div>
      </button>
      <p className="afterlife-station-label">Junction Box · Cell Block</p>
      <p className="afterlife-station-hint">{hint}</p>
    </section>
  );
}
