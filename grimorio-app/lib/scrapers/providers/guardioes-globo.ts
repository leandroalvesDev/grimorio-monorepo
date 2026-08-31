import type { StreamingMedia } from "@/lib/types";
import type { ScrapeProvider } from "../types";
import { httpGetText } from "../http";
import { extractPagesFromHtml, extractPostLinks, simulateFetchHtml } from "../html";

/**
 * Fonte 3/4 — Guardiões do Globo (http://guardioesdoglobo.blogspot.com).
 *
 * Grupo brasileiro de scans de HQs (Invencível, Guardiões do Globo, etc.).
 * O site é um blog Blogger: cada post é uma página HTML estática cujo corpo
 * é a sequência de imagens da edição — que convertemos em páginas de
 * streaming com `extractPagesFromHtml`. A busca usa o `?s=` nativo do Blogger.
 */

const BLOG = "http://guardioesdoglobo.blogspot.com";

export const guardioesGloboProvider: ScrapeProvider = {
  id: "guardioes-do-globo",
  name: "Guardiões do Globo",
  domain: BLOG,
  async scrape(query: string): Promise<StreamingMedia> {
    try {
      const post = await findBestPost(query);
      if (!post) {
        throw new Error(`Guardiões do Globo: nenhum resultado para "${query}".`);
      }

      const html = await httpGetText(post);
      const pages = extractPagesFromHtml(html, post);
      if (pages.length === 0) {
        throw new Error("Guardiões do Globo: post sem imagens de leitura.");
      }

      const title = extractTitle(html) ?? query;
      return {
        id: `guardioes:${post}`,
        title,
        type: "comic",
        pages,
      };
    } catch (err) {
      console.error("[guardioes-do-globo] fallback offline, causa:", err);
      const fallback = await simulateFetchHtml(
        `${BLOG}/search?q=${encodeURIComponent(query)}`
      );
      const pages = extractPagesFromHtml(fallback, BLOG);
      return {
        id: `guardioes:${query}`,
        title: query,
        type: "comic",
        pages,
        placeholder: true,
      };
    }
  },
};

async function findBestPost(query: string): Promise<string | null> {
  const searchUrl = `${BLOG}/search?q=${encodeURIComponent(query)}&max-results=10`;
  const html = await httpGetText(searchUrl);

  const posts = extractPostLinks(html, BLOG);
  if (posts.length === 0) return null;

  const q = query.toLowerCase().split(" ")[0] ?? query.toLowerCase();
  return posts.find((p) => p.toLowerCase().includes(q)) ?? posts[0];
}

function extractTitle(html: string): string | null {
  const m = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
  const title = m?.[1]?.trim();
  if (!title || title === "Guardiões do Globo") return null;
  return title;
}