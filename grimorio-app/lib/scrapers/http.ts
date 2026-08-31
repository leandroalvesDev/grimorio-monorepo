import { SCRAPER_UA } from "./html";

export const SCRAPE_TIMEOUT_MS = 12_000;
const MAX_BODY_BYTES = 3 * 1024 * 1024;

/** GET com timeout e limite de tamanho, para o backend/serverless. */
export async function httpGetText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": SCRAPER_UA,
      Accept: "text/html,application/json,application/xhtml+xml,*/*;q=0.8",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(SCRAPE_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} em ${url}`);
  }

  const text = await res.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new Error(`Resposta grande demais (${url}).`);
  }
  return text;
}

/** POST JSON (usado pela API GraphQL do HQ Now). */
export async function httpPostJson(
  url: string,
  body: unknown
): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "User-Agent": SCRAPER_UA,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    redirect: "follow",
    signal: AbortSignal.timeout(SCRAPE_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} em ${url}`);
  }

  const json = (await res.json()) as Record<string, unknown>;
  if (json && typeof json === "object" && "errors" in json) {
    throw new Error("A API interna respondeu com erros.");
  }
  return json;
}

/** GET que devolve JSON (API oficial MangaDex). */
export async function httpGetJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": SCRAPER_UA,
      Accept: "application/json",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(SCRAPE_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} em ${url}`);
  }

  return (await res.json()) as T;
}