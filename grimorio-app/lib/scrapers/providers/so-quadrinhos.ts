import type { StreamingMedia } from "@/lib/types";
import type { ScrapeProvider } from "../types";
import { httpGetText } from "../http";
import {
  extractFileDownload,
  extractPagesFromHtml,
  extractPostLinks,
  hasSequentialReader,
  simulateFetchHtml,
} from "../html";

/**
 * Fonte 2 — Só Quadrinhos (https://site-soquadrinhos.com).
 *
 * O site roda em WordPress. A busca nativa do WordPress (`/?s=<query>`)
 * devolve uma lista de posts; o scraper entra no post mais relevante e:
 *
 *   a) se houver um leitor sequencial/g "aleria de imagens" no HTML,
 *      converte os <img> em páginas de streaming; ou
 *   b) captura o link direto do arquivo (.cbz/.pdf/.epub) para o leitor
 *      binário do Grimório processar.
 */

export const soQuadrinhosProvider: ScrapeProvider = {
  id: "so-quadrinhos",
  name: "Só Quadrinhos",
  domain: "https://site-soquadrinhos.com",
  async scrape(query: string): Promise<StreamingMedia> {
    try {
      const post = await findBestPost(query);
      if (!post) {
        throw new Error("Só Quadrinhos: nenhum post encontrado.");
      }

      const html = await httpGetText(post);

      const directFile = extractFileDownload(html, post);
      if (directFile) {
        return {
          id: `so-quadrinhos:${post}`,
          title: query,
          type: hasSequentialReader(html) ? "comic" : "book",
          pages: [],
          file: directFile,
        };
      }

      if (hasSequentialReader(html)) {
        const pages = extractPagesFromHtml(html, post);
        if (pages.length > 0) {
          return {
            id: `so-quadrinhos:${post}`,
            title: query,
            type: "comic",
            pages,
          };
        }
      }

      throw new Error("Só Quadrinhos: post sem leitor nem arquivo direto.");
    } catch (err) {
      console.error("[so-quadrinhos] fallback offline, causa:", err);
      const fallback = await simulateFetchHtml(
        `https://site-soquadrinhos.com?s=${encodeURIComponent(query)}`
      );
      const pages = extractPagesFromHtml(fallback, "https://site-soquadrinhos.com/");
      return {
        id: `so-quadrinhos:${query}`,
        title: query,
        type: "comic",
        pages,
      };
    }
  },
};

async function findBestPost(query: string): Promise<string | null> {
  const searchUrl = `https://site-soquadrinhos.com/?s=${encodeURIComponent(query)}`;
  const html = await httpGetText(searchUrl);

  const posts = extractPostLinks(html, "https://site-soquadrinhos.com");
  if (posts.length === 0) return null;

  const q = query.toLowerCase().split(" ")[0] ?? query.toLowerCase();
  return posts.find((p) => p.toLowerCase().includes(q)) ?? posts[0];
}