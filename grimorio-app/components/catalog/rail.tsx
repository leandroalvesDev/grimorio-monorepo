import { Layers } from "lucide-react";
import type { FlatRail } from "@/lib/types";
import { PosterCard } from "./poster-card";

export function Rail({ rail }: { rail: FlatRail }) {
  return (
    <section className="group/rail py-4">
      <div className="mb-3 flex items-baseline gap-2.5 px-4 md:px-8">
        <span className="flex size-6 shrink-0 translate-y-0.5 items-center justify-center rounded-md bg-[#d34134]/12">
          <Layers className="size-3.5 text-[#ff5a4e]" />
        </span>
        <h2 className="font-display text-sm font-semibold tracking-tight text-zinc-100 transition-colors group-hover/rail:text-white">
          {rail.title}
        </h2>
        {rail.subtitle && (
          <span className="truncate text-[11px] text-zinc-500">
            {rail.subtitle}
          </span>
        )}
      </div>

      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-hide px-4 pb-2 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)] md:px-8"
      >
        {rail.items.map((item) => (
          <PosterCard key={item.id} item={item} repoId={rail.repoId} />
        ))}
      </div>
    </section>
  );
}