import type { StreamingMedia } from "@/lib/types";
import type { ScrapeProvider } from "../types";
import { httpGetJson } from "../http";
import { extractPagesFromHtml, simulateFetchHtml } from "../html";

const API = "https://api.mangadex.org";

interface MangaResult {
  id: string;
  attributes?: { title?: Record<string, string | undefined> };
}

interface ChapterResult {
  id: string;
  attributes?: { title?: string | null };
}

interface AtHomeResponse {
  baseUrl?: string;
  chapter?: { hash?: string; data?: string[] };
}

const LANGUAGES = ["en", "pt-br", "pt"];

/** Fonte 1 — API oficial do MangaDex (sem raspagem de HTML). */
export const mangadexProvider: ScrapeProvider = {
  id: "mangadex",
  name: "MangaDex",
  domain: "https://mangadex.org",
  async scrape(query: string): Promise<StreamingMedia> {
    try {
      return await searchFirstChapter(query);
    } catch (err) {
      console.error("[mangadex] fallback offline, causa:", err);
      // Fallback offline: HTML simulado para a leitura continuar demonstrável.
      const html = await simulateFetchHtml(
        `https://mangadex.org/title/${encodeURIComponent(query)}`
      );
      const pages = extractPagesFromHtml(html, "https://mangadex.org/");
      return {
        id: `mangadex:${query}`,
        title: query,
        type: "comic",
        pages,
      };
    }
  },
};

async function searchFirstChapter(query: string): Promise<StreamingMedia> {
  // Prefere obras com tradução em pt-br; se não houver, busca em todas as
  // línguas (MangaDex ainda pode entregar por título em EN/JP).
  const searchUrl = (langFilter: boolean) =>
    `${API}/manga?title=${encodeURIComponent(query)}&includes[]=cover_art&limit=10${
      langFilter ? "&availableTranslatedLanguage[]=pt-br" : ""
    }`;
  let search = await httpGetJson<{ data?: MangaResult[] }>(searchUrl(true));
  if (!search?.data?.length) {
    search = await httpGetJson<{ data?: MangaResult[] }>(searchUrl(false));
  }
  const normalized = query.trim().toLowerCase();
  // Prioriza título exato, depois começo-de-frase, depois qualquer ocorrência.
  const candidates = (search.data ?? []).map((m) => {
    const titles = Object.values(m?.attributes?.title ?? {}).filter(
      (t): t is string => Boolean(t)
    );
    const lower = titles.map((t) => t.toLowerCase());
    let score = Infinity;
    if (lower.includes(normalized)) score = Math.min(score, 0);
    if (lower.some((t) => t.startsWith(normalized))) score = Math.min(score, 1);
    if (lower.some((t) => t.includes(normalized))) score = Math.min(score, 2);
    return { m, score, titles };
  });
  candidates.sort((a, b) => a.score - b.score);
  const manga = candidates.find((c) => c.score < Infinity) ?? candidates[0];

  if (!manga?.m?.id) {
    throw new Error("MangaDex: nenhum mangá encontrado.");
  }

  const mangaId = manga.m.id;
  const title = manga.titles[0] ?? query;

  const langs = LANGUAGES.map((l) => `translatedLanguage[]=${l}`).join("&");
  const feed = await httpGetJson<{ data?: ChapterResult[] }>(
    `${API}/manga/${mangaId}/feed?${langs}&order[chapter]=asc&order[volume]=asc&limit=10`
  );
  const chapters = feed.data ?? [];
  if (chapters.length === 0) {
    throw new Error("MangaDex: nenhum capítulo traduzido.");
  }

  // Alguns capítulos têm as imagens removidas (licenciamento/limpeza).
  // Tenta os primeiros até encontrar um com páginas reais.
  for (const chapter of chapters.slice(0, 6)) {
    const atHome = await httpGetJson<AtHomeResponse>(
      `${API}/at-home/server/${chapter.id}?forcePort443=true`
    );
    const base = atHome.baseUrl;
    const hash = atHome.chapter?.hash;
    const data = atHome.chapter?.data ?? [];

    const pages = data
      .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
      .map((name) => `${base}/data/${hash}/${name}`);

    if (pages.length === 0) continue;

    const chapterTitle = chapter.attributes?.title || "";
    const suffix = chapterTitle ? ` — ${chapterTitle}` : "";

    return {
      id: `mangadex:${chapter.id}`,
      title: `${title}${suffix}`,
      type: "comic",
      pages,
    };
  }

  throw new Error("MangaDex: capítulos sem imagens disponíveis.");
}