import fs from "node:fs";
import path from "node:path";
import { deflateSync } from "node:zlib";
import JSZip from "jszip";

const outDir = path.resolve("public/samples");
fs.mkdirSync(outDir, { recursive: true });

/* ---------- PNG generator (original geometric art, no deps) ---------- */

const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function makePng(width, height, pixelFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(height * (1 + width * 4));
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a = 255] = pixelFn(x, y);
      raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a;
    }
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** quatro páginas por capítulo: 900x1200 vertical */
function buildCbzPages(seed) {
  const w = 900, h = 1200;
  const pages = [];
  const palettes = [
    [
      [74, 41, 97],
      [36, 22, 54],
      [122, 78, 155],
    ],
    [
      [20, 61, 89],
      [15, 38, 56],
      [44, 110, 148],
    ],
    [
      [97, 41, 41],
      [54, 20, 20],
      [155, 78, 68],
    ],
    [
      [41, 74, 48],
      [20, 54, 27],
      [78, 148, 85],
    ],
  ];
  for (let p = 0; p < 4; p++) {
    const [bg, dark, accent] = palettes[(seed + p) % palettes.length];
    const bandH = 180 + (seed * 37 + p * 91) % 240;
    const png = makePng(w, h, (x, y) => {
      if (y < bandH) return accent;
      if (y < bandH + 26) return dark;
      return (x + y) % 120 < 3 ? [accent[0]/2|0, accent[1]/2|0, accent[2]/2|0] : bg;
    });
    pages.push(png);
  }
  return pages;
}

/* ---------- EPUB (original short story) ---------- */

const chapters = [
  ["Capítulo I — O Livro Vazio", [
    "O tinteiro secou na primeira página. Eu o segurava como quem segura um corpo pequeno, e mesmo assim sabia que havia mais peso nas suas letras do que em qualquer promessa desenhada a tinta.",
    "Chamei-o Grimório, embora não contivesse feitiço algum. As páginas estavam em branco, e era esse vazio que me assombrava: um livro inteiro esperando ser escrito por quem não sabe o que escrever.",
  ]],
  ["Capítulo II — A Prateleira", [
    "Na estante cabiam exatamente nove volumes e um sonho. As prateleiras de madeira escura refletiam a luz da janela como quem devolve um olhar.",
    "Coloquei o Grimório entre um dicionário e uma coletânea de fábulas. Ele parecia pequeno demais ali, e ao mesmo tempo grande demais para o lugar que o mundo lhe havia reservado.",
  ]],
  ["Capítulo III — O Leitor", [
    "Não era o autor que dá vida ao livro, mas o leitor. Eu sempre soube, mas repetia como quem reza: cada página em branco é uma pergunta, e cada leitura, uma resposta que ninguém mais consegue dar por nós.",
    "Foi quando entendeu que o vazio não é ausência. O vazio é a matéria bruta de toda escolha.",
  ]],
  ["Capítulo IV — O Gesto", [
    "No fim, escrevi uma única frase na primeira página. Não era um feitiço, nem um segredo: era apenas um endereço para quem chegasse depois de mim.",
    "— Continue você — disse eu, fechando o livro. E a prateleira, por um instante, pareceu respirar.",
  ]],
];

function buildEpub() {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const manifest = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="style" href="style.css" media-type="text/css"/>`,
    chapters.map((c, i) => `<item id="ch${i + 1}" href="ch${i + 1}.xhtml" media-type="application/xhtml+xml"/>`).join("\n    "),
  ].join("\n    ");

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:grimorio-demo-0001</dc:identifier>
    <dc:title>O Grimório Vazio</dc:title>
    <dc:creator>Grimório</dc:creator>
    <dc:language>pt-BR</dc:language>
    <dc:description>História curta original de demonstração para o leitor PWA.</dc:description>
  </metadata>
  <manifest>
    ${manifest}
  </manifest>
  <spine toc="nav">
    ${chapters.map((c, i) => `<itemref idref="ch${i + 1}"/>`).join("\n    ")}
  </spine>
</package>`
  );

  const spineItems = chapters.map((c, i) => `<li><a href="ch${i + 1}.xhtml">${c[0]}</a></li>`).join("\n      ");

  zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR" lang="pt-BR">
  <head><title>Índice</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Índice</h1>
      <ol>
      ${spineItems}
      </ol>
    </nav>
  </body>
</html>`
  );

  zip.file(
    "OEBPS/style.css",
    `body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.7; }
h1 { font-size: 1.35em; margin-bottom: 1.2em; }
p { margin: 0 0 1em 0; text-align: justify; }`
  );

  chapters.forEach(([title, paras], i) => {
    zip.file(
      `OEBPS/ch${i + 1}.xhtml`,
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR" lang="pt-BR">
  <head><title>${title}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
  <body>
    <h1>${title}</h1>
    ${paras.map((p) => `<p>${p}</p>`).join("\n    ")}
  </body>
</html>`
    );
  });

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", mimeType: "application/epub+zip" });
}

(async () => {
  const epub = await buildEpub();
  fs.writeFileSync(path.join(outDir, "o-grimorio.epub"), epub);

  for (let c = 1; c <= 2; c++) {
    const zip = new JSZip();
    const pages = buildCbzPages(c);
    pages.forEach((png, i) => zip.file(`pagina-${String(i + 1).padStart(2, "0")}.png`, png, { compression: "STORE" }));
    const out = await zip.generateAsync({ type: "nodebuffer", compression: "STORE" });
    fs.writeFileSync(path.join(outDir, `cap-${c}.cbz`), out);
  }

  const sizes = fs.readdirSync(outDir).map((f) => `${f} ${(fs.statSync(path.join(outDir, f)).size / 1024).toFixed(1)}KB`);
  console.log("Arquivos gerados:");
  console.log(sizes.join("\n"));
})();