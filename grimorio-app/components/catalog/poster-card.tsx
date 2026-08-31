import Link from "next/link";
import { BookOpen } from "lucide-react";
import { readerHref } from "@/lib/reader-href";
import { cn } from "@/lib/utils";
import type { CatalogItem } from "@/lib/types";

interface PosterCardProps {
  item: CatalogItem;
  progress?: number;
  repoId?: string;
  className?: string;
}

export function PosterCard({
  item,
  progress,
  repoId,
  className,
}: PosterCardProps) {
  return (
    <div className={cn("w-28 shrink-0 snap-start md:w-36", className)}>
      <Link
        href={readerHref(item, repoId)}
        className="group block focus-visible:outline-none"
        aria-label={`Abrir ${item.title}`}
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:shadow-[0_8px_30px_-6px_oklch(0.58_0.19_25/0.45)] group-hover:ring-[#d34134]/50 group-focus-visible:ring-2 group-focus-visible:ring-[#d34134]">
          {item.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-b from-white/[0.04] to-white/[0.01]">
              <span className="relative flex size-10 items-center justify-center rounded-xl bg-[#d34134]/10">
                <BookOpen className="size-5 text-[#d34134]/70" />
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {progress !== undefined && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
              <div
                className="h-full bg-gradient-to-r from-[#d34134] to-[#ff5a4e]"
                style={{
                  width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                }}
              />
            </div>
          )}

          {item.type === "epub" && (
            <span className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-300 backdrop-blur-sm">
              epub
            </span>
          )}
        </div>

        <p className="font-display mt-2 line-clamp-2 text-[11px] font-medium leading-snug text-zinc-200 transition-colors group-hover:text-white">
          {item.title}
        </p>
        {item.author && (
          <p className="mt-0.5 truncate text-[10px] text-zinc-500">
            {item.author}
          </p>
        )}
      </Link>
    </div>
  );
}