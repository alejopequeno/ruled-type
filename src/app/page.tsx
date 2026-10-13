import { RuledDemo } from "@/components/ruled-demo";

export default function Home() {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-7xl flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
      <header className="mb-4 flex shrink-0 flex-wrap items-baseline justify-between gap-2 font-mono text-[11px]">
        <h1 className="text-black">Ruled type</h1>
        <p className="text-black/50">every line on its rule · text-box, cap, ex, lh</p>
      </header>
      <RuledDemo />
    </main>
  );
}
