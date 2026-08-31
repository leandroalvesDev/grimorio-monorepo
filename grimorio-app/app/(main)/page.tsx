"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Puzzle, Search, Sparkles } from "lucide-react";
import { ContinueReadingRail } from "@/components/catalog/continue-reading-rail";
import { Rail } from "@/components/catalog/rail";
import { useRails } from "@/hooks/use-rails";

export default function HomePage() {
  const router = useRouter();
  const { rails } = useRails();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div>
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="bg-hero-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#d34134]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-[#d34134]/10 blur-3xl" />
        <div className="relative px-4 pb-8 pt-10 md:px-8 md:pb-10 md:pt-16">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff5a4e]">
            <span className="inline-block size-1.5 rounded-full bg-[#d34134]" />
            Sua estante
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Início
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
                <span className="font-display italic text-zinc-300">
                  Toda prateleira começa vazia.
                </span>{" "}
                Busque em tempo real nas fontes que você ativou.
              </p>
            </div>
            <a
              href="/addons"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-[#d34134]/40 hover:text-white"
            >
              <Puzzle className="size-3.5 text-[#ff5a4e]" />
              Explorar extensões
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-5 flex max-w-2xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar mangá, HQ ou livro… (MangaDex, HQ Now, Só Quadrinhos, Baixe Livros)"
                aria-label="Buscar na estante"
                className="w-full rounded-full border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#d34134]/50 focus:outline-none focus:ring-2 focus:ring-[#d34134]/30"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#d34134] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Search className="size-3.5" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </form>
        </div>
      </header>

      <main className="pb-10">
        <ContinueReadingRail />

        <p className="mb-2 flex items-center gap-1.5 px-4 text-[11px] text-zinc-600 md:px-8">
          <Sparkles className="size-3.5 text-[#d34134]" />
          Abaixo, um catálogo de demonstração do leitor. O conteúdo real chega
          pela{" "}
          <Link href="/search" className="text-[#ff5a4e] hover:underline">
            Busca
          </Link>{" "}
          — use as extensões que você ativar.
        </p>

        {rails.map((rail) => (
          <Rail key={rail.key} rail={rail} />
        ))}
      </main>
    </div>
  );
}