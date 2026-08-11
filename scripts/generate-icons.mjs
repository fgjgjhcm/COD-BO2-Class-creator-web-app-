/**
 * Generates original tactical SVG icons for every class-builder item.
 * Fan-made silhouettes — not ripped from game assets.
 *
 * Run: node scripts/generate-icons.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "public", "images");

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function accent(id) {
  const hues = [18, 24, 32, 12, 28, 8, 40, 16];
  const h = hues[hash(id) % hues.length];
  return `hsl(${h} 100% 55%)`;
}

function wrap(viewBox, body, opts = {}) {
  const { w = 256, h = 256, bg = "#14161a" } = opts;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c1e24"/>
      <stop offset="100%" stop-color="${bg}"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4d4d8"/>
      <stop offset="45%" stop-color="#9ca3af"/>
      <stop offset="100%" stop-color="#52525b"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="8" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="rgba(255,106,0,0.18)" stroke-width="2"/>
  ${body}
</svg>`;
}

function weaponSvg(id, kind) {
  const a = accent(id);
  const variant = hash(id) % 4;
  const barrelLen = 70 + (hash(id) % 40);
  const stock = variant === 0 ? 28 : variant === 1 ? 34 : 22;
  const magH = kind === "smg" ? 28 : kind === "sniper" ? 18 : kind === "pistol" ? 22 : 32;
  const bodyW = kind === "pistol" ? 90 : kind === "sniper" ? 150 : 120;
  const y = 64;

  if (kind === "pistol") {
    return wrap(
      "0 0 256 160",
      `
      <g transform="translate(40,20)">
        <path d="M20 ${y} h${bodyW} v14 h-${bodyW - 18} v28 h-22 z" fill="url(#metal)"/>
        <rect x="${20 + bodyW}" y="${y + 2}" width="36" height="8" fill="#a1a1aa"/>
        <rect x="28" y="${y - 10}" width="18" height="10" fill="#71717a"/>
        <path d="M38 ${y + 14} v${magH} h16 v-${magH}" fill="#3f3f46"/>
        <circle cx="${20 + bodyW + 8}" cy="${y + 6}" r="3" fill="${a}"/>
        <text x="20" y="28" fill="${a}" font-family="Arial Black, sans-serif" font-size="14" letter-spacing="2">${id.slice(0, 6).toUpperCase()}</text>
      </g>`,
      { w: 256, h: 160 },
    );
  }

  const optic =
    kind === "sniper"
      ? `<rect x="78" y="${y - 18}" width="48" height="12" rx="1" fill="#71717a"/><circle cx="102" cy="${y - 12}" r="5" fill="${a}" opacity="0.8"/>`
      : variant % 2 === 0
        ? `<rect x="70" y="${y - 14}" width="22" height="10" fill="#71717a"/>`
        : "";

  const grip =
    kind === "smg"
      ? `<path d="M70 ${y + 16} l8 34 h14 l-4 -34 z" fill="#3f3f46"/>`
      : `<path d="M78 ${y + 16} l6 36 h16 l-2 -36 z" fill="#3f3f46"/>`;

  return wrap(
    "0 0 320 160",
    `
    <g transform="translate(24,18)">
      <path d="M${stock} ${y} h${bodyW} v16 H${stock + 12} v8 H${stock} z" fill="url(#metal)"/>
      <rect x="${stock + bodyW}" y="${y + 4}" width="${barrelLen}" height="7" fill="#a1a1aa"/>
      <rect x="${stock + bodyW + barrelLen - 6}" y="${y + 2}" width="10" height="11" fill="#71717a"/>
      <path d="M${stock - 18} ${y + 2} h20 v20 h-8 l-12 -8 z" fill="#52525b"/>
      ${grip}
      <rect x="${stock + 48}" y="${y + 16}" width="14" height="${magH}" fill="#3f3f46"/>
      ${optic}
      <rect x="${stock + 20}" y="${y - 2}" width="36" height="4" fill="${a}" opacity="0.85"/>
      <text x="${stock}" y="30" fill="${a}" font-family="Arial Black, sans-serif" font-size="13" letter-spacing="1.5">${id.replaceAll("_", " ").toUpperCase()}</text>
    </g>`,
    { w: 320, h: 160 },
  );
}

function attachmentSvg(id, category) {
  const a = accent(id);
  let art = "";
  if (category === "optic") {
    art = `
      <rect x="78" y="70" width="100" height="70" fill="#27272a" stroke="#52525b" stroke-width="3"/>
      <circle cx="128" cy="105" r="28" fill="#09090b" stroke="${a}" stroke-width="3"/>
      <circle cx="128" cy="105" r="8" fill="${a}" opacity="0.7"/>
      <path d="M128 78 v10 M128 122 v10 M100 105 h10 M146 105 h10" stroke="${a}" stroke-width="2"/>`;
  } else if (category === "barrel") {
    art = `
      <rect x="48" y="110" width="160" height="18" rx="2" fill="url(#metal)"/>
      <rect x="196" y="104" width="28" height="30" fill="#71717a"/>
      <circle cx="210" cy="119" r="5" fill="${a}"/>`;
  } else if (category === "magazine") {
    art = `
      <path d="M100 60 h56 l8 120 h-72 z" fill="#3f3f46" stroke="#71717a" stroke-width="3"/>
      <rect x="112" y="80" width="32" height="8" fill="${a}"/>
      <rect x="112" y="100" width="32" height="8" fill="#52525b"/>
      <rect x="112" y="120" width="32" height="8" fill="#52525b"/>`;
  } else if (category === "underbarrel") {
    art = `
      <rect x="70" y="90" width="116" height="16" fill="#71717a"/>
      <path d="M100 106 v50 h20 v-30 h16 v-20 z" fill="#3f3f46"/>
      <rect x="148" y="106" width="18" height="40" fill="${a}" opacity="0.8"/>`;
  } else if (category === "stock") {
    art = `
      <path d="M60 100 h90 v20 H90 l-30 30 H50 z" fill="url(#metal)"/>
      <rect x="150" y="104" width="40" height="12" fill="#71717a"/>
      <rect x="70" y="108" width="24" height="6" fill="${a}"/>`;
  } else {
    art = `
      <rect x="88" y="88" width="80" height="80" fill="#27272a" stroke="${a}" stroke-width="3"/>
      <path d="M108 128 h40 M128 108 v40" stroke="${a}" stroke-width="4"/>
      <circle cx="128" cy="128" r="10" fill="#52525b"/>`;
  }
  return wrap(
    "0 0 256 256",
    `${art}
    <text x="128" y="40" text-anchor="middle" fill="${a}" font-family="Arial Black, sans-serif" font-size="12" letter-spacing="2">${category.toUpperCase()}</text>`,
  );
}

function perkSvg(id, tier) {
  const a = accent(id);
  const symbols = {
    lightweight: `<path d="M128 70 l30 70 h-60 z" fill="none" stroke="${a}" stroke-width="4"/><path d="M100 160 h56" stroke="#a1a1aa" stroke-width="3"/>`,
    hardline: `<rect x="96" y="80" width="64" height="80" fill="none" stroke="${a}" stroke-width="4"/><path d="M112 120 h32" stroke="#a1a1aa" stroke-width="3"/>`,
    blind_eye: `<circle cx="128" cy="120" r="36" fill="none" stroke="${a}" stroke-width="4"/><path d="M100 100 l56 40 M100 140 l56 -40" stroke="#a1a1aa" stroke-width="3"/>`,
    flak_jacket: `<path d="M88 90 h80 l12 90 h-104 z" fill="#27272a" stroke="${a}" stroke-width="3"/><rect x="112" y="110" width="32" height="40" fill="#3f3f46"/>`,
    ghost: `<circle cx="128" cy="110" r="28" fill="none" stroke="${a}" stroke-width="3"/><path d="M100 140 q28 40 56 0" fill="none" stroke="#a1a1aa" stroke-width="3"/>`,
    toughness: `<path d="M128 72 l40 24 v40 l-40 28 l-40 -28 v-40 z" fill="none" stroke="${a}" stroke-width="4"/>`,
    scavenger: `<circle cx="128" cy="120" r="34" fill="none" stroke="${a}" stroke-width="4"/><path d="M128 98 v44 M110 120 h36" stroke="#a1a1aa" stroke-width="3"/>`,
    cold_blooded: `<path d="M128 76 v88 M100 100 h56 M108 140 h40" stroke="${a}" stroke-width="4"/>`,
    fast_hands: `<path d="M90 130 q38 -60 76 0" fill="none" stroke="${a}" stroke-width="4"/><circle cx="110" cy="130" r="8" fill="#a1a1aa"/><circle cx="146" cy="130" r="8" fill="#a1a1aa"/>`,
    hard_wired: `<rect x="92" y="92" width="72" height="72" fill="none" stroke="${a}" stroke-width="3"/><path d="M108 128 h40 M128 108 v40" stroke="#a1a1aa" stroke-width="3"/>`,
    dexterity: `<path d="M80 140 l48 -60 48 60" fill="none" stroke="${a}" stroke-width="4"/><circle cx="128" cy="150" r="8" fill="#a1a1aa"/>`,
    extreme_conditioning: `<path d="M88 150 h80 M104 150 v-50 h16 v50 M136 150 v-70 h16 v70" stroke="${a}" stroke-width="4"/>`,
    engineer: `<circle cx="128" cy="120" r="30" fill="none" stroke="${a}" stroke-width="4"/><path d="M128 90 v20 M128 130 v20 M98 120 h20 M138 120 h20" stroke="#a1a1aa" stroke-width="3"/>`,
    tactical_mask: `<rect x="92" y="96" width="72" height="48" rx="8" fill="#27272a" stroke="${a}" stroke-width="3"/><rect x="104" y="110" width="20" height="12" fill="#a1a1aa"/><rect x="132" y="110" width="20" height="12" fill="#a1a1aa"/>`,
    dead_silence: `<path d="M96 120 h64 M112 100 v40 M144 100 v40" stroke="${a}" stroke-width="4" opacity="0.35"/><path d="M108 120 h40" stroke="${a}" stroke-width="4"/>`,
  };
  const art =
    symbols[id] ||
    `<circle cx="128" cy="120" r="40" fill="none" stroke="${a}" stroke-width="4"/><text x="128" y="128" text-anchor="middle" fill="#fff" font-size="28" font-family="Arial Black, sans-serif">${tier}</text>`;

  return wrap(
    "0 0 256 256",
    `
    <circle cx="128" cy="128" r="96" fill="none" stroke="rgba(255,106,0,0.2)" stroke-width="2"/>
    ${art}
    <text x="128" y="220" text-anchor="middle" fill="#a1a1aa" font-family="Arial Black, sans-serif" font-size="11" letter-spacing="3">PERK ${tier}</text>`,
  );
}

function equipmentSvg(id, type) {
  const a = accent(id);
  let art = "";
  if (type === "lethal") {
    if (id.includes("axe")) {
      art = `<path d="M70 170 l90 -90 18 18 -90 90 z" fill="url(#metal)"/><path d="M150 70 l30 -20 20 30 -28 18 z" fill="${a}"/>`;
    } else if (id === "c4" || id === "claymore" || id === "bouncing_betty") {
      art = `<rect x="78" y="100" width="100" height="60" fill="#27272a" stroke="${a}" stroke-width="3"/><circle cx="128" cy="130" r="10" fill="${a}"/><rect x="96" y="90" width="64" height="10" fill="#52525b"/>`;
    } else {
      art = `<path d="M128 70 c40 0 54 40 54 70 0 50 -24 70 -54 70 s-54 -20 -54 -70 c0 -30 14 -70 54 -70z" fill="#3f3f46" stroke="${a}" stroke-width="3"/><rect x="120" y="58" width="16" height="18" fill="#a1a1aa"/>`;
    }
  } else {
    if (id === "shock_charge" || id === "black_hat") {
      art = `<rect x="88" y="88" width="80" height="80" rx="6" fill="#27272a" stroke="${a}" stroke-width="3"/><path d="M110 128 h36 M128 110 v36" stroke="${a}" stroke-width="4"/><circle cx="128" cy="128" r="16" fill="none" stroke="#a1a1aa" stroke-width="2"/>`;
    } else {
      art = `<path d="M128 72 c32 0 48 28 48 56 0 40 -20 60 -48 60 s-48 -20 -48 -60 c0 -28 16 -56 48 -56z" fill="#1f2937" stroke="${a}" stroke-width="3"/><path d="M128 96 v40" stroke="#a1a1aa" stroke-width="3"/><circle cx="128" cy="148" r="5" fill="${a}"/>`;
    }
  }
  return wrap(
    "0 0 256 256",
    `${art}
    <text x="128" y="220" text-anchor="middle" fill="#a1a1aa" font-family="Arial Black, sans-serif" font-size="11" letter-spacing="2">${type.toUpperCase()}</text>`,
  );
}

function wildcardSvg(id) {
  const a = accent(id);
  const labels = {
    primary_gunfighter: "PG",
    secondary_gunfighter: "SG",
    overkill: "OK",
    perk1_greed: "P1",
    perk2_greed: "P2",
    perk3_greed: "P3",
    danger_close: "DC",
    tactician: "TC",
  };
  return wrap(
    "0 0 256 256",
    `
    <path d="M128 40 l70 40 v70 l-70 40 -70 -40 v-70 z" fill="#1c1917" stroke="${a}" stroke-width="4"/>
    <path d="M128 64 l46 26 v46 l-46 26 -46 -26 v-46 z" fill="none" stroke="rgba(255,106,0,0.35)" stroke-width="2"/>
    <text x="128" y="140" text-anchor="middle" fill="${a}" font-family="Arial Black, sans-serif" font-size="36">${labels[id] || "WC"}</text>
    <text x="128" y="220" text-anchor="middle" fill="#a1a1aa" font-family="Arial Black, sans-serif" font-size="11" letter-spacing="2">WILDCARD</text>`,
  );
}

const weapons = [
  ["mtar", "assault_rifle"],
  ["type_25", "assault_rifle"],
  ["swat_556", "assault_rifle"],
  ["fal_osw", "assault_rifle"],
  ["m27", "assault_rifle"],
  ["scar_h", "assault_rifle"],
  ["smr", "assault_rifle"],
  ["an_94", "assault_rifle"],
  ["mp7", "smg"],
  ["pdw_57", "smg"],
  ["vector_k10", "smg"],
  ["msmc", "smg"],
  ["chicom_cqb", "smg"],
  ["skorpion_evo", "smg"],
  ["dsr_50", "sniper"],
  ["ballista", "sniper"],
  ["five_seven", "pistol"],
  ["tac_45", "pistol"],
  ["b23r", "pistol"],
  ["executioner", "pistol"],
  ["kap_40", "pistol"],
];

const attachments = [
  ["reflex", "optic"],
  ["eotech", "optic"],
  ["acog", "optic"],
  ["target_finder", "optic"],
  ["mms", "optic"],
  ["variable_zoom", "optic"],
  ["suppressor", "barrel"],
  ["quickdraw", "other"],
  ["fmj", "other"],
  ["laser", "other"],
  ["select_fire", "other"],
  ["grip", "underbarrel"],
  ["fast_mag", "magazine"],
  ["extended_mag", "magazine"],
  ["eotech_sight", "optic"],
  ["long_barrel", "barrel"],
  ["rapid_fire", "other"],
  ["ballistics_cpu", "other"],
  ["tri_bolt", "other"],
  ["tactical_knife", "underbarrel"],
  ["dual_band", "optic"],
  ["grenade_launcher", "underbarrel"],
  ["stock", "stock"],
  ["dual_wield", "other"],
];

const perks = [
  ["lightweight", 1],
  ["hardline", 1],
  ["blind_eye", 1],
  ["flak_jacket", 1],
  ["ghost", 1],
  ["toughness", 2],
  ["scavenger", 2],
  ["cold_blooded", 2],
  ["fast_hands", 2],
  ["hard_wired", 2],
  ["dexterity", 3],
  ["extreme_conditioning", 3],
  ["engineer", 3],
  ["tactical_mask", 3],
  ["dead_silence", 3],
];

const equipment = [
  ["frag", "lethal"],
  ["semtex", "lethal"],
  ["combat_axe", "lethal"],
  ["c4", "lethal"],
  ["claymore", "lethal"],
  ["bouncing_betty", "lethal"],
  ["concussion", "tactical"],
  ["flashbang", "tactical"],
  ["emp_grenade", "tactical"],
  ["smoke_grenade", "tactical"],
  ["sensor_grenade", "tactical"],
  ["shock_charge", "tactical"],
  ["black_hat", "tactical"],
];

const wildcards = [
  "primary_gunfighter",
  "secondary_gunfighter",
  "overkill",
  "perk1_greed",
  "perk2_greed",
  "perk3_greed",
  "danger_close",
  "tactician",
];

function write(rel, content) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

for (const [id, kind] of weapons) {
  write(`weapons/${id}.svg`, weaponSvg(id, kind));
}
for (const [id, category] of attachments) {
  write(`attachments/${id}.svg`, attachmentSvg(id, category));
}
for (const [id, tier] of perks) {
  write(`perks/${id}.svg`, perkSvg(id, tier));
}
for (const [id, type] of equipment) {
  write(`equipment/${id}.svg`, equipmentSvg(id, type));
}
for (const id of wildcards) {
  write(`wildcards/${id}.svg`, wildcardSvg(id));
}

console.log(
  `Generated ${
    weapons.length +
    attachments.length +
    perks.length +
    equipment.length +
    wildcards.length
  } icons in public/images`,
);
