export type CatalogItemType = "epub" | "cbz" | "comic" | "book";

/**
 * Formato de streaming de mídia sequencial retornado por uma extensão
 * quando o app solicita um quadrinho/livro específico.
 */
export interface StreamingMedia {
  id: string;
  title: string;
  type: "comic" | "book";
  /** URLs das páginas (imagens) na ordem de leitura. */
  pages: string[];
  /**
   * Alternativa às páginas: URL direta de um arquivo binário hospedado
   * (EPUB ou CBZ) extraída pela fonte (ex.: acervos WordPress).
   */
  file?: string;
}

export interface CatalogItem {
  id: string;
  type: CatalogItemType;
  title: string;
  /**
   * URL do arquivo (EPUB/CBZ) que o leitor vai baixar OU, para itens
   * "comic", o endpoint de streaming que responde com `StreamingMedia`.
   */
  sourceUrl: string;
  /** Páginas embutidas (streaming direto, sem endpoint). */
  pages?: string[];
  cover?: string;
  author?: string;
  description?: string;
  year?: string | number;
  tags?: string[];
}

export interface CatalogRail {
  id?: string;
  title: string;
  items: CatalogItem[];
}

export interface Catalog {
  id?: string;
  name: string;
  description?: string;
  version?: string;
  rails: CatalogRail[];
}

export type RepoStatus = "loading" | "ok" | "error";

/** Add-on anunciado pelo diretório de extensões (extensions-catalog.json). */
export interface Extension {
  id: string;
  name: string;
  description?: string;
  /** URL de uma imagem OU um monograma/texto curto exibido como badge. */
  icon?: string;
  /** Catálogo (JSON de `Catalog`) que o add-on injeta no app. */
  source_url: string;
}

export interface Repository {
  id: string;
  url: string;
  name: string;
  description?: string;
  version?: string;
  status: RepoStatus;
  addedAt: number;
}

export interface ReadingProgress {
  itemId: string;
  repoId?: string;
  item: CatalogItem;
  /** Progresso de 0 a 1 (fração do arquivo lida). */
  progress: number;
  /** Posição específica: { cfi } para EPUB, { page } para CBZ. */
  position?: { cfi?: string; page?: number } | null;
  updatedAt: number;
}

export interface FlatRail {
  key: string;
  title: string;
  subtitle?: string;
  repoId?: string;
  repoName?: string;
  items: CatalogItem[];
}