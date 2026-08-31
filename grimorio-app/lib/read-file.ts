/** Baixa um arquivo (EPUB/CBZ) tentando fetch direto e caindo no proxy anti-CORS. */
export async function fetchFile(url: string): Promise<ArrayBuffer> {
  try {
    const direct = await fetch(url, { cache: "force-cache" });
    if (direct.ok) {
      return await direct.arrayBuffer();
    }
  } catch {
    /* cai para o proxy */
  }

  const proxied = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
  if (!proxied.ok) {
    throw new Error(`Falha ao baixar o arquivo (HTTP ${proxied.status}).`);
  }
  return await proxied.arrayBuffer();
}

/** Baixa um JSON tentando fetch direto e caindo no proxy anti-CORS (só p/ URLs absolutas). */
export async function fetchJson<T>(url: string): Promise<T> {
  const isRelative = url.startsWith("/");
  try {
    const direct = await fetch(url, { cache: "force-cache" });
    if (direct.ok) {
      return (await direct.json()) as T;
    }
    if (isRelative) {
      // URLs relativas são do próprio app (ex.: /api/scrape): expõem o erro real.
      let detail = "";
      try {
        detail = (await direct.text()).slice(0, 300);
      } catch {
        /* sem corpo para exibir */
      }
      throw new Error(
        detail.trim() || `Falha ao carregar o JSON (HTTP ${direct.status}).`
      );
    }
  } catch (err) {
    if (isRelative) {
      throw err instanceof Error
        ? err
        : new Error("Falha ao carregar o JSON.");
    }
  }

  const proxied = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
  if (!proxied.ok) {
    throw new Error(`Falha ao carregar o JSON (HTTP ${proxied.status}).`);
  }
  return (await proxied.json()) as T;
}