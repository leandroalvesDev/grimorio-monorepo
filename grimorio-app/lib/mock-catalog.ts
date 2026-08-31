import type { Catalog, CatalogItem } from "./types";

const cover = (seed: string, w = 300, h = 450) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

function item(
  id: string,
  title: string,
  author: string,
  type: CatalogItem["type"],
  seed = id
): CatalogItem {
  const sourceUrl =
    type === "cbz"
      ? `/samples/cap-${(seed.length % 2) + 1}.cbz`
      : "/samples/o-grimorio.epub";
  return {
    id,
    type,
    title,
    author,
    cover: cover(seed),
    sourceUrl,
    year: 2024,
    tags: type === "cbz" ? ["quadrinhos"] : ["ficção"],
  };
}

export const mockCatalog: Catalog = {
  id: "__mock__",
  name: "Catálogo de Demonstração",
  description:
    "Dados falsos apenas para preencher a tela enquanto desenvolvemos o Grimório.",
  version: "1.0.0",
  rails: [
    {
      id: "mangas",
      title: "Mangás BR",
      items: [
        item("one-piece", "One Piece", "Eiichiro Oda", "cbz", "op"),
        item("berserk", "Berserk", "Kentaro Miura", "cbz", "berserk"),
        item("naruto", "Naruto", "Masashi Kishimoto", "cbz", "naruto"),
        item("demon-slayer", "Demon Slayer", "Koyoharu Gotouge", "cbz"),
        item("attack-on-titan", "Shingeki no Kyojin", "Hajime Isayama", "cbz"),
        item("jujutsu", "Jujutsu Kaisen", "Gege Akutami", "cbz"),
        item("chainsaw", "Chainsaw Man", "Tatsuki Fujimoto", "cbz"),
        item("vagabond", "Vagabond", "Takehiko Inoue", "cbz"),
      ],
    },
    {
      id: "romances",
      title: "Romances & Ficção",
      items: [
        item("1984", "1984", "George Orwell", "epub"),
        item("dom-casmurro", "Dom Casmurro", "Machado de Assis", "epub"),
        item("duna", "Duna", "Frank Herbert", "epub"),
        item("guerra-dos-tronos", "A Guerra dos Tronos", "George R. R. Martin", "epub"),
        item("fundacao", "Fundação", "Isaac Asimov", "epub"),
        item("sapiens", "Sapiens", "Yuval Noah Harari", "epub"),
      ],
    },
    {
      id: "quadrinhos",
      title: "Quadrinhos",
      items: [
        item("batman", "Batman: Ano Um", "Frank Miller", "cbz", "batman"),
        item("watchmen", "Watchmen", "Alan Moore", "cbz", "watchmen"),
        item("x-men", "X-Men: Há 20 Anos", "Chris Claremont", "cbz"),
        item("saga", "Saga", "Brian K. Vaughan", "cbz"),
        item("sandman", "Sandman", "Neil Gaiman", "cbz"),
      ],
    },
  ],
};