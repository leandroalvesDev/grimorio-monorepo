import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { fetchCatalog } from "@/lib/catalog-fetch";
import { repoIdFromUrl } from "@/lib/repo-id";
import type {
  Catalog,
  ReadingProgress,
  Repository,
} from "@/lib/types";

interface ReaderStore {
  repositories: Repository[];
  /** Cache de catálogos por repositório (não persiste — refetch por sessão). */
  catalogCache: Record<string, Catalog>;
  continueReading: ReadingProgress[];
  library: string[];

  addRepository: (url: string) => Promise<void>;
  refreshRepository: (repoId: string) => Promise<void>;
  removeRepository: (repoId: string) => void;
  isInLibrary: (itemId: string) => boolean;
  toggleLibrary: (itemId: string) => void;
  setReadingProgress: (
    progress: Omit<ReadingProgress, "updatedAt">
  ) => void;
  removeReadingProgress: (itemId: string) => void;
}

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set, get) => {
      const loadInto = async (id: string, url: string) => {
        set((s) => ({
          repositories: s.repositories.map((r) =>
            r.id === id ? { ...r, status: "loading" as const } : r
          ),
        }));

        try {
          const catalog = await fetchCatalog(url);

          if (!catalog || !Array.isArray(catalog.rails)) {
            throw new Error(
              "Catálogo inválido: campo 'rails' ausente ou malformado."
            );
          }

          set((s) => ({
            repositories: s.repositories.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: "ok" as const,
                    name: catalog.name || r.name,
                    description: catalog.description,
                    version: catalog.version,
                  }
                : r
            ),
            catalogCache: { ...s.catalogCache, [id]: catalog },
          }));
        } catch {
          set((s) => ({
            repositories: s.repositories.map((r) =>
              r.id === id ? { ...r, status: "error" as const } : r
            ),
          }));
          throw new Error("Não foi possível carregar este catálogo.");
        }
      };

      return {
        repositories: [],
        catalogCache: {},
        continueReading: [],
        library: [],

        addRepository: async (url) => {
          const trimmed = url.trim();
          if (!trimmed) return;

          const id = repoIdFromUrl(trimmed);

          if (get().repositories.some((r) => r.id === id)) {
            throw new Error("Este repositório já está instalado.");
          }

          set((s) => ({
            repositories: [
              ...s.repositories,
              {
                id,
                url: trimmed,
                name: trimmed,
                status: "loading" as const,
                addedAt: Date.now(),
              },
            ],
          }));

          await loadInto(id, trimmed);
        },

        refreshRepository: async (repoId) => {
          const repo = get().repositories.find((r) => r.id === repoId);
          if (!repo) return;
          await loadInto(repoId, repo.url);
        },

        removeRepository: (repoId) =>
          set((s) => ({
            repositories: s.repositories.filter((r) => r.id !== repoId),
            catalogCache: omitKey(s.catalogCache, repoId),
            continueReading: s.continueReading.filter(
              (p) => p.repoId !== repoId
            ),
          })),

        isInLibrary: (itemId) => get().library.includes(itemId),

        toggleLibrary: (itemId) =>
          set((s) => ({
            library: s.library.includes(itemId)
              ? s.library.filter((i) => i !== itemId)
              : [...s.library, itemId],
          })),

        setReadingProgress: (progress) =>
          set((s) => {
            const others = s.continueReading.filter(
              (p) => p.itemId !== progress.itemId
            );
            const next: ReadingProgress = {
              ...progress,
              updatedAt: Date.now(),
            };
            return { continueReading: [...others, next] };
          }),

        removeReadingProgress: (itemId) =>
          set((s) => ({
            continueReading: s.continueReading.filter(
              (p) => p.itemId !== itemId
            ),
          })),
      };
    },
    {
      name: "grimorio:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        repositories: s.repositories,
        continueReading: s.continueReading,
        library: s.library,
      }),
    }
  )
);

function omitKey<T>(obj: Record<string, T>, key: string): Record<string, T> {
  const rest: Record<string, T> = {};
  for (const k of Object.keys(obj)) {
    if (k !== key) rest[k] = obj[k];
  }
  return rest;
}