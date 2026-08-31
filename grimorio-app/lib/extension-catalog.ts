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
 * Base para resolver caminhos relativos do diretório (source_url, ícones).
 * Se o diretório for local, resolve contra a origem do app.
 */
export function extensionBaseUrl(): URL {
  try {
    return new URL(EXTENSIONS_CATALOG_URL, globalThis.location?.origin ?? "");
  } catch {
    return new URL(EXTENSIONS_CATALOG_URL, "http://localhost:3000");
  }
}

/** Converte um href (relativo ou absoluto) para a URL absoluta do diretório. */
export function resolveExtensionHref(href: string): string {
  return new URL(href, extensionBaseUrl()).href;
}

/**
 * Carrega o diretório e devolve as extensões com `source_url` já resolvido
 * para URL absoluta (permite que o catálogo use caminhos relativos dinâmicos).
 */
export async function fetchExtensions(): Promise<Extension[]> {
  const data = await fetchJson<unknown[]>(EXTENSIONS_CATALOG_URL);
  if (!Array.isArray(data)) {
    throw new Error("Diretório de extensões inválido: esperava uma lista.");
  }

  return (data as Extension[]).map((ext) => {
    if (!ext?.id || typeof ext.source_url !== "string") return ext;
    return { ...ext, source_url: resolveExtensionHref(ext.source_url) };
  });
}