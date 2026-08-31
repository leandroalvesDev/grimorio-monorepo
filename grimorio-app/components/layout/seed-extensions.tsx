"use client";

import { useEffect } from "react";
import { fetchExtensions } from "@/lib/extension-catalog";
import { useReaderStore } from "@/store/reader-store";

/**
 * Ativa automaticamente todas as extensões do diretório na primeira visita,
 * para que o app já chegue "cheio" (o usuário pode desativar depois em
 * Extensões). Roda uma única vez por dispositivo (travado no store).
 */
export function SeedExtensions() {
  useEffect(() => {
    if (useReaderStore.getState().seededExtensions) return;
    let cancelled = false;
    void fetchExtensions()
      .then((list) => {
        if (cancelled) return;
        useReaderStore
          .getState()
          .seedExtensions(list.map((e) => e.id));
      })
      .catch(() => {
        /* sem diretório acessível, não há o que ativar */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}