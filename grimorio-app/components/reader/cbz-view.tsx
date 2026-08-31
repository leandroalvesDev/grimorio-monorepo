"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import type { ReaderHandle, ReaderPosition } from "./types";

interface CbzViewProps {
  data: ArrayBuffer;
  initialPosition?: ReaderPosition;
  onProgress: (progress: number, position: ReaderPosition) => void;
  onError?: (error: Error) => void;
}

export const CbzView = forwardRef<ReaderHandle, CbzViewProps>(
  function CbzView({ data, initialPosition, onProgress, onError }, ref) {
    const [pageUrls, setPageUrls] = useState<string[] | null>(null);
    const [pageIdx, setPageIdx] = useState(0);
    const urlsRef = useRef<string[] | null>(null);
    const onProgressRef = useRef(onProgress);
    onProgressRef.current = onProgress;
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    useEffect(() => {
      let cancelled = false;
      const prevUrls = urlsRef.current;
      urlsRef.current = null;
      setPageUrls(null);

      (async () => {
        try {
          const { default: JSZip } = await import("jszip");
          const zip = await JSZip.loadAsync(data);

          const images = Object.keys(zip.files)
            .filter(
              (name) =>
                !zip.files[name].dir &&
                /\.(png|jpe?g|webp|gif)$/i.test(name)
            )
            .sort((a, b) =>
              a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: "base",
              })
            );

          if (images.length === 0) {
            throw new Error("Nenhuma página de imagem encontrada no CBZ.");
          }

          const urls = await Promise.all(
            images.map(async (name) => {
              const blob = await zip.files[name].async("blob");
              return URL.createObjectURL(blob);
            })
          );

          if (cancelled) {
            urls.forEach(URL.revokeObjectURL);
            return;
          }

          urlsRef.current = urls;
          setPageUrls(urls);

          const saved = initialPosition?.page;
          const start = Math.min(
            Math.max(saved ? saved - 1 : 0, 0),
            Math.max(urls.length - 1, 0)
          );
          setPageIdx(start);
        } catch (err) {
          if (!cancelled) {
            onErrorRef.current?.(
              err instanceof Error
                ? err
                : new Error("Falha ao abrir o CBZ.")
            );
          }
        }
      })();

      return () => {
        cancelled = true;
        prevUrls?.forEach(URL.revokeObjectURL);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
      if (pageUrls && pageUrls.length > 0) {
        onProgressRef.current((pageIdx + 1) / pageUrls.length, {
          page: pageIdx + 1,
        });
      }
    }, [pageIdx, pageUrls]);

    useImperativeHandle(ref, () => ({
      next() {
        setPageIdx((i) =>
          urlsRef.current ? Math.min(i + 1, urlsRef.current.length - 1) : i
        );
      },
      prev() {
        setPageIdx((i) => Math.max(i - 1, 0));
      },
      restart() {
        setPageIdx(0);
      },
      saveNow() {
        if (urlsRef.current) {
          onProgressRef.current(
            (pageIdx + 1) / urlsRef.current.length,
            { page: pageIdx + 1 }
          );
        }
      },
    }));

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        {pageUrls ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob local, sem otimização de servidor
          <img
            key={pageIdx}
            src={pageUrls[pageIdx]}
            alt={`Página ${pageIdx + 1}`}
            draggable={false}
            className="max-h-full w-full touch-manipulation select-none object-contain"
            loading="eager"
          />
        ) : (
          <Loader2 className="size-6 animate-spin text-[#ff5a4e]" />
        )}
      </div>
    );
  }
);