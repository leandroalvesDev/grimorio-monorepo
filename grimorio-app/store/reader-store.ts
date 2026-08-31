import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ReadingProgress } from "@/lib/types";

interface ReaderStore {
  /** IDs das extensões (conectores) ativadas pelo usuário. */
  enabledExtensions: string[];
  continueReading: ReadingProgress[];
  library: string[];

  setExtensionEnabled: (id: string, enabled: boolean) => void;
  toggleExtension: (id: string) => void;
  isExtensionEnabled: (id: string) => boolean;

  isInLibrary: (itemId: string) => boolean;
  toggleLibrary: (itemId: string) => void;
  setReadingProgress: (
    progress: Omit<ReadingProgress, "updatedAt">
  ) => void;
  removeReadingProgress: (itemId: string) => void;
}

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set, get) => ({
      enabledExtensions: [],
      continueReading: [],
      library: [],

      setExtensionEnabled: (id, enabled) =>
        set((s) => ({
          enabledExtensions: enabled
            ? s.enabledExtensions.includes(id)
              ? s.enabledExtensions
              : [...s.enabledExtensions, id]
            : s.enabledExtensions.filter((e) => e !== id),
        })),

      toggleExtension: (id) =>
        set((s) => ({
          enabledExtensions: s.enabledExtensions.includes(id)
            ? s.enabledExtensions.filter((e) => e !== id)
            : [...s.enabledExtensions, id],
        })),

      isExtensionEnabled: (id) => get().enabledExtensions.includes(id),

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
    }),
    {
      name: "grimorio:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        enabledExtensions: s.enabledExtensions,
        continueReading: s.continueReading,
        library: s.library,
      }),
    }
  )
);