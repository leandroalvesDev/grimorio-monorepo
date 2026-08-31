"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/10 bg-black/60 backdrop-blur-xl md:flex">
      <Link href="/" className="group flex items-center gap-2.5 px-5 pb-6 pt-7">
        <span className="relative flex size-10 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-[#d34134]/25 blur-lg transition-opacity group-hover:opacity-100 group-hover:bg-[#d34134]/35"
          />
          <Image
            src="/manifest-icon-192.png"
            alt="Grimório"
            width={144}
            height={144}
            className="relative size-9 shrink-0"
            priority
          />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Grimório
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d34134]/60",
                active
                  ? "bg-[#d34134]/10 text-white shadow-[inset_0_0_0_1px_oklch(0.58_0.19_25/0.35)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              )}
            >
              <item.icon
                className={cn(
                  "size-4.5 transition-colors",
                  active ? "text-[#d34134]" : "text-zinc-400"
                )}
                strokeWidth={active ? 2.2 : 1.8}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4">
        <a
          href="/ajuda"
          className="group flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200">
            <BookOpen className="size-3.5 text-[#d34134]" />
            Como usar
          </span>
          <span className="text-[10px] leading-relaxed text-zinc-500">
            Entenda extensões e conectores da comunidade.
          </span>
        </a>
        <p className="mt-3 px-1 font-display text-[13px] italic leading-snug text-zinc-400">
          Uma prateleira vazia, cheia de possibilidades.
        </p>
        <p className="mt-1.5 px-1 text-[11px] leading-relaxed text-zinc-600">
          O conteúdo chega pelas extensões da comunidade.
        </p>
      </div>
    </aside>
  );
}