# BO2 Create-a-Class (Fan Pick 10 Builder)

Unofficial, browser-based **Call of Duty: Black Ops II** Create-a-Class experience built with Next.js, React, and Tailwind CSS. Entirely client-side.

## Features

- Full **Pick 10** allocation with live `X/10` counter
- Primary / secondary weapons, attachments, perks, equipment, wildcards
- Wildcard rules: Primary/Secondary Gunfighter, Overkill, Perk Greed, Danger Close, Tactician
- Selection modal for every slot
- Custom class name, remove item, **New Class** reset
- Persist current class in `localStorage`
- **Share Class** encodes the loadout into the URL (`?c=...`)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```

## Project layout

```
src/
  data/          # Weapons, attachments, perks, equipment, wildcards
  types/         # Shared TypeScript types
  lib/           # Pick 10 rules, storage, share encoding
  hooks/         # useClassBuild state controller
  components/    # UI (board, slots, selector, counter)
  app/           # Next.js App Router entry
```

Game data is separated from UI so the full BO2 item list, icons, and future features (saved classes, auth, `/class/[id]` URLs) can be added without rewriting the builder.

## Item images

Icons live under `public/images/{weapons|attachments|perks|equipment|wildcards}/`.

Paths resolve automatically as `/images/{folder}/{id}.svg`. Override any item with an `icon` field in the data files.

Regenerate the included tactical SVG placeholders:

```bash
npm run generate:icons
```

To use real artwork later, drop PNG/WebP files into those folders (matching the item `id`) and set `icon` on the item, e.g. `icon: "/images/weapons/mtar.webp"`.
