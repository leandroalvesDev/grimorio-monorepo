"use client";

import { BookOpen, Heart, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CatalogItem } from "@/lib/types";

interface ReaderMenuProps {
  open: boolean;
  item: CatalogItem;
  progress: number;
  inLibrary: boolean;
  onClose: () => void;
  onToggleLibrary: () => void;
  onRestart: () => void;
  onBack: () => void;
}

export function ReaderMenu({
  open,
  item,
  progress,
  inLibrary,
  onClose,
  onToggleLibrary,
  onRestart,
  onBack,
}: ReaderMenuProps) {
  if (!open) return null;

  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Menu do leitor"
    >
      <div
        className="relative mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-[#d34134]/15 blur-3xl" />

        <div className="relative flex items-start gap-4">
          <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-lg bg-white/5 shadow-[0_4px_20px_-4px_oklch(0.58_0.19_25/0.4)] ring-1 ring-white/10">
            {item.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.cover}
                alt=""
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-b from-white/[0.06] to-white/[0.01]">
                <BookOpen className="size-5 text-[#d34134]/70" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-display line-clamp-2 text-base font-semibold leading-snug text-white">
              {item.title}
            </h2>
            {item.author && (
              <p className="mt-0.5 text-xs text-zinc-500">{item.author}</p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="relative mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-400">
            <span>Progresso</span>
            <span className="font-medium text-zinc-200">{percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d34134] to-[#ff5a4e] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="relative mt-5 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 transition-transform active:scale-[0.98]"
            onClick={onToggleLibrary}
          >
            <Heart
              className={cn(
                "size-4",
                inLibrary ? "fill-red-500 text-red-500" : "text-zinc-400"
              )}
            />
            {inLibrary ? "Na biblioteca" : "Adicionar"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 transition-transform active:scale-[0.98]"
            onClick={onRestart}
          >
            <RotateCcw className="size-4" />
            Reiniciar
          </Button>
        </div>

        <Button
          variant="ghost"
          className="relative mt-2 w-full text-zinc-400 hover:text-white"
          onClick={onBack}
        >
          Sair do leitor
        </Button>
      </div>
    </div>
  );
}