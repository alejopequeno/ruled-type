"use client";

import { type ReactNode, useId, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import { Slider } from "@/components/ui/slider";
import {
  ANCHORS,
  type Anchor,
  anchorOffset,
  type LineMetrics,
  OVER_EDGES,
  type TextBox,
  TRIMS,
  textBoxCss,
  UNDER_EDGES,
} from "@/lib/ruled-lines";
import { RuledText } from "./ruled-text";

const HEADLINE =
  "We develop brand strategy, identity, and design systems that remain coherent across web, print, and motion.";
const BODY =
  "Every line of text sits on its own rule, like a notebook page. The rules repeat once per line height and slide to wherever the first baseline landed, so they hold for any text-box setting, font size or line-height.";

const ROOT_PX = 16;
const BODY_REM = 1.0625;

/* ─── Controls ────────────────────────────────────────────────────────── */

const CAPTION = "font-mono text-[11px] text-black/55";

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span id={id} className={CAPTION}>
          {label}
        </span>
        {value && (
          <output className="font-mono text-[11px] text-black tabular-nums">
            {value}
          </output>
        )}
      </div>
      {children(id)}
    </div>
  );
}

interface RangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}

function Range({ label, value, min, max, step, format, onChange }: RangeProps) {
  return (
    <Field label={label} value={format(value)}>
      {(id) => (
        <Slider
          aria-labelledby={id}
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(next) =>
            onChange(Array.isArray(next) ? next[0] : next)
          }
          className="cursor-pointer **:data-[slot=slider-thumb]:cursor-grab **:data-[slot=slider-thumb]:active:cursor-grabbing"
        />
      )}
    </Field>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(next) => onChange(next === true)}
        className="cursor-pointer"
      />
      <Label
        htmlFor={id}
        className="cursor-pointer font-mono text-[11px] font-normal text-black/70"
      >
        {label}
      </Label>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-3 border-t border-black/[0.07] pt-3.5 first:border-t-0 first:pt-0">
      <legend className="float-left mb-1 w-full font-mono text-[11px] tracking-wide text-black/40 uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

/* ─── Readout ─────────────────────────────────────────────────────────── */

const round = (value: number, places: number) =>
  Math.round(value * 10 ** places) / 10 ** places;
const em = (value: number, size: number) => `${round(value / size, 3)}em`;

const ANCHOR_LABELS: Record<Anchor, string> = {
  "cap-height": "cap",
  "x-height": "x",
  baseline: "base",
  descender: "desc",
};

function Readout({
  metrics,
  ruleAt,
  ruleGap,
}: {
  metrics: LineMetrics | null;
  ruleAt: Anchor;
  ruleGap: number;
}) {
  if (!metrics || !metrics.fontSize) return null;
  const size = metrics.fontSize;
  // Same as the CSS: the baseline sits at --tile-baseline inside each tile.
  const tileBaseline =
    metrics.capHeight +
    (metrics.line - metrics.capHeight - metrics.descender) / 2;
  const anchor =
    tileBaseline + anchorOffset(metrics, ruleAt) - metrics.baseline;
  const rule = anchor + ruleGap * (metrics.line - anchor - 1);
  const rows: [string, number][] = [
    ["1lh", metrics.line],
    ["first baseline", metrics.baseline],
    ["1cap", metrics.capHeight],
    ["1ex", metrics.xHeight],
    ["descender", metrics.descender],
    ["rule ↓ baseline", rule - tileBaseline],
  ];
  return (
    <dl className="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[11px]">
      {rows.map(([term, value]) => (
        <div key={term} className="flex items-baseline gap-1.5">
          <dt className="text-black/55">{term}</dt>
          <dd className="text-black tabular-nums">{em(value, size)}</dd>
          <dd className="text-black/45 tabular-nums">{round(value, 1)}px</dd>
        </div>
      ))}
    </dl>
  );
}

/* ─── Demo ────────────────────────────────────────────────────────────── */

type Block = "headline" | "body";

interface TypeSettings {
  /** rem */
  fontSize: number;
  lineHeight: number;
  weight: number;
}

const START: Record<Block, TypeSettings> = {
  headline: { fontSize: 3.25, lineHeight: 1.1, weight: 600 },
  body: { fontSize: BODY_REM, lineHeight: 1.7, weight: 400 },
};

const BLOCKS = ["headline", "body"] as const;
const BLOCK_LABELS: Record<Block, string> = {
  headline: "headline",
  body: "paragraph",
};

/** Layered, transparent shadows: a sheet lifted a little off the desk. */
const PAPER_SHADOW =
  "shadow-[0_0_0_1px_oklch(0_0_0/0.06),0_1px_2px_oklch(0_0_0/0.06),0_8px_16px_-4px_oklch(0_0_0/0.12),0_24px_48px_-12px_oklch(0_0_0/0.18)]";
const PANEL_SHADOW =
  "shadow-[0_0_0_1px_oklch(0_0_0/0.06),0_1px_2px_oklch(0_0_0/0.05),0_8px_24px_-8px_oklch(0_0_0/0.14)]";

