"use client";

import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { type Anchor, type LineMetrics, measureDescender, type TextBox } from "@/lib/ruled-lines";

/*
 * A block of text on ruled paper: one rule per line, sitting on a guide (cap
 * height, x-height, baseline or descender) or lower in the room under it.
 *
 * The rules are CSS (see .ruled in globals.css), in font units. JS measures
 * what CSS can't express: where the first and last baselines landed (they
 * move with text-box and with the font's ascent) and the descender depth.
 */

/** The root font size the rem values below are based on. */
const ROOT_PX = 16;

export interface RuledTextProps {
  children: ReactNode;
  /** In px, written to CSS as rem. */
  fontSize: number;
  /** Unitless, like CSS line-height. */
  lineHeight: number;
  fontWeight?: number;
  /** text-box-trim and text-box-edge for the block. */
  textBox: TextBox;
  /** The guide the rule sits on. */
  ruleAt?: Anchor;
  /** How far below its guide the rule sits, 0 to 1 of the room left below it. */
  ruleGap?: number;
  /** Draw the rule under each line. */
  showRules?: boolean;
  showGuides?: boolean;
  /** Tint the block's box, so trimming and edges show where it starts and ends. */
  showBox?: boolean;
  className?: string;
  /** Called with the values the CSS ended up using, e.g. to show them. */
  onMeasure?: (metrics: LineMetrics) => void;
}

interface Measured {
  firstBaseline: number;
  trailing: number;
  descenderEm: number;
}

const heightOf = (node: HTMLElement | null) => node?.getBoundingClientRect().height ?? 0;

export function RuledText({
  children,
  fontSize,
  lineHeight,
  fontWeight = 600,
  textBox,
  ruleAt = "baseline",
  ruleGap = 0,
  showRules = true,
  showGuides = false,
  showBox = false,
  className,
  onMeasure,
}: RuledTextProps) {
  const block = useRef<HTMLParagraphElement>(null);
  const firstMarker = useRef<HTMLSpanElement>(null);
  const lastMarker = useRef<HTMLSpanElement>(null);
  const capProbe = useRef<HTMLSpanElement>(null);
  const exProbe = useRef<HTMLSpanElement>(null);
  const [measured, setMeasured] = useState<Measured | null>(null);
  const report = useRef(onMeasure);
  useLayoutEffect(() => {
    report.current = onMeasure;
  });

  const trim = textBox.trim;
  const edge = `${textBox.over} ${textBox.under}`;

  useLayoutEffect(() => {
    const paragraph = block.current;
    const first = firstMarker.current;
    const last = lastMarker.current;
    if (!paragraph || !first || !last) return;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const style = getComputedStyle(paragraph);
      const box = paragraph.getBoundingClientRect();
      const contentTop = box.top + Number.parseFloat(style.paddingTop);
      const contentBottom = box.bottom - Number.parseFloat(style.paddingBottom);
      // An empty inline-block's bottom edge sits on the baseline of its line.
      const firstBaseline = first.getBoundingClientRect().bottom - contentTop;
      const lastBaseline = last.getBoundingClientRect().bottom - contentTop;
      const size = Number.parseFloat(style.fontSize);
      const descender = measureDescender(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`) ?? 0;
      setMeasured({
        firstBaseline,
        trailing: contentBottom - contentTop - lastBaseline,
        descenderEm: size ? descender / size : 0,
      });
      report.current?.({
        line: Number.parseFloat(style.lineHeight),
        baseline: firstBaseline,
        capHeight: heightOf(capProbe.current),
        xHeight: heightOf(exProbe.current),
        descender,
        fontSize: size,
      });
    };

    measure();
    // Measure again once the web font replaces the fallback.
    void document.fonts.ready.then(measure);
    return () => {
      cancelled = true;
    };
  }, [fontSize, lineHeight, fontWeight, trim, edge]);

  const style = {
    fontSize: `${fontSize / ROOT_PX}rem`,
    fontWeight,
    lineHeight,
    "--trim": trim,
    "--edge": edge,
    "--rule-gap": Math.min(1, Math.max(0, ruleGap)),
    ...(measured && {
      "--first-baseline": `${measured.firstBaseline}px`,
      "--trailing": `${measured.trailing}px`,
      "--descender-depth": `${measured.descenderEm}em`,
    }),
  } as CSSProperties;

  return (
    <p
      ref={block}
      className={`ruled relative ${className ?? ""}`}
      data-rule-at={ruleAt}
      data-no-rules={showRules ? undefined : ""}
      data-guides={showGuides ? "" : undefined}
      data-show-box={showBox ? "" : undefined}
      data-measured={measured ? "" : undefined}
      style={style}
    >
      {/* Probes: read back the cap and ex units the CSS uses, for the readout. */}
      <span ref={capProbe} aria-hidden="true" className="invisible absolute top-0 left-0 w-0" style={{ height: "1cap" }} />
      <span ref={exProbe} aria-hidden="true" className="invisible absolute top-0 left-0 w-0" style={{ height: "1ex" }} />
      <span ref={firstMarker} aria-hidden="true" className="inline-block size-0 align-baseline" />
      {children}
      <span ref={lastMarker} aria-hidden="true" className="inline-block size-0 align-baseline" />
    </p>
  );
}
