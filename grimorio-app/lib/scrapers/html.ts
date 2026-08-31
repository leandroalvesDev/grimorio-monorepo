/**
 * Utilitários de extração sobre HTML bruto + fallback offline.
 *
 * Cada fonte tenta primeiro a lógica REAL (API oficial do MangaDex,
 * GraphQL do HQ Now, wp-content do Só Quadrinhos, download direto do
 * Baixe Livros). Quando o host está inacessível (rede restrita, DNS,
 * Cloudflare 403), `simulateFetchHtml` devolve um HTML de exemplo para a
 * leitura de streaming continuar demonstrável.
 */

export const SCRAPER_UA = "Grimorio/1.0 (web scraper)";

const COMIC_PAGE_COUNT = 8;

/** Fallback offline: HTML de exemplo no lugar da página real do provedor. */
export async function simulateFetchHtml(url: string): Promise<string> {
  const slug = querySlugFromUrl(url);
  const pages = Array.from(
    { length: COMIC_PAGE_COUNT },
    (_, i) => `https://picsum.photos/seed/${slug}-${i + 1}/800/1200`
  );

  const imgs = pages
    .map(
      (src, i) => `    <article>
      <a href="/leitura/${slug}/${i + 1}">
        <img src="${src}" alt="Página ${i + 1}" loading="lazy" referrerpolicy="no-referrer" />
      </a>
    </article>`
    )
    .join("\n");

  return `<!doctype html>
<html><head><title>Acervo: ${slug}</title></head>
<body>
  <main class="grid">
${imgs}
  </main>
</body></html>`;
}

function querySlugFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() ?? "obra";
    return (
      decodeURIComponent(last)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "obra"
    );
  } catch {
    return "obra";
  }
}

/**
 * Lê os elementos visuais (<img>) de uma página HTML e converte cada URL
 * em uma página do formato de streaming do leitor do Grimório.
 */
export function extractPagesFromHtml(
  html: string,
  baseUrl: string
): string[] {
  const base = new URL(baseUrl);
  const pages: string[] = [];

  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const page = new URL(m[1], base).href;
    if (!pages.includes(page)) pages.push(page);
  }

  return pages;
}

/** Links de artigos/posts dentro de um HTML (resultado de busca WordPress). */
export function extractPostLinks(
  html: string,
  baseUrl: string
): string[] {
  const base = new URL(baseUrl);
  const posts: string[] = [];

  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>[^<]*/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (/^\/|^\.|^#/.test(href) || /\.(png|jpe?g|gif|svg)$/i.test(href)) {
      continue;
    }
    const post = new URL(href, base).href;
    if (!posts.includes(post)) posts.push(post);
  }

  return posts.slice(0, 12);
}

const DOWNLOAD_EXT_RE = /\.(cbz|zip|epub|pdf)(\?.*)?$/i;

/** Procura no HTML um link direto de arquivo (.cbz/.pdf/.epub) e devolve-o. */
export function extractFileDownload(html: string, baseUrl: string): string | null {
  const hrefs: string[] = [];
  const aRe = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = aRe.exec(html)) !== null) {
    if (DOWNLOAD_EXT_RE.test(m[1])) hrefs.push(m[1]);
  }

  for (const href of hrefs) {
    const clean = href.split("#")[0];
    try {
      return new URL(clean, baseUrl).href;
    } catch {
      /* ignora href malformado */
    }
  }
  return null;
}

/** Detecta um leitor sequencial no HTML (galeria de imagens do WordPress). */
export function hasSequentialReader(html: string): boolean {
  return (
    /wp-block-gallery|wp-block-image|class=["'][^"']*(?:slides|swiper|carousel)/i.test(
      html
    )
  );
}