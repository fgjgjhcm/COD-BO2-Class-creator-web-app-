"use client";

import { useClassBuild } from "@/hooks/useClassBuild";
import { Pick10Counter } from "@/components/Pick10Counter";
import { ItemSelector } from "@/components/ItemSelector";
import { ClassBuilderBoard } from "@/components/ClassBuilderBoard";
import { LoadingScreen } from "@/components/LoadingScreen";

export function ClassBuilder() {
  const controller = useClassBuild();
  const {
    build,
    hydrated,
    selector,
    shareMessage,
    usedPoints,
    maxPoints,
    loadoutSlots,
    setName,
    resetClass,
    selectLoadoutSlot,
    clearAllLoadouts,
    shareClass,
    closeSelector,
    clearSelection,
    selectItem,
    getCurrentId,
    primaryWeapon,
    secondaryWeapon,
  } = controller;

  if (!hydrated) {
    return <LoadingScreen label="Loading loadout" />;
  }

  return (
    <div className="cac-screen mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
      <header className="cac-header mb-4 flex items-start justify-between gap-4 sm:mb-6">
        <div className="min-w-0 flex-1">
          <label className="block">
            <span className="sr-only">Class name</span>
            <input
              value={build.name}
              onChange={(event) => setName(event.target.value)}
              className="class-name-input w-full max-w-md bg-transparent font-display text-3xl tracking-wide text-white outline-none sm:text-4xl md:text-5xl"
              maxLength={32}
              spellCheck={false}
            />
          </label>
          <div
            className="loadout-slots"
            role="tablist"
            aria-label="Saved classes"
          >
            {loadoutSlots.map((slot) => (
              <button
                key={slot.index}
                type="button"
                role="tab"
                aria-selected={slot.active}
                title={slot.name}
                onClick={() => selectLoadoutSlot(slot.index)}
                className={[
                  "loadout-slot",
                  slot.active ? "loadout-slot--active" : "",
                  slot.empty ? "loadout-slot--empty" : "loadout-slot--filled",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="loadout-slot__index">{slot.index + 1}</span>
                <span className="loadout-slot__name">
                  {slot.empty ? `Class ${slot.index + 1}` : slot.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        <Pick10Counter used={usedPoints} max={maxPoints} />
      </header>

      <ClassBuilderBoard controller={controller} />

      <footer className="cac-footer mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500 sm:mt-6">
        <button type="button" className="cac-prompt" onClick={resetClass}>
          <span className="cac-prompt-key">New</span> Class
        </button>
        <button type="button" className="cac-prompt" onClick={shareClass}>
          <span className="cac-prompt-key">Share</span> Class
        </button>
        <button
          type="button"
          className="cac-prompt"
          onClick={() => {
            if (
              window.confirm(
                "Clear all 5 saved classes? This cannot be undone.",
              )
            ) {
              clearAllLoadouts();
            }
          }}
        >
          <span className="cac-prompt-key">Clear</span> All
        </button>
        {shareMessage ? (
          <span className="text-[var(--accent)]">{shareMessage}</span>
        ) : null}
        <span className="ml-auto hidden text-[10px] tracking-[0.14em] text-zinc-600 sm:inline">
          Fan project · Not affiliated with Activision / Treyarch
        </span>
      </footer>

      <ItemSelector
        open={!!selector}
        target={selector}
        build={build}
        currentId={selector ? getCurrentId(selector) : null}
        primaryWeapon={primaryWeapon}
        secondaryWeapon={secondaryWeapon}
        onClose={closeSelector}
        onSelect={(id) => selector && selectItem(selector, id)}
        onClear={() => {
          if (!selector) return;
          clearSelection(selector);
          closeSelector();
        }}
      />
    </div>
  );
}
