import { inflate, inflateRaw } from "pako";

export type ParsedEmblemCode = {
  playername?: string;
  playerclantag?: string;
  playerbg?: string;
  stack: unknown[];
  layerCount: number;
};

export type EmblemParseResult =
  | { ok: true; data: ParsedEmblemCode }
  | { ok: false; error: string };

function sanitizeEmblemInput(raw: string): string {
  let code = raw.trim();

  // Allow pasting a full editor URL with ?load=
  const loadMatch = code.match(/[?&]load=([^&\s]+)/i);
  if (loadMatch?.[1]) {
    try {
      code = decodeURIComponent(loadMatch[1]);
    } catch {
      code = loadMatch[1];
    }
  }

  // Textareas / messengers often inject whitespace
  code = code.replace(/\s+/g, "");
  return code;
}

function inflateJson(bytes: Uint8Array): unknown {
  const attempts = [
    () => inflate(bytes),
    () => inflateRaw(bytes),
  ];
  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      const out = attempt();
      const json = Buffer.from(out).toString("utf8");
      return JSON.parse(json);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Inflate failed");
}

function decodeStrategies(code: string): Uint8Array[] {
  const padded = code.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + "=".repeat(padLen);
  const decoded = Buffer.from(b64, "base64");
  if (!decoded.length) return [];

  const strategies: Uint8Array[] = [];

  // 1) dankogai js-base64 encodeURI path (UTF-8 wrap before base64)
  try {
    const unwrapped = Buffer.from(decoded.toString("utf8"), "binary");
    if (unwrapped.length) strategies.push(new Uint8Array(unwrapped));
  } catch {
    // ignore
  }

  // 2) raw base64 → zlib bytes
  strategies.push(new Uint8Array(decoded));

  return strategies;
}

function asParsed(data: unknown): ParsedEmblemCode | null {
  if (!data || typeof data !== "object") return null;
  const record = data as {
    playername?: string;
    playerclantag?: string;
    playerbg?: string;
    stack?: unknown;
  };
  if (!Array.isArray(record.stack)) return null;
  if (record.stack.length > 32) return null;
  return {
    playername: record.playername,
    playerclantag: record.playerclantag,
    playerbg: record.playerbg,
    stack: record.stack,
    layerCount: record.stack.length,
  };
}

/**
 * Decode SAVE codes from the community BO2 emblem editor.
 * Supports dankogai Base64URL + pako (editor SAVE) and raw zlib Base64URL.
 */
export function parseEmblemCodeResult(raw: string): EmblemParseResult {
  const code = sanitizeEmblemInput(raw);
  if (code.length < 8) {
    return {
      ok: false,
      error: "Emblem code looks too short. Paste the full SAVE code from the editor.",
    };
  }
  if (code.length > 100000) {
    return {
      ok: false,
      error: "Emblem code is too long.",
    };
  }
  if (!/^[A-Za-z0-9\-_+/]+=*$/.test(code)) {
    return {
      ok: false,
      error:
        "Emblem code has invalid characters. Copy the SAVE code only (or the editor ?load= URL).",
    };
  }

  const strategies = decodeStrategies(code);
  if (!strategies.length) {
    return { ok: false, error: "Could not decode emblem code." };
  }

  const errors: string[] = [];
  for (const bytes of strategies) {
    try {
      const parsed = asParsed(inflateJson(bytes));
      if (!parsed) {
        errors.push("Decoded, but no layer stack found.");
        continue;
      }
      return { ok: true, data: parsed };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "decode failed");
    }
  }

  return {
    ok: false,
    error:
      "Invalid emblem code. In the editor click SAVE, copy the whole code, and paste it here.",
  };
}

export function parseEmblemCode(raw: string): ParsedEmblemCode | null {
  const result = parseEmblemCodeResult(raw);
  return result.ok ? result.data : null;
}
