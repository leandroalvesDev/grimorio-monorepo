import { NextRequest, NextResponse } from "next/server";
import { scrapeMedia } from "@/lib/scrapers";

export const dynamic = "force-dynamic";

/**
 * Endpoint de streaming: dado um provedor (extensão) e uma query, devolve
 * o formato estrito de mídia sequencial:
 *
 *   { "id": string, "title": string, "type": "comic"|"book", "pages": [url] }
 */
export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  const query = request.nextUrl.searchParams.get("query");

  if (!provider || !query) {
    return NextResponse.json(
      { error: "Parâmetros 'provider' e 'query' são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    const media = await scrapeMedia(
      provider,
      query,
      request.signal ?? undefined
    );
    return NextResponse.json(media, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[scrape] falhou provider=", provider, "query=", query, err);
    const message =
      err instanceof Error ? err.message : "Erro ao buscar o conteúdo.";
    const status = message.startsWith("Provedor desconhecido") ? 404 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}