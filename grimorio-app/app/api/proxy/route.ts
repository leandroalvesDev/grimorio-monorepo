import { NextRequest, NextResponse } from "next/server";

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 200;
/** Arquivos acima deste tamanho não são cacheados em memória. */
const MAX_CACHE_BYTES = 25 * 1024 * 1024;

interface CacheEntry {
  url: string;
  body: ArrayBuffer;
  contentType: string;
  status: number;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();

function isValidTarget(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (u.username || u.password) return null;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
      return null;
    }
    return u;
  } catch {
    return null;
  }
}

function respond(entry: CacheEntry, fromCache: boolean) {
  return new NextResponse(new Uint8Array(entry.body), {
    status: entry.status,
    headers: {
      "Content-Type": entry.contentType,
      "Content-Length": String(entry.body.byteLength),
      "Cache-Control": fromCache
        ? "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
        : "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
      "X-Grimorio-Cache": fromCache ? "HIT" : "MISS",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  if (!target) {
    return NextResponse.json(
      { error: "Parâmetro 'url' ausente." },
      { status: 400 }
    );
  }

  const parsed = isValidTarget(target);
  if (!parsed) {
    return NextResponse.json({ error: "URL inválida." }, { status: 400 });
  }

  const hit = cache.get(target);
  const isStale = hit && Date.now() - hit.fetchedAt > CACHE_TTL_MS;

  const refetch = async (): Promise<CacheEntry | null> => {
    try {
      const res = await fetch(parsed, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Grimorio/1.0 (PWA reader)",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      });

      if (!res.ok || res.status >= 400) return null;

      const body = await res.arrayBuffer();
      const entry: CacheEntry = {
        url: target,
        body,
        contentType: res.headers.get("content-type") ?? "application/octet-stream",
        status: res.status,
        fetchedAt: Date.now(),
      };

      if (body.byteLength <= MAX_CACHE_BYTES) {
        if (cache.size >= MAX_ENTRIES) cache.clear();
        cache.set(target, entry);
      }
      return entry;
    } catch {
      return null;
    }
  };

  if (hit && !isStale) {
    return respond(hit, true);
  }

  const fresh = await refetch();
  if (fresh) {
    return respond(fresh, false);
  }

  if (hit) {
    // Falha no upstream: serve a versão antiga em vez de quebrar a UI.
    return respond(hit, true);
  }

  return NextResponse.json(
    { error: "Não foi possível acessar o catálogo." },
    { status: 502 }
  );
}