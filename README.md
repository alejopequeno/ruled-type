# Ruled type

Text on ruled paper: one rule per line, sitting exactly on the baseline (or on the cap height, x-height or descender), at any font size, line-height and `text-box` setting.

## How it works

- **The rules are CSS.** Each block's background is a tile `1lh` tall with a 1px stripe, repeated once per line. Inside the tile the guides are font units: cap height `1cap` above the baseline, x-height `1ex` above it.
- **The tiles slide onto the real baseline.** Where the first baseline lands depends on `text-box-trim` / `text-box-edge` and on the font's ascent, which has no CSS unit, so a zero-size inline marker measures it and the background is offset to match.
- **The descender depth** (how far g, p and y drop) also has no CSS unit; canvas `measureText` reads it and it's stored in `em`.
- The block always reserves room down to the bottom of its last line, so toggling guides or moving the rule never shifts the layout.

Built with Next.js, Tailwind CSS v4 and shadcn/ui (Base UI).

## Run it

```bash
pnpm install
pnpm dev
```
