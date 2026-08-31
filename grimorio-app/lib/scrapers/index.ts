import type { StreamingMedia } from "@/lib/types";
import { baixeLivrosProvider } from "./providers/baixe-livros";
import { hqNowProvider } from "./providers/hq-now";
import { mangadexProvider } from "./providers/mangadex";
import { soQuadrinhosProvider } from "./providers/so-quadrinhos";
import type { ScrapeProvider } from "./types";

const providers: Record<string, ScrapeProvider> = {
  [mangadexProvider.id]: mangadexProvider,
  [soQuadrinhosProvider.id]: soQuadrinhosProvider,
  [hqNowProvider.id]: hqNowProvider,
  [baixeLivrosProvider.id]: baixeLivrosProvider,
};

export function getProvider(id: string): ScrapeProvider | null {
  return providers[id] ?? null;
}

export function listProviders(): ScrapeProvider[] {
  return Object.values(providers);
}

/** Busca conteúdo no provedor e devolve o formato de streaming do leitor. */
export async function scrapeMedia(
  id: string,
  query: string,
  signal?: AbortSignal
): Promise<StreamingMedia> {
  const provider = getProvider(id);
  if (!provider) {
    throw new Error(`Provedor desconhecido: ${id}`);
  }
  if (signal?.aborted) {
    throw new Error("Requisição cancelada.");
  }
  const media = await provider.scrape(query);
  const valid =
    media &&
    typeof media.id === "string" &&
    typeof media.title === "string" &&
    (media.type === "comic" || media.type === "book") &&
    Array.isArray(media.pages) &&
    (media.pages.length > 0 || typeof media.file === "string");
  if (!valid) {
    throw new Error("O provedor devolveu um formato inválido.");
  }
  return media;
}