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