"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Power,
  Puzzle,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchExtensions } from "@/lib/extension-catalog";
import type { Extension } from "@/lib/types";
import { useReaderStore } from "@/store/reader-store";

function ExtensionIcon({ icon }: { icon?: string }) {
  if (!icon) {
    return (
      <span className="flex size-11 items-center justify-center rounded-xl bg-[#d34134]/12">
        <Puzzle className="size-5 text-[#ff5a4e]" />
      </span>
    );
  }
  if (/^https?:\/\//i.test(icon)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icon}
        alt=""
        referrerPolicy="no-referrer"
        className="size-11 rounded-xl object-cover"
      />
    );
  }
  return (
    <span className="flex size-11 items-center justify-center rounded-xl bg-[#d34134]/12 font-display text-sm font-semibold text-[#ff5a4e]">
      {icon.slice(0, 2).toUpperCase()}
    </span>
  );
}

function ExtensionSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <span className="size-11 shrink-0 animate-pulse rounded-xl bg-white/[0.06]" />
      <div className="min-w-0 flex-1 space-y-2">
        <span className="block h-3 w-2/5 animate-pulse rounded bg-white/[0.06]" />
        <span className="block h-2.5 w-4/5 animate-pulse rounded bg-white/[0.04]" />
      </div>
      <span className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
    </div>
  );
}

export default function AddonsPage() {
  const enabledExtensions = useReaderStore((s) => s.enabledExtensions);
  const toggleExtension = useReaderStore((s) => s.toggleExtension);

  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setExtensions(await fetchExtensions());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao carregar o diretório."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchExtensions();
        if (!cancelled) setExtensions(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar o diretório."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = extensions.reduce(
    (n, e) => n + (enabledExtensions.includes(e.id) ? 1 : 0),
    0
  );

  return (
    <div>
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="bg-hero-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#d34134]/20 blur-3xl" />
        <div className="relative px-4 pb-8 pt-10 md:px-8 md:pb-10 md:pt-16">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff5a4e]">
            <span className="inline-block size-1.5 rounded-full bg-[#d34134]" />
            Conectores da comunidade
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Explorar Extensões
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                Uma extensão é um{" "}
                <span className="text-zinc-200">conector dinâmico</span>: ativada,
                ela passa a responder à Busca em tempo real (API oficial do
                MangaDex, GraphQL do HQ Now, WordPress do Só Quadrinhos, download
                direto do Baixe Livros). Nada de arquivos estáticos — os
                resultados chegam ao vivo ao digitar.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              disabled={loading}
              onClick={fetchList}
            >
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
              Atualizar diretório
            </Button>
          </div>

          <div className="mt-4 rounded-xl border border-[#d34134]/25 bg-[#d34134]/10 px-4 py-3 text-sm text-zinc-300">
            <span className="flex items-center gap-2">
              <Search className="size-4 text-[#ff5a4e]" />
              <span className="font-medium text-zinc-100">
                {activeCount > 0
                  ? `${activeCount} extensão(ões) ativa(s).`
                  : "Nenhuma extensão ativa ainda."}
              </span>
            </span>
            <span className="mt-1 block text-xs text-zinc-400">
              Com uma extensão ativa, digite o termo na{" "}
              <a href="/search" className="text-[#ff5a4e] hover:underline">
                Busca
              </a>{" "}
              ou na barra do Início e veja o que a fonte encontra na hora.
            </span>
          </div>

          <a
            href="/ajuda"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#d34134]/30 bg-[#d34134]/10 px-3.5 py-1.5 text-xs font-medium text-[#ff5a4e] transition-colors hover:bg-[#d34134]/20"
          >
            <BookOpen className="size-3.5" />
            Não sabe por onde começar? Veja o guia →
          </a>
        </div>
      </header>

      <main className="px-4 py-6 md:px-8">
        {error && (
          <p className="mb-4 flex max-w-2xl items-start gap-2 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <section className="max-w-2xl">
          <h2 className="font-display mb-3 text-sm font-semibold text-zinc-200">
            {extensions.length > 0 || loading
              ? `Disponíveis (${loading ? "…" : extensions.length})`
              : "Disponíveis"}
          </h2>

          {loading ? (
            <div className="flex flex-col gap-2">
              <ExtensionSkeleton />
              <ExtensionSkeleton />
              <ExtensionSkeleton />
            </div>
          ) : extensions.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-10 text-center">
              <div className="pointer-events-none absolute -left-16 -top-20 size-52 rounded-full bg-[#d34134]/10 blur-3xl" />
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Sparkles className="size-5 text-zinc-400" />
              </span>
              <p className="mt-3 text-sm font-medium text-zinc-200">
                Nenhuma extensão encontrada
              </p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-zinc-500">
                Verifique se o diretório de extensões está no ar e tente
                atualizá-lo.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {extensions.map((ext) => {
                const active = enabledExtensions.includes(ext.id);
                return (
                  <li
                    key={ext.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border bg-white/[0.03] p-3 transition-colors",
                      active
                        ? "border-[#d34134]/30"
                        : "border-white/10 hover:border-white/15 hover:bg-white/[0.05]"
                    )}
                  >
                    <ExtensionIcon icon={ext.icon} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {ext.name}
                        </p>
                        <span
                          className={cn(
                            "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            active
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                              : "border-white/10 bg-white/[0.03] text-zinc-500"
                          )}
                        >
                          <CheckCircle2 className="size-3" />
                          {active ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      {ext.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                          {ext.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant={active ? "outline" : "default"}
                      size="sm"
                      className={cn(
                        "shrink-0 gap-1.5",
                        active &&
                          "text-[#ff5a4e] hover:bg-[#d34134]/10"
                      )}
                      onClick={() => toggleExtension(ext.id)}
                    >
                      {active ? (
                        <>
                          <Power className="size-3.5" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3.5" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-10 max-w-2xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-sm leading-relaxed text-zinc-400">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
              Como funciona
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-zinc-400">
              <li>
                <span className="text-zinc-200">Ativar</span> apenas registra a
                extensão no seu dispositivo — nenhum arquivo é baixado.
              </li>
              <li>
                Na <span className="text-zinc-200">Busca</span>, o Grimório chama{" "}
                <span className="text-zinc-200">/api/scrape</span> de cada
                extensão ativa com o termo digitado e lista o que a fonte retornou
                na hora.
              </li>
              <li>
                Clicou em “Ler”, o leitor abre em streaming (páginas) ou baixa o
                arquivo direto (EPUB/CBZ) — igual ao formato do catálogo de
                demonstração.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}