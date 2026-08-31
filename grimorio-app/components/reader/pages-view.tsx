"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import type { ReaderHandle, ReaderPosition } from "./types";

interface PagesViewProps {
  pages: string[];
  initialPosition?: ReaderPosition;
  onProgress: (progress: number, position: ReaderPosition) => void;
  onError?: (error: Error) => void;
}

/**
 * Visualizador de mídia sequencial em streaming: recebe a lista de URLs de
 * páginas do formato `StreamingMedia` e renderiza imagem a imagem.
 */
/**
 * URLs de imagem vindas da fonte são roteadas pelo `/api/proxy` do próprio
 * app: o servidor baixa e serve a página (com cache). Assim a leitura não
 * depende de o navegador alcançar o CDN da fonte — mesma ideia do streaming
 * do Stremio, em que o conteúdo passa pelo servidor.
 */
function proxiedPageUrl(url: string): string {
  if (url.startsWith("/")) return url;
  if (typeof window === "undefined") return url;
  try {
    const u = new URL(url, window.location.origin);
    if (u.origin === window.location.origin) return url;
  } catch {
    return url;
  }
  return `/api/proxy?url=${encodeURIComponent(url)}`;
}

export const PagesView = forwardRef<ReaderHandle, PagesViewProps>(
  function PagesView({ pages, initialPosition, onProgress, onError }, ref) {
    const safePages = useMemo(
      () => pages.filter(Boolean).map(proxiedPageUrl),
      [pages]
    );
    const [pageIdx, setPageIdx] = useState(() => {
      const saved = initialPosition?.page;
      return Math.min(
        Math.max(saved ? saved - 1 : 0, 0),
        Math.max(safePages.length - 1, 0)
      );
    });
    const [loaded, setLoaded] = useState(false);
    const pagesRef = useRef(safePages);
    pagesRef.current = safePages;
    const onProgressRef = useRef(onProgress);
    onProgressRef.current = onProgress;
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    useEffect(() => {
      if (safePages.length === 0) {
        onErrorRef.current?.(new Error("Nenhuma página disponível."));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (safePages.length > 0) {
        onProgressRef.current((pageIdx + 1) / safePages.length, {
          page: pageIdx + 1,
        });
      }
    }, [pageIdx, safePages.length]);

    useImperativeHandle(ref, () => ({
      next() {
        setLoaded(false);
        setPageIdx((i) =>
          pagesRef.current ? Math.min(i + 1, pagesRef.current.length - 1) : i
        );
      },
      prev() {
        setLoaded(false);
        setPageIdx((i) => Math.max(i - 1, 0));
      },
      restart() {
        setLoaded(false);
        setPageIdx(0);
      },
      saveNow() {
        if (pagesRef.current) {
          onProgressRef.current(
            (pageIdx + 1) / pagesRef.current.length,
            { page: pageIdx + 1 }
          );
        }
      },
    }));

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        {safePages.length > 0 ? (
          <div className="relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem remota de streaming */}
            <img
              key={pageIdx}
              src={safePages[pageIdx]}
              alt={`Página ${pageIdx + 1}`}
              draggable={false}
              referrerPolicy="no-referrer"
              onLoad={() => setLoaded(true)}
              onError={() =>
                onErrorRef.current?.(
                  new Error(`Falha ao carregar a página ${pageIdx + 1}.`)
                )
              }
              className="max-h-full w-full touch-manipulation select-none object-contain"
              loading="eager"
            />
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[#ff5a4e]" />
              </div>
            )}
          </div>
        ) : (
          <Loader2 className="size-6 animate-spin text-[#ff5a4e]" />
        )}
      </div>
    );
  }
);