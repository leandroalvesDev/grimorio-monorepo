import type { StreamingMedia } from "@/lib/types";
import type { ScrapeProvider } from "../types";
import { httpGetJson } from "../http";
import { simulateFetchHtml, extractPagesFromHtml } from "../html";

/**
 * Fonte 3 — Comick (antigo Comick.fun, atual api.comick.io).
 *
 * Foco em API: nenhum HTML é raspado. Fluxo:
 *   1. GET /search?q=<termo>&lang=pt-br,pt,en   → lista de HQs/mangás;
 *   2. GET /comic/<slug>/chapters?lang=…&order=asc → primeiro capítulo
 *      (preferindo português) que ainda tenha imagens;
 *   3. GET /chapter/<hid> → lista de imagens (URLs completas em
 *      `md_images[].url`, ou `chapter.images[].name` + servidor `/server`
 *      montando `https://meo.comick.pics/comick/<hid>/<arquivo>`).
 *
 * O ip do host está atrás de Cloudflare; em rede restrita o fetch falha e o
 * provedor cai no fallback offline (mesmo padrão das outras fontes).
 */

export const COMICK_API = "https://api.comick.io";

export const comickProvider: ScrapeProvider = {
  id: "comick",
  name: "Comick",
  domain: COMICK_API,
  async scrape(query: string): Promise<StreamingMedia> {
    try {
      const best = await findBestComic(query);
      if (!best) {
        throw new Error(`Comick: nenhum resultado para "${query}".`);
      }

      const chapter = await findReadableChapter(best.slug);
      if (!chapter) {
        throw new Error("Comick: nenhum capítulo em português/inglês disponível.");
      }

      const pages = await fetchChapterPages(chapter.hid);
      if (pages.length === 0) {
        throw new Error("Comick: capítulo sem imagens.");
      }

      const chapLabel = chapter.chap ?? chapter.title ?? "capítulos";
      const comicTitle = chapter.comicTitle ?? best.title ?? query;
      return {
        id: `comick:${chapter.hid}`,
        title: `${comicTitle} — ${chapLabel}`,
        type: "comic",
        pages,
      };
    } catch (err) {
      console.error("[comick] fallback offline, causa:", err);
      const fallback = await simulateFetchHtml(
        `${COMICK_API}/search?q=${encodeURIComponent(query)}`
      );
      const pages = extractPagesFromHtml(fallback, COMICK_API);
      return {
        id: `comick:${query}`,
        title: query,
        type: "comic",
        pages,
      };
    }
  },
};

interface ComicSearchHit {
  slug: string;
  title?: string;
}

interface ComickChapter {
  hid: string;
  title?: string | null;
  chap?: string | null;
  lang?: string;
  comicTitle?: string;
}

async function findBestComic(query: string): Promise<ComicSearchHit | null> {
  const normalized = query.trim().toLowerCase();
  const url = `${COMICK_API}/search?q=${encodeURIComponent(query)}&lang=pt-br,pt,en&limit=20`;
  const data = await httpGetJson<ComicSearchHit[]>(url);
  const hits = Array.isArray(data) ? data : [];

  let best: ComicSearchHit | null = null;
  let bestScore = Infinity;
  for (const hit of hits) {
    const title = (hit.title ?? "").toLowerCase();
    if (!title) continue;
    let score = Infinity;
    if (title === normalized) score = 0;
    else if (title.startsWith(normalized)) score = 1;
    else if (title.includes(normalized)) score = 2;

    if (best === null || score < bestScore) {
      best = hit;
      bestScore = score;
    }
  }

  return best ?? (hits[0] ?? null);
}

/**
 * Busca o primeiro capítulo legível (pt-br preferindo; depois pt/en),
 * na ordem de publicação. Para evitar milhares de capítulos, tenta `lang`
 * específicas e pega o primeiro que o servidor ainda tem imagem.
 */
async function findReadableChapter(
  slug: string
): Promise<ComickChapter | null> {
  const langAttempts = [
    "pt-br",
    "pt-br,pt",
    "pt-br,pt,en",
    "en,pt-br",
  ];

  for (const langs of langAttempts) {
    const url = `${COMICK_API}/comic/${encodeURIComponent(slug)}/chapters?lang=${encodeURIComponent(langs)}&limit=100&order=asc`;
    const json = await httpGetJson<{ chapters?: ComickChapter[] }>(url);
    const chapters = Array.isArray(json?.chapters) ? json.chapters : [];
    if (chapters.length === 0) continue;

    const sheet = chapters.find((c) => c && c.hid);
    if (sheet) return sheet;
  }

  return null;
}

async function fetchChapterPages(hid: string): Promise<string[]> {
  const data = await httpGetJson<{
    md_images?: { url?: string; name?: string }[];
    chapter?: { images?: { name?: string; url?: string }[] };
  }>(`${COMICK_API}/chapter/${encodeURIComponent(hid)}`);

  // Caminho 1: URLs completas preenchidas pela própria API.
  const direct = collectUrls([
    ...(data.md_images ?? []),
    ...(data.chapter?.images ?? []),
  ]);
  if (direct.length > 0) return direct;

  // Caminho 2: apenas nomes → montar com o servidor de imagens do Comick.
  const names = [
    ...(data.md_images ?? []),
    ...(data.chapter?.images ?? []),
  ]
    .map((i) => i.name)
    .filter((n): n is string => Boolean(n));
  if (names.length === 0) return [];

  let server = "https://meo.comick.pics";
  try {
    const srv = await httpGetJson<{ server?: string }>(`${COMICK_API}/server`);
    if (typeof srv?.server === "string" && srv.server.startsWith("http")) {
      server = srv.server.replace(/\/+$/, "");
    }
  } catch {
    /* mantém o servidor padrão */
  }

  return names.map((n) => `${server}/comick/${encodeURIComponent(hid)}/${n}`);
}

function collectUrls(items: { url?: string }[]): string[] {
  const out: string[] = [];
  for (const item of items) {
    if (typeof item.url === "string" && item.url.startsWith("http")) {
      out.push(item.url);
    }
  }
  return out;
}