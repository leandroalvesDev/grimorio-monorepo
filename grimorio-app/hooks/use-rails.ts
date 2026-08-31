import { useMemo } from "react";
import { mockCatalog } from "@/lib/mock-catalog";
import type { FlatRail } from "@/lib/types";
import { useReaderStore } from "@/store/reader-store";

export function useRails() {
  const repositories = useReaderStore((s) => s.repositories);
  const catalogCache = useReaderStore((s) => s.catalogCache);
  const continueReading = useReaderStore((s) => s.continueReading);

  const { rails, isMock } = useMemo<{
    rails: FlatRail[];
    isMock: boolean;
  }>(() => {
    const real = repositories.flatMap((repo) => {
      const catalog = catalogCache[repo.id];
      if (!catalog) return [];
      return catalog.rails.map((rail) => ({
        key: `${repo.id}:${rail.id ?? rail.title}`,
        title: catalog.rails.length === 1 ? catalog.name : rail.title,
        subtitle: catalog.rails.length > 1 ? catalog.name : undefined,
        repoId: repo.id,
        repoName: catalog.name,
        items: rail.items,
      }));
    });

    if (real.length > 0) {
      return { rails: real, isMock: false };
    }

    return {
      rails: mockCatalog.rails.map((rail) => ({
        key: `mock:${rail.id ?? rail.title}`,
        title: rail.title,
        items: rail.items,
      })),
      isMock: true,
    };
  }, [repositories, catalogCache]);

  const recents = useMemo(
    () =>
      [...continueReading].sort(
        (a, b) => b.updatedAt - a.updatedAt
      ),
    [continueReading]
  );

  return { rails, isMock, recents };
}