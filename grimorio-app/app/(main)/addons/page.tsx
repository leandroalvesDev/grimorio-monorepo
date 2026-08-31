"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Puzzle,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchExtensions } from "@/lib/extension-catalog";
import { repoIdFromUrl } from "@/lib/repo-id";
import type { Extension, RepoStatus } from "@/lib/types";
import { useReaderStore } from "@/store/reader-store";

const statusMeta: Record<RepoStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  ok: {
    label: "Conectado",
    className: "text-emerald-400 border-emerald-400/20 bg-emerald-400/10",
    icon: CheckCircle2,
  },
  loading: {
    label: "Sincronizando",
    className: "text-amber-400 border-amber-400/20 bg-amber-400/10",
    icon: Loader2,
  },
  error: {
    label: "Falhou",
    className: "text-red-400 border-red-400/20 bg-red-400/10",
    icon: AlertTriangle,
  },
};

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
  const repositories = useReaderStore((s) => s.repositories);
  const addRepository = useReaderStore((s) => s.addRepository);
  const refreshRepository = useReaderStore((s) => s.refreshRepository);
  const removeRepository = useReaderStore((s) => s.removeRepository);

  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState<Record<string, boolean>>({});

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

  async function handleInstall(ext: Extension) {
    if (!ext.source_url || installing[ext.id]) return;
    setInstalling((v) => ({ ...v, [ext.id]: true }));
    setError(null);
    try {
      await addRepository(ext.source_url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível instalar esta extensão."
      );
    } finally {
      setInstalling((v) => ({ ...v, [ext.id]: false }));
    }
  }

  async function handleRefresh(id: string) {
    try {
      await refreshRepository(id);
    } catch {
      /* status "error" já reflete a falha */
    }
  }

  return (
    <div>
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="bg-hero-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[#d34134]/20 blur-3xl" />
        <div className="relative px-4 pb-8 pt-10 md:px-8 md:pb-10 md:pt-16">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff5a4e]">
            <span className="inline-block size-1.5 rounded-full bg-[#d34134]" />
            Repositórios da comunidade
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Explorar Extensões
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                O Grimório é uma prateleira vazia. Toque em{" "}
                <span className="text-zinc-200">Instalar</span> para injetar um
                catálogo da comunidade nos seus trilhos — sem colar links, sem
                pastas locais.
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
                const installed = repositories.some(
                  (r) => repoIdFromUrl(r.url) === repoIdFromUrl(ext.source_url)
                );
                const busy = installing[ext.id];
                return (
                  <li
                    key={ext.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
                  >
                    <ExtensionIcon icon={ext.icon} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {ext.name}
                      </p>
                      {ext.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                          {ext.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant={installed ? "outline" : "default"}
                      size="sm"
                      className={cn(
                        "shrink-0 gap-1.5",
                        installed &&
                          "text-[#ff5a4e] hover:bg-[#d34134]/10"
                      )}
                      disabled={busy}
                      onClick={() => handleInstall(ext)}
                    >
                      {busy ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : installed ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Sparkles className="size-3.5" />
                      )}
                      {installed ? "Instalado" : "Instalar"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-10 max-w-2xl">
          <h2 className="font-display mb-3 text-sm font-semibold text-zinc-200">
            Repositórios instalados ({repositories.length})
          </h2>

          {repositories.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-10 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Puzzle className="size-5 text-zinc-400" />
              </span>
              <p className="mt-3 text-sm font-medium text-zinc-200">
                Nenhum repositório instalado
              </p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-zinc-500">
                Use a lista acima para adicionar sua primeira extensão.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {repositories.map((repo) => {
                const status = statusMeta[repo.status];
                const StatusIcon = status.icon;
                return (
                  <li
                    key={repo.id}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#d34134]/12">
                      <Puzzle className="size-4 text-[#ff5a4e]" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {repo.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {repo.url}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        status.className
                      )}
                    >
                      {repo.status === "loading" ? (
                        <StatusIcon className="size-3 animate-spin" />
                      ) : (
                        <StatusIcon className="size-3" />
                      )}
                      {status.label}
                      {repo.version ? ` · v${repo.version}` : ""}
                    </span>

                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Atualizar ${repo.name}`}
                        disabled={repo.status === "loading"}
                        onClick={() => handleRefresh(repo.id)}
                      >
                        <RefreshCw className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remover ${repo.name}`}
                        className="text-zinc-400 hover:text-red-400"
                        onClick={() => removeRepository(repo.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-muted hover:text-zinc-200"
                        aria-label={`Abrir ${repo.url}`}
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}