"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Loader2,
  Puzzle,
  Search,
  XCircle,
} from "lucide-react";
import { fetchExtensions } from "@/lib/extension-catalog";
import { fetchJson } from "@/lib/read-file";
import type { Extension, StreamingMedia } from "@/lib/types";
import { useReaderStore } from "@/store/reader-store";

interface ProviderResult {
  providerId: string;
  label: string;
  icon?: string;
  query: string;
  state: "loading" | "ok" | "error";
  media?: StreamingMedia | null;
  message?: string;
}

export function SearchClient({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const enabledExtensions = useReaderStore((s) => s.enabledExtensions);
  const [directory, setDirectory] = useState<Extension[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ProviderResult[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchExtensions()
      .then(setDirectory)
      .catch(() => setDirectory([]));
  }, []);

  const active = useMemo(() => {
    const byId = new Map(directory.map((e) => [e.id, e]));
    return enabledExtensions.map((id) => {
      const ext = byId.get(id);
      return {
        id,
        label: ext?.name ?? id,
        icon: ext?.icon,
        provider: ext?.provider ?? id,
      };
    });
  }, [directory, enabledExtensions]);

  const run = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q) return;
      if (active.length === 0) {
        setResults([]);
        return;
      }

      setBusy(true);
      setResults(
        active.map((a) => ({
          providerId: a.id,
          label: a.label,
          icon: a.icon,
          query: q,
          state: "loading" as const,
        }))
      );

      const settled = await Promise.all(
        active.map(
          async (a): Promise<ProviderResult> => {
            const base = {
              providerId: a.id,
              label: a.label,
              icon: a.icon,
              query: q,
            };
            try {
              const endpoint = `/api/scrape?provider=${encodeURIComponent(a.provider)}&query=${encodeURIComponent(q)}`;
              const media = await fetchJson<StreamingMedia>(endpoint);
              if (!media || (!media.pages?.length && !media.file)) {
                return {
                  ...base,
                  state: "error",
                  media: null,
                  message: "A fonte não devolveu páginas.",
                };
              }
              return { ...base, state: "ok", media };
            } catch (err) {
              return {
                ...base,
                state: "error",
                media: null,
                message:
                  err instanceof Error
                    ? err.message
                    : "Falha ao consultar a fonte.",
              };
            }
          }
        )
      );
      setResults(settled);
      setBusy(false);
    },
    [active]
  );

  useEffect(() => {
    if (!initialQuery) return;
    const t = setTimeout(() => {
      void run(initialQuery);
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    void run(q);
  }

  const okResults = results.filter((r) => r.state === "ok");

  return (
    <div>
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="bg-hero-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#d34134]/20 blur-3xl" />
        <div className="relative px-4 pb-8 pt-10 md:px-8 md:pb-10 md:pt-16">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff5a4e]">
            <span className="inline-block size-1.5 rounded-full bg-[#d34134]" />
            Buscar em todas as fontes
          </p>
          <div className="mt-3 max-w-2xl">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Busca
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              A busca consulta, em tempo real, cada extensão{" "}
              <span className="text-zinc-200">ativa</span> no
              dispositivo — MangaDex, HQ Now, Só Quadrinhos e Baixe Livros.
              Ative conectores em{" "}
              <Link href="/addons" className="text-[#ff5a4e] hover:underline">
                Extensões
              </Link>
              .
            </p>
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
                placeholder="Ex.: Berserk, Batman, Dom Casmurro…"
                aria-label="Buscar por mangá, HQ ou livro"
                className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#d34134]/50 focus:outline-none focus:ring-2 focus:ring-[#d34134]/30"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !query.trim()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#d34134] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Search className="size-3.5" />
              )}
              Buscar
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-500">Fonte ativa:</span>
            {active.length === 0 ? (
              <span className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[11px] text-zinc-400">
                nenhuma — instale uma extensão
              </span>
            ) : (
              active.map((a) => (
                <span
                  key={a.id}
                  className="flex items-center gap-1 rounded-full border border-[#d34134]/25 bg-[#d34134]/10 px-2.5 py-1 text-[11px] font-medium text-[#ff5a4e]"
                >
                  <Puzzle className="size-3" />
                  {a.label}
                </span>
              ))
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 md:px-8">
        {busy && (
          <p className="flex items-center gap-2 text-xs text-zinc-500">
            <Loader2 className="size-3.5 animate-spin" />
            Consultando as fontes ativas… (em tempo real, direto nas APIs)
          </p>
        )}

        {!busy && results.length === 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-10 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Search className="size-5 text-zinc-400" />
            </span>
            <p className="mt-3 text-sm font-medium text-zinc-200">
              {active.length === 0
                ? "Nenhuma extensão ativa"
                : "Digite um termo para buscar"}
            </p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-zinc-500">
              {active.length === 0
                ? "Ative MangaDex, HQ Now, Só Quadrinhos ou Baixe Livros em Extensões para buscar."
                : "Busque por um mangá, HQ ou livro e veja o que cada fonte encontra."}
            </p>
            {active.length === 0 && (
              <Link
                href="/addons"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#d34134] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <Puzzle className="size-3.5" />
                Ir para Extensões
              </Link>
            )}
          </div>
        )}

        {!busy && results.length > 0 && (
          <section>
            <h2 className="font-display mb-3 text-sm font-semibold text-zinc-200">
              Resultados ({okResults.length}){" "}
              <span className="font-normal text-zinc-500">
                — consulta em tempo real
              </span>
            </h2>
            <ul className="flex flex-col gap-2">
              {results.map((r) => (
                <ResultRow key={r.providerId} result={r} />
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function ResultRow({ result }: { result: ProviderResult }) {
  if (result.state === "loading") {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <Monogram label={result.label} icon={result.icon} dim />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#ff5a4e]">
            {result.label}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Consultando…</p>
        </div>
        <Loader2 className="size-4 animate-spin text-zinc-500" />
      </li>
    );
  }

  if (result.state === "error" || !result.media) {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <Monogram label={result.label} icon={result.icon} dim />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            {result.label}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {result.message ?? "Sem resultado para este termo."}
          </p>
        </div>
        <XCircle className="size-4 shrink-0 text-zinc-600" />
      </li>
    );
  }

  const media = result.media;
  const sourceUrl = `/api/scrape?provider=${encodeURIComponent(result.providerId)}&query=${encodeURIComponent(result.query)}`;
  const readHref = `/read/${encodeURIComponent(media.id)}?repo=${encodeURIComponent(result.providerId)}&url=${encodeURIComponent(sourceUrl)}&type=${media.type}`;

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-[#d34134]/30 hover:bg-white/[0.05]">
      <Monogram label={result.label} icon={result.icon} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#ff5a4e]">
          {result.label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-zinc-100">
          {media.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {formatMeta(media)}
        </p>
      </div>
      <Link
        href={readHref}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#d34134] px-3.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
      >
        <BookOpen className="size-3.5" />
        Ler
      </Link>
    </li>
  );
}

function Monogram({
  label,
  icon,
  dim,
}: {
  label: string;
  icon?: string;
  dim?: boolean;
}) {
  return (
    <span
      className={
        "flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#d34134]/12 font-display text-sm font-semibold text-[#ff5a4e]" +
        (dim ? " opacity-40" : "")
      }
    >
      {icon?.slice(0, 2).toUpperCase() || label.slice(0, 2).toUpperCase()}
    </span>
  );
}

function formatMeta(media: StreamingMedia): string {
  const parts: string[] = [];
  if (media.pages?.length) {
    parts.push(
      `${media.pages.length} página${media.pages.length === 1 ? "" : "s"}`
    );
  } else if (media.file) {
    const name = media.file.split("/").pop() ?? media.file;
    parts.push(name);
  }
  parts.push(media.type === "comic" ? "quadrinho" : "livro");
  if (media.file) {
    parts.push("arquivo direto");
  } else if (media.pages?.length) {
    try {
      parts.push(new URL(media.pages[0]).host);
    } catch {
      /* mantém sem host */
    }
  }
  return parts.join(" · ");
}