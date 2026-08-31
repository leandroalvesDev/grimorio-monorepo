"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { mockCatalog } from "@/lib/mock-catalog";
import { fetchFile } from "@/lib/read-file";
import type { CatalogItem } from "@/lib/types";
import { useReaderStore } from "@/store/reader-store";
import { CbzView } from "./cbz-view";
import { EpubView } from "./epub-view";
import { ReaderMenu } from "./reader-menu";
import type { ReaderHandle, ReaderPosition } from "./types";

interface ReaderViewProps {
  itemId: string;
  repoId?: string;
  fallbackUrl?: string;
}

export function ReaderView({ itemId, repoId, fallbackUrl }: ReaderViewProps) {
  const router = useRouter();
  const catalogCache = useReaderStore((s) => s.catalogCache);
  const savedRecords = useReaderStore((s) => s.continueReading);
  const setReadingProgress = useReaderStore((s) => s.setReadingProgress);
  const isInLibrary = useReaderStore((s) => s.isInLibrary);
  const toggleLibrary = useReaderStore((s) => s.toggleLibrary);

  const { item, initialPosition } = useMemo(() => {
    const repoCat = repoId ? catalogCache[repoId] : null;

    const find = (itemIdIn: string) => {
      if (repoCat) {
        for (const rail of repoCat.rails) {
          const found = rail.items.find((i) => i.id === itemIdIn);
          if (found) return found;
        }
      }
      for (const rail of mockCatalog.rails) {
        const found = rail.items.find((i) => i.id === itemIdIn);
        if (found) return found;
      }
      return null;
    };

    const found = find(itemId);

    if (!found && fallbackUrl) {
      const guessType = /\.cbz$|\.zip$/i.test(fallbackUrl)
        ? "cbz"
        : "epub";
      let prettyTitle = itemId;
      try {
        prettyTitle = decodeURIComponent(itemId);
      } catch {
        /* mantém o id bruto se não for URI válida */
      }
      return {
        item: {
          id: itemId,
          type: guessType,
          title: prettyTitle,
          sourceUrl: fallbackUrl,
        } satisfies CatalogItem,
        initialPosition: undefined,
      };
    }

    const saved = savedRecords.find((p) => p.itemId === itemId);
    return { item: found, initialPosition: saved?.position ?? undefined };
  }, [itemId, repoId, fallbackUrl, catalogCache, savedRecords]);

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [file, setFile] = useState<ArrayBuffer | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rendererRef = useRef<ReaderHandle | null>(null);
  const pendingRef = useRef<{ progress: number; position: ReaderPosition } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushRef = useRef<() => void>(() => {});

  const flush = useCallback(() => {
    const pending = pendingRef.current;
    if (pending && item) {
      setReadingProgress({
        itemId,
        repoId,
        item,
        progress: pending.progress,
        position: pending.position,
      });
      pendingRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [item, itemId, repoId, setReadingProgress]);

  useEffect(() => {
    flushRef.current = flush;
  });

  const sourceUrl = item?.sourceUrl;
  const itemKey = item ? `${item.type}:${sourceUrl}` : null;

  useEffect(() => {
    let cancelled = false;

    if (!item) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset necessário ao trocar de item
    setStatus("loading");
    setCurrentProgress(0);
    setErrorMsg(null);

    fetchFile(item.sourceUrl)
      .then((ab) => {
        if (cancelled) return;
        setFile(ab);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg(err instanceof Error ? err.message : "Falha ao baixar o arquivo.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
      setFile(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey]);

  useEffect(
    () => () => {
      flushRef.current();
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const handleProgress = useCallback(
    (progress: number, position: ReaderPosition) => {
      setCurrentProgress(progress);
      pendingRef.current = { progress, position };
      if (!timerRef.current) {
        timerRef.current = setTimeout(flushRef.current, 1200);
      }
    },
    []
  );

  const handleRendererError = useCallback((error: Error) => {
    setStatus("error");
    setErrorMsg(error.message);
  }, []);

  const next = useCallback(() => rendererRef.current?.next(), []);
  const prev = useCallback(() => rendererRef.current?.prev(), []);
  const restart = useCallback(() => {
    rendererRef.current?.restart();
    setCurrentProgress(0);
  }, []);
  const back = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const inLibrary = item ? isInLibrary(item.id) : false;
  const rendererProps = {
    data: file as ArrayBuffer,
    initialPosition,
    onProgress: handleProgress,
    onError: handleRendererError,
  };

  if (!item) {
    return (
      <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-black px-8 text-center text-zinc-100">
        <p className="max-w-xs text-sm text-zinc-300">Item não encontrado.</p>
        <button
          onClick={back}
          className="inline-flex items-center gap-2 rounded-xl border border-[#d34134]/40 bg-[#d34134]/15 px-4 py-2 text-sm font-medium text-[#ff5a4e] transition-colors hover:bg-[#d34134]/25"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-zinc-100">
      {status === "loading" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4">
          <span className="relative flex size-12 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#d34134]/20" />
            <Loader2 className="relative size-6 animate-spin text-[#ff5a4e]" />
          </span>
          <p className="text-xs text-zinc-500">Carregando arquivo…</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="max-w-xs text-sm text-zinc-300">
            Não foi possível abrir este item.
          </p>
          {errorMsg && (
            <p className="max-w-sm break-words text-xs text-zinc-500">
              {errorMsg}
            </p>
          )}
          <button
            onClick={back}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d34134]/40 bg-[#d34134]/15 px-4 py-2 text-sm font-medium text-[#ff5a4e] transition-colors hover:bg-[#d34134]/25"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </button>
        </div>
      )}

      {status === "ready" && file && item && (
        <>
          {item.type === "epub" ? (
            <EpubView ref={rendererRef} {...rendererProps} />
          ) : (
            <CbzView ref={rendererRef} {...rendererProps} />
          )}

          {!menuOpen && (
            <>
              <div
                className="absolute inset-y-0 right-0 z-10 w-[22%]"
                role="button"
                aria-label="Próxima página"
                onClick={next}
              />
              <div
                className="absolute inset-y-0 left-0 z-10 w-[22%]"
                role="button"
                aria-label="Página anterior"
                onClick={prev}
              />
              <div
                className="absolute inset-y-0 left-[22%] z-10 w-[56%]"
                aria-label="Abrir menu"
                onClick={() => setMenuOpen(true)}
              />
            </>
          )}

          <ReaderMenu
            open={menuOpen}
            item={item}
            progress={currentProgress}
            inLibrary={inLibrary}
            onClose={() => setMenuOpen(false)}
            onToggleLibrary={() => toggleLibrary(item.id)}
            onRestart={restart}
            onBack={back}
          />
        </>
      )}
    </div>
  );
}