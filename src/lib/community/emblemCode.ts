import { inflate } from "pako";

export type ParsedEmblemCode = {
  playername?: string;
  playerclantag?: string;
  playerbg?: string;
  stack: unknown[];
  layerCount: number;
};

/**
 * Decode SAVE codes from the community BO2 emblem editor.
 * Format: Base64URL(UTF-8-wrapped zlib(JSON)), matching dankogai js-base64 + pako.
 * Server-only (uses Buffer).
 */
export function parseEmblemCode(raw: string): ParsedEmblemCode | null {
  const code = raw.trim();
  if (code.length < 8 || code.length > 60000) return null;

  try {
    const padded = code.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (padded.length % 4)) % 4;
    const b64 = padded + "=".repeat(padLen);
    const utf8Wrapped = Buffer.from(b64, "base64");
    // dankogai encodeURI UTF-8-encodes binary bytes before base64
    const rawBytes = Buffer.from(utf8Wrapped.toString("utf8"), "binary");
    const json = Buffer.from(inflate(new Uint8Array(rawBytes))).toString(
      "utf8",
    );
    const data = JSON.parse(json) as {
      playername?: string;
      playerclantag?: string;
      playerbg?: string;
      stack?: unknown;
    };
    if (!Array.isArray(data.stack)) return null;
    if (data.stack.length > 32) return null;
    return {
      playername: data.playername,
      playerclantag: data.playerclantag,
      playerbg: data.playerbg,
      stack: data.stack,
      layerCount: data.stack.length,
    };
  } catch {
    return null;
  }
}
