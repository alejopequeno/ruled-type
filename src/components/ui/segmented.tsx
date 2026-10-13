"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "cn"

/*
 * A segmented control: a small set of mutually exclusive options shown side
 * by side. A radio group underneath, so arrow keys move between options and
 * Tab leaves the group; the checked option lifts onto a white chip.
 */

interface SegmentedProps<T extends string> {
  options: readonly T[]
  value: T
  onValueChange: (value: T) => void
  /** Visible text per option; defaults to the value itself. */
  labels?: Partial<Record<T, string>>
  "aria-labelledby"?: string
  "aria-label"?: string
  className?: string
}

function Segmented<T extends string>({
  options,
  value,
  onValueChange,
  labels,
  className,
  ...props
}: SegmentedProps<T>) {
  return (
    <RadioGroupPrimitive
      data-slot="segmented"
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      className={cn(
        // Concentric: 10px outer = 8px option + 2px padding.
        "flex w-full rounded-[10px] bg-black/[0.06] p-[2px] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.04)]",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <RadioPrimitive.Root
          key={option}
          value={option}
          className={cn(
            "relative flex h-7 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-[8px] px-2 font-mono text-[11px] whitespace-nowrap text-black/55 outline-none select-none",
            "transition-[color,background-color,box-shadow] duration-150 ease-out",
            "hover:text-black/85",
            "focus-visible:ring-2 focus-visible:ring-black/40",
            "data-checked:bg-white data-checked:text-black data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.06),0_1px_2px_oklch(0_0_0/0.08),0_2px_6px_-2px_oklch(0_0_0/0.08)]",
            "motion-reduce:transition-none"
          )}
        >
          {labels?.[option] ?? option}
        </RadioPrimitive.Root>
      ))}
    </RadioGroupPrimitive>
  )
}

export { Segmented }
