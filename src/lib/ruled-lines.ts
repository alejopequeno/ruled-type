/*
 * The values behind ruled text. CSS places the rules (font units and lh);
 * these cover what CSS has no unit for and read the rest back to show it.
 */

/** The guides a rule can sit on, top to bottom. */
export const ANCHORS = ["cap-height", "x-height", "baseline", "descender"] as const;
export type Anchor = (typeof ANCHORS)[number];

/** text-box-trim: which edges of the block get trimmed. */
export const TRIMS = ["none", "trim-start", "trim-end", "trim-both"] as const;
export type Trim = (typeof TRIMS)[number];

/** text-box-edge, first keyword: where the top edge is trimmed to. */
export const OVER_EDGES = ["text", "cap", "ex"] as const;
export type OverEdge = (typeof OVER_EDGES)[number];

/** text-box-edge, second keyword: where the bottom edge is trimmed to. */
export const UNDER_EDGES = ["text", "alphabetic"] as const;
export type UnderEdge = (typeof UNDER_EDGES)[number];

export interface TextBox {
  trim: Trim;
  over: OverEdge;
  under: UnderEdge;
}

export const textBoxCss = ({ trim, over, under }: TextBox) =>
  trim === "none" ? "text-box: none;" : `text-box: ${trim} ${over} ${under};`;

/** Where a line's parts sit, in px, as the browser computed them. */
export interface LineMetrics {
  /** One line box: the period the rules repeat at (1lh). */
  line: number;
  /** The first baseline, from the top of the block's content box. */
  baseline: number;
  capHeight: number;
  xHeight: number;
  /** How far g, p and y drop below the baseline. */
  descender: number;
  /** The computed font size, to express the others in em. */
  fontSize: number;
}

/** Each guide's position from the top of the first line, matching the CSS. */
export function anchorOffset(metrics: LineMetrics, anchor: Anchor): number {
  switch (anchor) {
    case "cap-height":
      return metrics.baseline - metrics.capHeight;
    case "x-height":
      return metrics.baseline - metrics.xHeight;
    case "baseline":
      return metrics.baseline;
    case "descender":
      return metrics.baseline + metrics.descender;
  }
}

/**
 * Descender depth at a given font, in px. CSS has units for cap height (cap)
 * and x-height (ex) but none for this, so it comes from canvas.
 */
export function measureDescender(font: string): number | null {
  if (typeof document === "undefined") return null;
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return null;
  context.font = font;
  return context.measureText("gpy").actualBoundingBoxDescent;
}
