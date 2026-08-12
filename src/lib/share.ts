import type { ClassBuild } from "@/types/class";
import { createEmptyBuild, sanitizeBuild } from "@/lib/pick10";

const SHARE_PARAM = "c";

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLength);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Compact serializable shape for URL sharing */
interface SharePayload {
  n: string;
  pw: string | null;
  sw: string | null;
  pa: (string | null)[];
  sa: (string | null)[];
  p1: (string | null)[];
  p2: (string | null)[];
  p3: (string | null)[];
  l: (string | null)[];
  t: (string | null)[];
  w: (string | null)[];
}

function toPayload(build: ClassBuild): SharePayload {
  return {
    n: build.name,
    pw: build.primaryWeaponId,
    sw: build.secondaryWeaponId,
    pa: build.primaryAttachmentIds,
    sa: build.secondaryAttachmentIds,
    p1: build.perk1Ids,
    p2: build.perk2Ids,
    p3: build.perk3Ids,
    l: build.lethalIds,
    t: build.tacticalIds,
    w: build.wildcardIds,
  };
}

function fromPayload(payload: SharePayload): ClassBuild {
  return sanitizeBuild({
    name: payload.n || "Custom Class 1",
    primaryWeaponId: payload.pw,
    secondaryWeaponId: payload.sw,
    primaryAttachmentIds: payload.pa ?? [null, null, null],
    secondaryAttachmentIds: payload.sa ?? [null, null],
    perk1Ids: payload.p1 ?? [null, null],
    perk2Ids: payload.p2 ?? [null, null],
    perk3Ids: payload.p3 ?? [null, null],
    lethalIds: payload.l ?? [null, null],
    tacticalIds: payload.t ?? [null, null],
    wildcardIds: payload.w ?? [null, null, null, null],
  });
}

export function encodeBuild(build: ClassBuild): string {
  return toBase64Url(JSON.stringify(toPayload(build)));
}

export function decodeBuild(encoded: string): ClassBuild | null {
  try {
    const json = fromBase64Url(encoded);
    const payload = JSON.parse(json) as SharePayload;
    if (!payload || typeof payload !== "object") return null;
    return fromPayload(payload);
  } catch {
    return null;
  }
}

export function buildShareUrl(build: ClassBuild, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? `${window.location.origin}/builder` : "/builder");
  const url = new URL(base, "http://localhost");
  url.searchParams.set(SHARE_PARAM, encodeBuild(build));
  if (origin || typeof window !== "undefined") {
    return `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
  }
  return `/builder?${url.searchParams.toString()}`;
}

export function readBuildFromSearchParams(
  searchParams: URLSearchParams | { get(name: string): string | null },
): ClassBuild | null {
  const encoded = searchParams.get(SHARE_PARAM);
  if (!encoded) return null;
  return decodeBuild(encoded);
}

export { SHARE_PARAM, createEmptyBuild };
