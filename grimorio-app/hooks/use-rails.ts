import { useMemo } from "react";
import { mockCatalog } from "@/lib/mock-catalog";
import type { FlatRail } from "@/lib/types";
import { useReaderStore } from "@/store/reader-store";

export function useRails() {
  const continueReading = useReaderStore((s) => s.continueReading);

  const rails = useMemo<FlatRail[]>(
    () =>
      mockCatalog.rails.map((rail) => ({
        key: `mock:${rail.id ?? rail.title}`,
        title: rail.title,
        items: rail.items,
      })),
    []
  );

  const recents = useMemo(
    () =>
      [...continueReading].sort((a, b) => b.updatedAt - a.updatedAt),
    [continueReading]
  );

  return { rails, isMock: true, recents };
}