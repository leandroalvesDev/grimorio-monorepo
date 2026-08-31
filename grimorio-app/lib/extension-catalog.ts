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

export async function fetchExtensions(
  signal?: AbortSignal
): Promise<Extension[]> {
  const res = await fetch(EXTENSIONS_CATALOG_URL, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(
      `Não foi possível carregar o diretório de extensões (HTTP ${res.status}).`
    );
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error("Diretório de extensões inválido: esperava uma lista.");
  }

  return data as Extension[];
}