"use client";

import Link from "next/link";
import { BookMarked } from "lucide-react";
import { useReaderStore } from "@/store/reader-store";
import { PosterCard } from "./poster-card";

export function ContinueReadingRail() {
  const recents = useReaderStore((s) => s.continueReading);

  const sorted = [...recents].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <section className="px-4 pt-6 md:px-8">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-[#d34134]/12">
          <BookMarked className="size-3.5 text-[#ff5a4e]" />
        </span>
        <h2 className="font-display text-sm font-semibold tracking-tight text-zinc-100">
          Continue Lendo
        </h2>
      </div>

      {sorted.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-6 md:px-6">
          <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-[#d34134]/10 blur-3xl" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <BookMarked className="size-5 text-zinc-400" />
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Nada por aqui ainda
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                  Comece uma leitura e ela aparecerá nesta fila.
                </p>
              </div>
            </div>
            <Link
              href="/addons"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d34134]/40 bg-[#d34134]/10 px-3.5 py-1.5 text-xs font-medium text-[#ff5a4e] transition-colors hover:bg-[#d34134]/20"
            >
              Explorar catálogos
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-hide pb-2 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]">
          {sorted.map((p) => (
            <PosterCard
              key={p.itemId}
              item={p.item}
              progress={p.progress}
              repoId={p.repoId}
            />
          ))}
        </div>
      )}
    </section>
  );
}