export function RuledDemo() {
  const [settings, setSettings] = useState(START);
  const [editing, setEditing] = useState<Block>("headline");
  const [textBox, setTextBox] = useState<TextBox>({
    trim: "trim-both",
    over: "cap",
    under: "alphabetic",
  });
  const [ruleGap, setRuleGap] = useState(0);
  const [ruleAt, setRuleAt] = useState<Anchor>("baseline");
  const [showGuides, setShowGuides] = useState(false);
  const [showBox, setShowBox] = useState(true);
  const [showRules, setShowRules] = useState(true);
  const [metrics, setMetrics] = useState<Record<Block, LineMetrics | null>>({
    headline: null,
    body: null,
  });
  const current = settings[editing];
  const update = (patch: Partial<TypeSettings>) =>
    setSettings((all) => ({
      ...all,
      [editing]: { ...all[editing], ...patch },
    }));
  const measured = (block: Block) => (next: LineMetrics) =>
    setMetrics((all) => ({ ...all, [block]: next }));
  const edgesUsed = textBox.trim !== "none";
  const shared = { textBox, ruleGap, ruleAt, showRules, showGuides, showBox };

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside
        aria-label="Controls"
        className={`grid content-start gap-4 overflow-y-auto overscroll-contain rounded-2xl bg-white p-4 ${PANEL_SHADOW}`}
      >
        <Group title="text-box">
          <Field label="trim">
            {(id) => (
              <Segmented
                aria-labelledby={id}
                options={TRIMS}
                labels={{
                  "trim-start": "start",
                  "trim-end": "end",
                  "trim-both": "both",
                }}
                value={textBox.trim}
                onValueChange={(trim) =>
                  setTextBox((box) => ({ ...box, trim }))
                }
              />
            )}
          </Field>
          <div
            className={`grid gap-4 transition-opacity duration-150 ${edgesUsed ? "" : "opacity-40"}`}
          >
            <Field label="edge · top">
              {(id) => (
                <Segmented
                  aria-labelledby={id}
                  options={OVER_EDGES}
                  value={textBox.over}
                  onValueChange={(over) =>
                    setTextBox((box) => ({ ...box, over }))
                  }
                />
              )}
            </Field>
            <Field label="edge · bottom">
              {(id) => (
                <Segmented
                  aria-labelledby={id}
                  options={UNDER_EDGES}
                  value={textBox.under}
                  onValueChange={(under) =>
                    setTextBox((box) => ({ ...box, under }))
                  }
                />
              )}
            </Field>
          </div>
          <code className="rounded-lg bg-black/[0.04] px-2.5 py-2 font-mono text-[11px] leading-relaxed text-black/70">
            {textBoxCss(textBox)}
          </code>
        </Group>

        <Group title="type">
          <Segmented
            aria-label="Block to edit"
            options={BLOCKS}
            labels={BLOCK_LABELS}
            value={editing}
            onValueChange={setEditing}
          />
          <Range
            label="font-size"
            value={current.fontSize}
            min={0.75}
            max={6}
            step={0.0625}
            format={(value) => `${value}rem`}
            onChange={(fontSize) => update({ fontSize })}
          />
          <Range
            label="line-height"
            value={current.lineHeight}
            min={0.9}
            max={2.4}
            step={0.05}
            format={(value) => `${round(value, 2)}`}
            onChange={(lineHeight) => update({ lineHeight })}
          />
          <Range
            label="font-weight"
            value={current.weight}
            min={300}
            max={800}
            step={10}
            format={(value) => `${value}`}
            onChange={(weight) => update({ weight })}
          />
        </Group>

        <Group title="rules">
          <Field label="rule at">
            {(id) => (
              <Segmented
                aria-labelledby={id}
                options={ANCHORS}
                labels={ANCHOR_LABELS}
                value={ruleAt}
                onValueChange={setRuleAt}
              />
            )}
          </Field>
          <Range
            label="gap below"
            value={ruleGap}
            min={0}
            max={1}
            step={0.05}
            format={(value) => `${Math.round(value * 100)}%`}
            onChange={setRuleGap}
          />
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Toggle label="rules" checked={showRules} onChange={setShowRules} />
            <Toggle label="text box" checked={showBox} onChange={setShowBox} />
            <Toggle
              label="guides"
              checked={showGuides}
              onChange={setShowGuides}
            />
          </div>
        </Group>
      </aside>

      {/* The sheet of ruled paper on the desk */}
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-4 overflow-hidden rounded-2xl bg-(--desk) p-4 sm:p-6">
        <div className="grid min-h-0 content-start justify-items-center overflow-hidden pt-[6vh]">
          <article
            className={`w-full max-w-[44rem] bg-white p-4 sm:p-6 ${PAPER_SHADOW}`}
          >
            <div className="grid gap-8 border border-black/25 px-0 pt-10 pb-8">
              <RuledText
                fontSize={settings.headline.fontSize * ROOT_PX}
                lineHeight={settings.headline.lineHeight}
                fontWeight={settings.headline.weight}
                onMeasure={measured("headline")}
                className="px-5 tracking-[-0.02em] sm:px-8"
                {...shared}
              >
                {HEADLINE}
              </RuledText>
              <RuledText
                fontSize={settings.body.fontSize * ROOT_PX}
                lineHeight={settings.body.lineHeight}
                fontWeight={settings.body.weight}
                onMeasure={measured("body")}
                className="px-5 sm:px-8"
                {...shared}
              >
                {BODY}
              </RuledText>
            </div>
          </article>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
          <span className="font-mono text-[11px] text-black/55 uppercase">
            {BLOCK_LABELS[editing]}
          </span>
          <Readout
            metrics={metrics[editing]}
            ruleAt={ruleAt}
            ruleGap={ruleGap}
          />
        </div>
      </div>
    </div>
  );
}
