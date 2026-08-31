import type { Catalog } from "./types";

export async function fetchCatalog(
  uri: string,
  signal?: AbortSignal
): Promise<Catalog> {
  const direct = await fetch(uri, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (direct.ok) {
    return (await direct.json()) as Catalog;
  }

  const proxyUrl = `/api/proxy?url=${encodeURIComponent(uri)}`;
  const proxied = await fetch(proxyUrl, { signal });

  if (!proxied.ok) {
    throw new Error(`Falha ao carregar catálogo (HTTP ${proxied.status})`);
  }

  return (await proxied.json()) as Catalog;
}