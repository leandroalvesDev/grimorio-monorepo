import type { StreamingMedia } from "@/lib/types";

/** Um provedor de conteúdo raspado (web scraping) do universo de extensões. */
export interface ScrapeProvider {
  id: string;
  name: string;
  /**
   * Domínio real que o scraper futuro vai consultar.
   * Hoje a requisição é SIMULADA (fixture HTML), mas o contrato já é o real.
   */
  domain: string;
  /**
   * Recebe a query (ex.: "Batman"), busca o conteúdo no domínio do provedor
   * e devolve o formato de streaming que o leitor do Grimório consome.
   */
  scrape: (query: string) => Promise<StreamingMedia>;
}