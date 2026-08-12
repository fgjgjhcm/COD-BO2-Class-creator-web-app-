"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  EASTER_EGG_UNLOCK_EVENT,
  EASTER_EGGS,
  isEasterEggUnlocked,
  markEasterEggsViewed,
  type EasterEggsState,
} from "@/lib/easterEggs";

export function EasterEggsInventory() {
  const [state, setState] = useState<EasterEggsState>({
    unlocked: [],
    viewed: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Opening this page clears the teddy "unseen" pulse.
    setState(markEasterEggsViewed());
    setHydrated(true);
    const onUnlock = () => setState(markEasterEggsViewed());
    window.addEventListener(EASTER_EGG_UNLOCK_EVENT, onUnlock);
    window.addEventListener("storage", onUnlock);
    return () => {
      window.removeEventListener(EASTER_EGG_UNLOCK_EVENT, onUnlock);
      window.removeEventListener("storage", onUnlock);
    };
  }, []);

  const found = hydrated ? state.unlocked.length : 0;
  const total = EASTER_EGGS.length;

  return (
    <div className="ee-screen">
      <div className="ee-panel">
        <header className="ee-panel-head">
          <div>
            <p className="ee-eyebrow">Zombies · Inventory</p>
            <h1 className="ee-title">Easter Eggs</h1>
          </div>
          <Link href="/builder" className="seo-cta">
            Open Class Builder
          </Link>
        </header>

        <p className="ee-lead">Explore the site. Secrets unlock here.</p>

        <section className="ee-group">
          <h2 className="ee-group-title">Secrets</h2>
          <ul className="ee-slots">
            {EASTER_EGGS.map((egg) => {
              const unlocked =
                hydrated && isEasterEggUnlocked(state, egg.id);
              return (
                <li key={egg.id} className="ee-slot-wrap">
                  <div
                    className={`ee-slot${unlocked ? " is-unlocked" : " is-locked"}`}
                    title={unlocked ? egg.name : "Undiscovered"}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={unlocked ? egg.unlockedIcon : egg.lockedIcon}
                      alt={unlocked ? egg.name : ""}
                      className="ee-slot-icon"
                    />
                  </div>
                  <p className="ee-slot-caption">
                    {unlocked ? egg.name : "???"}
                  </p>
                  <p className="ee-slot-hint">
                    {unlocked ? egg.description : egg.hint}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="ee-scoreboard">
        <div className="ee-scoreboard-head">
          <span>bo2loadouts.com — Excavation Site</span>
          <span>Found</span>
          <span>Locked</span>
          <span>Total</span>
        </div>
        <div className="ee-scoreboard-row">
          <span className="ee-player">Secret Hunter</span>
          <span>{found}</span>
          <span>{Math.max(0, total - found)}</span>
          <span>{total}</span>
        </div>
      </div>
    </div>
  );
}
