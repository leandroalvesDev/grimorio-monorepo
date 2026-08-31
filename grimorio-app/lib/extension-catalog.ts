import { fetchJson } from "./read-file";
import type { Extension } from "./types";

/**
 * URL do diretório de extensões.
 * Por padrão usa uma cópia local (servida pelo próprio app) para rodar offline;
 * na produção, defina NEXT_PUBLIC_EXTENSIONS_CATALOG_URL apontando para o
 * deploy estático (ex.: https://seu-catalogo.vercel.app/extensions-catalog.json).
 */
export const EXTENSIONS_CATALOG_URL =
  process.env.NEXT_PUBLIC_EXTENSIONS_CATALOG_URL ??
  "/catalog/extensions-catalog.json";

/**
 * Carrega o diretório de extensões. Cada entrada é apenas metadado
 * (id/name/description/icon/provider) sobre um conector dinâmico — não há
 * catálogo estático a baixar: os resultados vêm de `/api/scrape` na busca.
 */
export async function fetchExtensions(): Promise<Extension[]> {
  const data = await fetchJson<unknown[]>(EXTENSIONS_CATALOG_URL);
  if (!Array.isArray(data)) {
    throw new Error("Diretório de extensões inválido: esperava uma lista.");
  }
  return data as Extension[];
}