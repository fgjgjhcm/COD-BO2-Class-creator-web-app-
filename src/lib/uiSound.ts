import { unlockEasterEgg } from "@/lib/easterEggs";

export type UiSoundId =
  | "create-a-class"
  | "select-weapon"
  | "new-page"
  | "dsr-fire"
  | "ee-unlock";

const SOUND_SRC: Record<UiSoundId, string> = {
  "create-a-class": "/sounds/create-a-class.m4a",
  "select-weapon": "/sounds/select-weapon.m4a",
  "new-page": "/sounds/new-page.m4a",
  "dsr-fire": "/sounds/dsr-fire.mp3",
  "ee-unlock": "/sounds/ee-unlock.mp3",
};

export const DSR_50_ID = "dsr_50";

let ctx: AudioContext | null = null;
const buffers = new Map<UiSoundId, AudioBuffer>();

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

async function ensureBuffers(): Promise<void> {
  const audioCtx = getContext();
  if (!audioCtx) return;

  const missing = (Object.keys(SOUND_SRC) as UiSoundId[]).filter(
    (id) => !buffers.has(id),
  );

  if (missing.length > 0) {
    await Promise.all(
      missing.map(async (id) => {
        try {
          const res = await fetch(SOUND_SRC[id]);
          const raw = await res.arrayBuffer();
          const buffer = await audioCtx.decodeAudioData(raw.slice(0));
          buffers.set(id, buffer);
        } catch {
          // Missing/undecodable clip — skip.
        }
      }),
    );
  }

  if (audioCtx.state === "suspended") {
    await audioCtx.resume().catch(() => undefined);
  }
}

/** Unlock + decode on first gesture so later plays are instant. */
export function preloadUiSounds(): void {
  void ensureBuffers();
}

/** Near-instant UI SFX via Web Audio buffers (no HTMLAudio seek lag). */
export function playUiSound(id: UiSoundId): void {
  const audioCtx = getContext();
  if (!audioCtx) return;

  const start = () => {
    const buffer = buffers.get(id);
    if (!buffer) return;
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
  };

  if (buffers.has(id) && audioCtx.state === "running") {
    start();
    return;
  }

  void ensureBuffers().then(start);
}

export function playDsrEasterEgg(): void {
  playUiSound("dsr-fire");
  if (unlockEasterEgg("dsr_fire")) {
    // Slight delay so the gunshot and unlock sting don't fully stack.
    window.setTimeout(() => playUiSound("ee-unlock"), 280);
  }
}

/** Unlock fanfare for non-DSR eggs (share, etc.). */
export function celebrateEasterEggUnlock(id: Parameters<typeof unlockEasterEgg>[0]): void {
  if (unlockEasterEgg(id)) {
    playUiSound("ee-unlock");
  }
}

/** Normalize button/link label text for matching sound rules. */
export function normalizeUiLabel(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[-–—_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function labelMatchesCreateAClass(text: string): boolean {
  const label = normalizeUiLabel(text);
  return (
    label.includes("create a class") || label.includes("open class builder")
  );
}

export function isInternalPathHref(href: string | null): string | null {
  if (!href || href.startsWith("#") || href.startsWith("mailto:")) return null;
  if (href.startsWith("http") || href.startsWith("//")) {
    try {
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return null;
      return url.pathname;
    } catch {
      return null;
    }
  }
  if (href.startsWith("/")) {
    return href.split("?")[0]?.split("#")[0] ?? null;
  }
  return null;
}
