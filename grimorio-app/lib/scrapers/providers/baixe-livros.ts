import type { StreamingMedia } from "@/lib/types";
import type { ScrapeProvider } from "../types";
import { httpGetText } from "../http";
import { extractFileDownload, extractPostLinks } from "../html";

/**
 * Fonte 4 — Baixe Livros (https://www.baixelivros.com.br).
 *
 * O scraper busca no site, localiza a página do livro solicitado e extrai
 * a URL direta de download do arquivo (EPUB ou PDF) para injetar no leitor
 * do Grimório. O site usa proteção (Cloudflare/client), então em rede
 * restrita o fetch local falha e o provedor cai no fallback de demonstração.
 */

const RESULT_PAGE = "https://www.baixelivros.com.br";

export const baixeLivrosProvider: ScrapeProvider = {
  id: "baixe-livros",
  name: "Baixe Livros",
  domain: RESULT_PAGE,
  async scrape(query: string): Promise<StreamingMedia> {
    try {
      const post = await findBestPost(query);
      if (!post) {
        throw new Error("Baixe Livros: nenhum livro encontrado.");
      }

      const html = await httpGetText(post);
      const directFile = extractFileDownload(html, post);
      if (!directFile) {
        throw new Error("Baixe Livros: página sem link de download direto.");
      }

      return {
        id: `baixe-livros:${post}`,
        title: query,
        type: "book",
        pages: [],
        file: directFile,
      };
    } catch (err) {
      console.error("[baixe-livros] fallback offline, causa:", err);
      // Fallback: EPUB público estável da biblioteca aberta (Gutenberg).
      const classics: Record<string, { title: string; file: string }> = {
        "dom casmurro": {
          title: "Dom Casmurro",
          file: "https://www.gutenberg.org/cache/epub/55752/pg55752-images.epub",
        },
        "pride and prejudice": {
          title: "Pride and Prejudice",
          file: "https://www.gutenberg.org/cache/epub/1342/pg1342-images.epub",
        },
        "moby dick": {
          title: "Moby Dick",
          file: "https://www.gutenberg.org/cache/epub/2701/pg2701-images.epub",
        },
      };
      const entry =
        classics[query.trim().toLowerCase()] ?? classics["pride and prejudice"];

      return {
        id: `baixe-livros:${query}`,
        title: entry.title,
        type: "book",
        pages: [],
        file: entry.file,
      };
    }
  },
};

async function findBestPost(query: string): Promise<string | null> {
  const searchUrl = `${RESULT_PAGE}/?s=${encodeURIComponent(query)}`;
  const html = await httpGetText(searchUrl);

  const posts = extractPostLinks(html, RESULT_PAGE);
  if (posts.length === 0) return null;

  const q = query.toLowerCase().split(" ")[0] ?? query.toLowerCase();
  return posts.find((p) => p.toLowerCase().includes(q)) ?? posts[0];
}