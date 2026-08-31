"use client";

import Link from "next/link";
import { HeartOff, LibraryBig, BookMarked } from "lucide-react";
import { mockCatalog } from "@/lib/mock-catalog";
import type { CatalogItem } from "@/lib/types";
import { useReaderStore } from "@/store/reader-store";
import { PosterCard } from "@/components/catalog/poster-card";
import { ContinueReadingRail } from "@/components/catalog/continue-reading-rail";

function buildItemMap(
  catalogCache: Record<string, { rails: { items: CatalogItem[] }[] }>
) {
  const map = new Map<string, CatalogItem>();
  for (const catalog of Object.values(catalogCache)) {
    for (const rail of catalog.rails) {
      for (const item of rail.items) map.set(item.id, item);
    }
  }
  for (const rail of mockCatalog.rails) {
    for (const item of rail.items) map.set(item.id, item);
  }
  return map;
}

export default function LibraryPage() {
  const library = useReaderStore((s) => s.library);
  const catalogCache = useReaderStore((s) => s.catalogCache);
  const continueReading = useReaderStore((s) => s.continueReading);

  const itemMap = buildItemMap(catalogCache);
  const savedItems = library
    .map((id) => itemMap.get(id))
    .filter((i): i is CatalogItem => Boolean(i));
  const readingItems = continueReading
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 10);

  return (
    <div>
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="bg-hero-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#d34134]/20 blur-3xl" />
        <div className="relative px-4 pb-8 pt-10 md:px-8 md:pb-10 md:pt-16">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff5a4e]">
            <span className="inline-block size-1.5 rounded-full bg-[#d34134]" />
            Suas obras
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Biblioteca
            </h1>
            {library.length > 0 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                {library.length} salvo
                {library.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
            Tudo que você marcou com o coração no leitor, num só lugar.
          </p>
        </div>
      </header>

      <main className="space-y-8 px-4 py-6 md:px-8">
        <ContinueReadingRail />

        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-[#d34134]/12">
              <LibraryBig className="size-3.5 text-[#ff5a4e]" />
            </span>
            <h2 className="font-display text-sm font-semibold tracking-tight text-zinc-100">
              Salvos na biblioteca
            </h2>
          </div>

          {savedItems.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-6">
              <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-[#d34134]/10 blur-3xl" />
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <HeartOff className="size-5 text-zinc-400" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Nada salvo por enquanto
                    </p>
                    <p className="mt-0.5 max-w-sm text-xs leading-relaxed text-zinc-500">
                      Durante a leitura, abra o menu (toque no centro) e toque no
                      coração para guardar uma obra aqui.
                    </p>
                  </div>
                </div>
                <Link
                  href="/"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#d34134] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  <BookMarked className="size-3.5" />
                  Explorar extensões
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {savedItems.map((item) => (
                <PosterCard
                  key={item.id}
                  item={item}
                  className="w-auto snap-none"
                />
              ))}
            </div>
          )}
        </section>

        {readingItems.length > 0 && (
          <section className="pb-6">
            <p className="text-[11px] leading-relaxed text-zinc-600">
              Para remover um item da biblioteca, abra a obra e use o menu do
              leitor.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}