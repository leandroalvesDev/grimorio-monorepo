import type { StreamingMedia } from "@/lib/types";
import type { ScrapeProvider } from "../types";
import { httpPostJson } from "../http";
import { extractPagesFromHtml, simulateFetchHtml } from "../html";

/**
 * Fonte 3 — HQ Now (https://www.hq-now.com).
 *
 * O site é um SPA React/Vue: um fetch simples devolve o HTML com
 * "You need to enable JavaScript". A própria aplicação consome a API
 * interna via GraphQL — investigamos os bundles (nele constam as queries
 * `getHqsByName`, `getHqsById`, `getChapterById`) e as reutilizamos aqui:
 *
 *   1. getHqsByName(name)          → lista de HQs (busca)
 *   2. getHqsById(id)              → capítulos da HQ escolhida
 *   3. getChapterById(chapterId)   → pictures.pictureUrl[] (páginas)
 */

const GRAPHQL = "https://admin.hq-now.com/graphql";

interface HqNowResult {
  data?: {
    getHqsByName?: { id: number; name: string }[];
    getHqsById?: {
      id: number;
      name: string;
      capitulos?: { id: number; number: number; name?: string }[];
    };
    getChapterById?: {
      name?: string;
      number?: number;
      pictures?: { pictureUrl: string }[];
    };
  };
}

export const hqNowProvider: ScrapeProvider = {
  id: "hq-now",
  name: "HQ Now",
  domain: "https://www.hq-now.com",
  async scrape(query: string): Promise<StreamingMedia> {
    try {
      return await scrapeViaGraphql(query);
    } catch (err) {
      console.error("[hq-now] fallback offline, causa:", err);
      // Fallback offline: simula o acervo caso a rede bloqueie o site.
      const html = await simulateFetchHtml(
        `https://www.hq-now.com/hq/${encodeURIComponent(query)}`
      );
      const pages = extractPagesFromHtml(html, "https://www.hq-now.com/");
      return {
        id: `hq-now:${query}`,
        title: query,
        type: "comic",
        pages,
      };
    }
  },
};

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const json = await httpPostJson(GRAPHQL, { query, variables });
  return (json as { data: T }).data;
}

type HqDetail = { id: number; name: string; capitulos?: ChapterInfo[] };
type ChapterInfo = { id: number; number?: string; name?: string };

async function scrapeViaGraphql(query: string): Promise<StreamingMedia> {
  const names = Array.from(
    new Set([query.trim(), stripAccents(query).trim()])
  ).filter(Boolean);

  let resolveError = "nenhuma HQ encontrada";
  let hq: HqDetail | undefined;
  let chapters: ChapterInfo[] = [];

  for (const name of names) {
    const search = await graphql<{ getHqsByName?: { id: number; name: string }[] }>(
      `query getHqsByName($name: String!) {
        getHqsByName(name: $name) {
          id
          name
        }
      }`,
      { name }
    );
    const hqs = (search?.getHqsByName ?? []).slice(0, 5);
    if (hqs.length === 0) {
      resolveError = `sem resultados para "${name}"`;
      continue;
    }

    // O resolver de getHqsById devolve um array (ou um objeto indexado por
    // posição): normaliza para lista antes de ler capítulos.
    for (const candidate of hqs) {
      const detail = await graphql<{ getHqsById?: unknown }>(
        `query getHqsById($id: Int!) {
          getHqsById(id: $id) {
            id
            name
            capitulos {
              id
              number
              name
            }
          }
        }`,
        { id: candidate.id }
      );
      const raw = detail?.getHqsById;
      const list = (Array.isArray(raw) ? raw : Object.values(raw ?? {})) as HqDetail[];
      const entry = list[0];
      const caps = entry?.capitulos ?? [];
      if (caps.length > 0) {
        hq = entry;
        chapters = caps;
        break;
      }
      resolveError = `capítulos não encontrados para "${entry?.name}"`;
    }
    if (hq) break;
  }

  if (!hq || chapters.length === 0 || !chapters[0]?.id) {
    throw new Error(`HQ Now: ${resolveError}.`);
  }
  const chapter = chapters[0];

  const chapterData = await graphql<HqNowResult["data"]>(
    `query getChapterById($chapterId: Int!) {
      getChapterById(chapterId: $chapterId) {
        name
        number
        pictures {
          pictureUrl
        }
      }
    }`,
    { chapterId: chapter.id }
  );
  const pictures = chapterData?.getChapterById?.pictures ?? [];

  const pages = Array.from(
    new Set(pictures.map((p) => p.pictureUrl).filter(Boolean))
  );
  if (pages.length === 0) {
    throw new Error("HQ Now: capítulo sem imagens.");
  }

  const chapterLabel = chapter.name || (chapter.number ? `#${chapter.number}` : "");
  const chapterSuffix = chapterLabel ? ` — ${chapterLabel}` : "";

  return {
    id: `hq-now:${chapter.id}`,
    title: `${hq.name}${chapterSuffix}`,
    type: "comic",
    pages,
  };
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}