"use client";

import { useEffect, useRef } from "react";
import { useAfterlife } from "@/components/easter-eggs/AfterlifeProvider";

/** MotD-style afterlife box — Hold Space while this station is in view. */
export function AfterlifeStation() {
  const { setAtStation, active } = useAfterlife();
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

  return (
    <section
      ref={ref}
      className={`afterlife-station${active ? " is-afterlife" : ""}`}
      aria-label="Afterlife junction box"
    >
      <div className="afterlife-box" aria-hidden="true">
        <div className="afterlife-box-face">
          <div className="afterlife-box-badge">
            <span className="afterlife-bolt" />
          </div>
        </div>
      </div>
      <p className="afterlife-station-label">Junction Box · Cell Block</p>
      <p className="afterlife-station-hint">
        {active
          ? "Hold Space to leave Afterlife"
          : "Hold Space to enter Afterlife"}
      </p>
    </section>
  );
}
