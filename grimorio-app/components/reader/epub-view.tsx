"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { Book, Contents, Location, Rendition } from "epubjs";
import type { ReaderHandle, ReaderPosition } from "./types";

interface EpubViewProps {
  data: ArrayBuffer;
  initialPosition?: ReaderPosition;
  onProgress: (progress: number, position: ReaderPosition) => void;
  onError?: (error: Error) => void;
}

export const EpubView = forwardRef<ReaderHandle, EpubViewProps>(
  function EpubView({ data, initialPosition, onProgress, onError }, ref) {
    const hostRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<Book | null>(null);
    const renditionRef = useRef<Rendition | null>(null);
    const initialRef = useRef(initialPosition);
    initialRef.current = initialPosition;
    const onProgressRef = useRef(onProgress);
    onProgressRef.current = onProgress;
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    useEffect(() => {
      const host = hostRef.current;
      let cancelled = false;

      const saveFromLoc = (location: Location) => {
        const cfi = location.start?.cfi;
        if (!cfi) return;
        let pct = location.start?.percentage ?? 0;
        if (!pct) {
          try {
            const loc = bookRef.current?.locations;
            if (loc) pct = loc.percentageFromCfi(cfi) || 0;
          } catch {
            pct = 0;
          }
        }
        onProgressRef.current(pct, { cfi });
      };

      (async () => {
        try {
          const { default: ePub } = await import("epubjs");
          if (cancelled || !host) return;

          const book = ePub(data);
          bookRef.current = book;
          await book.ready;
          if (cancelled) return;

          try {
            await book.locations.generate(1000);
          } catch {
            /* progresso percentual fica indisponível — segue só com CFI */
          }
          if (cancelled) return;

          const rendition = book.renderTo(host, {
            width: "100%",
            height: "100%",
            flow: "scrolled-doc",
            spread: "none",
            allowScriptedContent: false,
          });
          renditionRef.current = rendition;

          rendition.themes.default({
            body: {
              background: "#0a0a0a !important",
              color: "#d4d4d8 !important",
              "font-family":
                "Georgia, 'Iowan Old Style', 'Charter', 'Times New Roman', serif",
              "line-height": "1.8 !important",
              "max-width": "42em !important",
              margin: "0 auto !important",
              padding: "0 0.5em !important",
            },
            p: { "margin-bottom": "1em !important" },
            a: { color: "#e8786d !important" },
          });

          rendition.hooks.content.register((contents: Contents) => {
            // O tipo declarado pede um `key`, mas o runtime aceita só `rules`.
            const c = contents as unknown as {
              addStylesheetRules: (rules: object) => void;
            };
            c.addStylesheetRules({
              body: {
                background: "#0a0a0a",
                color: "#d4d4d8",
              },
            });
          });

          rendition.on("relocated", saveFromLoc);

          const prev = initialRef.current?.cfi;
          if (prev) {
            try {
              await rendition.display(prev);
            } catch {
              await rendition.display();
            }
          } else {
            await rendition.display();
          }
        } catch (err) {
          if (!cancelled) {
            onErrorRef.current?.(
              err instanceof Error ? err : new Error("Falha ao abrir o EPUB.")
            );
          }
        }
      })();

      return () => {
        cancelled = true;
        try {
          renditionRef.current?.destroy();
        } catch {
          /* noop */
        }
        try {
          bookRef.current?.destroy?.();
        } catch {
          /* noop */
        }
        renditionRef.current = null;
        bookRef.current = null;
      };
    }, [data]);

    useImperativeHandle(ref, () => ({
      next() {
        try {
          renditionRef.current?.next();
        } catch {
          /* noop */
        }
      },
      prev() {
        try {
          renditionRef.current?.prev();
        } catch {
          /* noop */
        }
      },
      restart() {
        try {
          void renditionRef.current?.display();
        } catch {
          /* noop */
        }
      },
      saveNow() {
        const loc = renditionRef.current?.currentLocation();
        if (!loc || typeof loc.cfi !== "string") return;
        let pct = loc.percentage ?? 0;
        if (!pct) {
          try {
            const bookLoc = bookRef.current?.locations;
            if (bookLoc) pct = bookLoc.percentageFromCfi(loc.cfi) || 0;
          } catch {
            pct = 0;
          }
        }
        onProgressRef.current(pct, { cfi: loc.cfi });
      },
    }));

    return (
      <div
        ref={hostRef}
        aria-label="Conteúdo do livro"
        className="absolute inset-0 bg-[#0a0a0a] [&_iframe]:size-full"
      />
    );
  }
);