import Link from "next/link";
import {
  BookOpen,
  Check,
  Search,
  Server,
  Network,
  Bug,
  Zap,
  BookMarked,
} from "lucide-react";

function Section({
  icon: Icon,
  title,
  id,
  children,
}: {
  icon: typeof BookOpen;
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-white/5 py-8">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#d34134]/15">
          <Icon className="size-4 text-[#d34134]" />
        </span>
        <h2 className="font-display text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
      </div>
      <div className="mt-3 max-w-2xl space-y-3 text-sm leading-relaxed text-zinc-400">
        {children}
      </div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black px-4 py-3 font-mono text-[11px] leading-relaxed text-zinc-200">
      {children}
    </pre>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#d34134] text-[11px] font-bold text-white">
        {n}
      </span>
      <div className="space-y-1">
        <p className="font-medium text-zinc-100">{title}</p>
        <div className="text-zinc-400">{children}</div>
      </div>
    </li>
  );
}

export default function GuidePage() {
  return (
    <div className="px-4 py-8 md:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-widest text-[#d34134]">
          Guia completo
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Como usar extensões
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          O Grimório é uma <span className="text-zinc-200">prateleira vazia</span>:
          ele não guarda conteúdo. Tudo o que você busca vem de{" "}
          <span className="text-zinc-200">extensões da comunidade</span> —
          conectores dinâmicos que consultam as fontes em tempo real (APIs do
          MangaDex e Comick, Guardiões do Globo e Baixe Livros). Este guia
          explica o que é um add-on e como usar o seu.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href="#conceito"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Conceito
          </a>
          <a
            href="#instalar"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Instalar
          </a>
          <a
            href="#buscar"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Buscar e streaming
          </a>
          <a
            href="#como-funciona"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Por dentro
          </a>
          <a
            href="#testar-locally"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Testar local
          </a>
          <a
            href="#problemas"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Solução de problemas
          </a>
          <a
            href="#criar"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Para criadores
          </a>
        </div>
      </header>

      <Section icon={Server} title="O que é um add-on?" id="conceito">
        <p>
          Um <span className="text-zinc-200">add-on</span> (extensão) é um{" "}
          <span className="text-zinc-200">conector dinâmico</span>: um provedor
          de busca registrado no diretório que, ao ser{" "}
          <span className="text-zinc-200">ativado</span>, passa a responder às
          consultas do app em tempo real. Nada de baixar arquivos em JSON a cada
          instalação — o app consulta a fonte na hora que você digita.
        </p>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
            O fluxo em uma frase
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Você → toca em <span className="text-zinc-200">Ativar</span> na
            página Extensões → digita o título na{" "}
            <span className="text-zinc-200">Busca</span> → o Grimório chama{" "}
            <span className="text-zinc-200">/api/scrape</span> de cada fonte
            ativa → clica em “Ler” e o leitor abre em streaming (páginas) ou
            baixa o arquivo direto (EPUB/CBZ).
          </p>
        </div>
        <p>
          Isso permite acervos gigantes (ex.: o MangaDex inteiro) sem precisar
          de catálogo estático — a extensão encontra o que você procura no
          momento em que você procura.
        </p>
      </Section>

      <Section icon={Check} title="Como instalar e usar, passo a passo" id="instalar">
        <ol className="space-y-3">
          <Step n={1} title="Abra a página Extensões">
            Use o menu inferior (celular) ou a barra lateral (computador). A
            página lista as extensões disponíveis no diretório.
          </Step>
          <Step n={2} title="Escolha uma extensão">
            Cada card mostra o nome, o ícone e a fonte:{" "}
            <span className="text-zinc-200">MangaDex</span> (API oficial),{" "}
            <span className="text-zinc-200">Comick</span> (API completa de HQs
            e mangás), <span className="text-zinc-200">Guardiões do Globo</span>{" "}
            (HQs brasileiras) e{" "}
            <span className="text-zinc-200">Baixe Livros</span> (download direto
            de EPUB/PDF).
          </Step>
          <Step n={3} title="Toque em “Ativar”">
            O Grimório apenas <span className="text-zinc-200">registra</span> a
            extensão no seu dispositivo (localStorage). O chip fica{" "}
            <span className="text-zinc-200">Ativa</span> — nenhum arquivo é
            baixado nesta etapa.
          </Step>
          <Step n={4} title="Busque na Início ou na Busca">
            Digite um termo (ex.: “Berserk”). Cada extensão ativa é consultada e
            mostra o que encontrou. Clique em{" "}
            <span className="text-zinc-200">Ler</span> para abrir o leitor.
          </Step>
        </ol>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
            Gerenciar
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-zinc-400">
            <li>
              <span className="text-zinc-200">Desativar</span> — desliga o
              conector; ele deixa de aparecer na Busca.
            </li>
            <li>
              <span className="text-zinc-200">Atualizar diretório</span> —
              recarrega a lista de extensões disponíveis.
            </li>
            <li>
              As extensões ativas contam como “fonte ativa” na própria Busca.
            </li>
          </ul>
        </div>
      </Section>

      <Section icon={Search} title="Buscar e o formato de streaming" id="buscar">
        <p>
          A <span className="text-zinc-200">Busca</span> é o ponto de entrada do
          conteúdo. Ela consulta cada extensão ativa chamando{" "}
          <span className="text-zinc-200">GET /api/scrape?provider=&lt;id&gt;&amp;query=&lt;termo&gt;</span>{" "}
          e lista lado a lado o que cada fonte retornou. A resposta segue o
          formato estrito de streaming:
        </p>
        <Code>{`{
  "id": "hq-now:Batman",
  "title": "Batman",
  "type": "comic",
  "pages": [
    "https://img.provider/pagina-1.jpg",
    "https://img.provider/pagina-2.jpg"
  ]
}`}</Code>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
            Campos
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-zinc-400">
            <li>
              <span className="text-zinc-200">id</span> (obrigatório) — id estável;
              usado para salvar posição de leitura e a Biblioteca.
            </li>
            <li>
              <span className="text-zinc-200">title</span> (obrigatório) — título
              exibido.
            </li>
            <li>
              <span className="text-zinc-200">type</span> —{" "}
              <span className="text-zinc-200">“comic”</span> (quadrinho em páginas)
              ou <span className="text-zinc-200">“book”</span> (livro).
            </li>
            <li>
              <span className="text-zinc-200">pages</span> — URLs das páginas na
              ordem de leitura.
            </li>
            <li>
              <span className="text-zinc-200">file</span> (opcional) — em vez de
              páginas, uma URL direta de arquivo binário (EPUB/CBZ), ex.: acervos
              WordPress. O leitor baixa e renderiza no formato correspondente.
            </li>
          </ul>
        </div>
        <p>
          A demonstração da Início (mock) usa o mesmo esquema de{" "}
          <span className="text-zinc-200">CatalogItem</span> com{" "}
          <span className="text-zinc-200">pages</span> embutidas — o leitor é o
          mesmo para tudo.
        </p>
      </Section>

      <Section icon={Network} title="Como o Grimório consulta as fontes" id="como-funciona">
        <p>
          O app usa duas rotas internas para que qualquer fonte funcione (mesmo
          com CORS bloqueado):
        </p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            <span className="text-zinc-200">Proxy anti-CORS</span>{" "}
            (<span className="text-zinc-200">/api/proxy</span>) — baixa EPUBs e
            CBZs quando o acesso direto do navegador falha (cache de 10 minutos).
          </li>
          <li>
            <span className="text-zinc-200">Scraper de streaming</span>{" "}
            (<span className="text-zinc-200">/api/scrape</span>) — cada fonte tem
            a lógica individual registrada em{" "}
            <span className="text-zinc-200">lib/scrapers/providers</span>: a busca
            bate no endpoint real do acervo, lê os elementos visuais (ou captura
            o arquivo direto) e devolve o streaming. Fontes atuais: MangaDex (API
            oficial), Comick (API JSON), Guardiões do Globo (HTML de HQs), Baixe
            Livros (download direto).
          </li>
        </ol>
        <p>
          Clique em “Ler” e o leitor exibe página a página, ou baixa o arquivo
          direto e renderiza no formato (EPUB/CBZ) — tudo por meio do proxy quando
          preciso.
        </p>
        <p className="text-xs text-zinc-500">
          Por segurança, o proxy só acessa URLs http/https, recusa endereços de
          “loopback” (localhost) e URLs com usuário/senha, e limita o cache por
          tamanho e quantidade.
        </p>
      </Section>

      <Section icon={BookMarked} title="Testar localmente (sem internet)" id="testar-locally">
        <p>
          Sua máquina tem rede restrita? O diretório de extensões já vem embutido:
        </p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            O app serve uma cópia do diretório em{" "}
            <span className="text-zinc-200">public/catalog/extensions-catalog.json</span>{" "}
            — o espelho do deploy estático do monorepo{" "}
            <span className="text-zinc-200">grimorio-catalog</span>. Na produção,
            aponte a variável{" "}
            <span className="text-zinc-200">NEXT_PUBLIC_EXTENSIONS_CATALOG_URL</span>{" "}
            para o diretório real.
          </li>
          <li>
            Cada fonte tenta a lógica real — MangaDex e Comick respondem via
            API até na rede restrita; quando um host está bloqueado (Guardiões
            do Globo sem DNS, Baixe Livros com Cloudflare), o provedor devolve
            páginas de exemplo para a leitura continuar demonstrável.
          </li>
          <li>
            As amostras em <span className="text-zinc-200">/samples/</span>{" "}
            (epub e cbz) são apenas demonstração offline do leitor binário; o
            fluxo real de extensões não depende delas.
          </li>
        </ol>
      </Section>

      <Section icon={Bug} title="Solução de problemas" id="problemas">
        <div className="space-y-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-sm font-medium text-zinc-100">
              Extensão ativa, mas a busca não retorna
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Verifique a rede: o app precisa alcançar a API da fonte (MangaDex /
              api.comick.io / blog do Guardiões / Cloudflare do Baixe Livros). Se o host estiver
              bloqueado, o provedor usa o fallback de páginas de exemplo — confira
              também o terminal do app (log <span className="text-zinc-200">[…]
              fallback offline, causa: …</span>) para ver o motivo.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-sm font-medium text-zinc-100">
              Antes o app baixava um “catálogo JSON estático”
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Isso mudou: as extensões agora são conectores dinâmicos. A instalação
              só ativa o conector no dispositivo e a Busca chama as APIs ao vivo.
              Nenhuma extensão precisa (nem deve) depender de manifestos estáticos
              de conteúdo.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-sm font-medium text-zinc-100">
              As capas não carregam
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Capas são opcionais; o Grimório nunca quebra se elas falharem. Nos
              resultados da Busca usamos monograma da fonte; dentro do leitor, as
              páginas vêm do host de origem.
            </p>
          </div>
        </div>
      </Section>

      <Section icon={Zap} title="Para quem cria conectores (boas práticas)" id="criar">
        <ul className="list-disc space-y-1 pl-4">
          <li>
            Registre em <span className="text-zinc-200">lib/scrapers/providers</span>{" "}
            um objeto implementando a interface <span className="text-zinc-200">ScrapeProvider</span>{" "}
            ({`{ id, name, domain, scrape(query) }`}) e exporte-o no índice — o{" "}
            <span className="text-zinc-200">/api/scrape</span> roteia por{" "}
            <span className="text-zinc-200">provider</span>.
          </li>
          <li>
            Retorne <span className="text-zinc-200">id</span> estável — se mudar,
            o histórico de leitura e a Biblioteca perdem referência.
          </li>
          <li>
            Informe sempre <span className="text-zinc-200">pages</span> ou{" "}
            <span className="text-zinc-200">file</span> — nunca os dois vazios.
          </li>
          <li>
            Em <span className="text-zinc-200">type</span>, use{" "}
            <span className="text-zinc-200">“comic”</span> (páginas) ou{" "}
            <span className="text-zinc-200">“book”</span> (arquivo) — nunca deixe o
            leitor adivinhar.
          </li>
          <li>
            Ao detectar conexão bloqueada na sua rede, devolva um fallback
            demonstrável em vez de erro cru — mas logue a causa no console.
          </li>
        </ul>
        <p>
          O Grimório não valida a procedência do conteúdo: você só deve ativar
          extensões de fontes em que confia, como em qualquer agregador.
        </p>
      </Section>

      <footer className="border-t border-white/5 py-8">
        <Link
          href="/addons"
          className="inline-flex items-center gap-2 rounded-lg bg-[#d34134] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <BookOpen className="size-4" />
          Ir para Extensões e ativar
        </Link>
      </footer>
    </div>
  );
}