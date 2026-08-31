import type { CatalogItem } from "./types";

export function readerHref(item: CatalogItem, repoId?: string): string {
  const params = new URLSearchParams();
  if (repoId) params.set("repo", repoId);
  params.set("url", item.sourceUrl);
  return `/read/${encodeURIComponent(item.id)}?${params.toString()}`;
}