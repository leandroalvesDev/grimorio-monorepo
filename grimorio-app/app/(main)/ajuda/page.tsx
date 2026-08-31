import Link from "next/link";
import {
  Link2,
  Server,
  FileJson,
  Globe,
  Network,
  Bug,
  Sparkles,
  Check,
  BookMarked,
} from "lucide-react";

function Section({
  icon: Icon,
  title,
  id,
  children,
}: {
  icon: typeof Link2;
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
          ele não guarda conteúdo. Tudo o que aparece na tela vem de{" "}
          <span className="text-zinc-200">repositórios da comunidade</span> —
          catálogos em JSON publicados por qualquer pessoa na internet. Este guia
          explica o que é um add-on e como instalar os seus.
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
            href="#formato"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Formato do catálogo
          </a>
          <a
            href="#hospedar"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Onde hospedar
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
          Um <span className="text-zinc-200">add-on</span> (também chamado de{" "}
          <span className="text-zinc-200">repositório</span>) é simplesmente uma{" "}
          <span className="text-zinc-200">URL pública</span> que responde com um
          arquivo JSON descrevendo um catálogo. Quando você adiciona essa URL ao
          Grimório, os trilhos dela aparecem na Início — e é só clicar para ler.
        </p>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
            O fluxo em uma frase
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Você → toca em <span className="text-zinc-200">Instalar</span> na
            página Extensões → o Grimório baixa o catálogo da extensão → monta os
            trilhos → você clica num item → o livro/revista abre no leitor (EPUB
            ou CBZ).
          </p>
        </div>
        <p>
          Nada de cadastro, servidor ou banco de dados. Qualquer pessoa pode
          publicar um catálogo e a comunidade mantém os próprios acervos.
        </p>
      </Section>

      <Section icon={Check} title="Como instalar, passo a passo" id="instalar">
        <ol className="space-y-3">
          <Step n={1} title="Abra a página Extensões">
            Use o menu inferior (celular) ou a barra lateral (computador). A
            página lista automaticamente as extensões disponíveis no diretório.
          </Step>
          <Step n={2} title="Escolha uma extensão">
            Cada card mostra o nome, o ícone e um catálogo da comunidade (HQ Now,
            Livros Livres, Manga Teste — ou o que o diretório anunciar).
          </Step>
          <Step n={3} title="Toque em “Instalar”">
            O Grimório baixa o catálogo na hora e o guarda nos seus repositórios.
            O botão vira <span className="text-zinc-200">Instalado</span> — nada
            de colar links manualmente.
          </Step>
          <Step n={4} title="Confira o status">
            O repositório aparece na lista com um selo:
            <ul className="mt-2 space-y-1 pl-1 text-sm">
              <li>
                <span className="text-[#d34134]">●</span>{" "}
                <span className="text-zinc-300">Conectado</span> — o catálogo foi
                baixado; o selo mostra a versão informada (ex.: v1.2).
              </li>
              <li>
                <span className="text-amber-400">●</span>{" "}
                <span className="text-zinc-300">Sincronizando</span> — o download
                está em andamento.
              </li>
              <li>
                <span className="text-red-400">●</span>{" "}
                <span className="text-zinc-300">Falhou</span> — não foi possível
                baixar (veja “Solução de problemas”).
              </li>
            </ul>
          </Step>
          <Step n={5} title="Volte ao Início">
            Os trilhos do add-on substituem o catálogo de demonstração. Role,
            escolha um item e toque no card para abrir o leitor.
          </Step>
        </ol>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
            Gerenciar
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-zinc-400">
            <li>
              <span className="text-zinc-200">Atualizar (ícone ↻)</span> — baixa o
              catálogo novamente agora (indispensável quando o autor atualiza o
              conteúdo).
            </li>
            <li>
              <span className="text-zinc-200">Remover (ícone 🗑)</span> — desinstala
              o add-on. Os trilhos desaparecem na Início.
            </li>
            <li>
              <span className="text-zinc-200">Abrir URL (ícone ↗)</span> — visita o
              catálogo no navegador, útil para conferir se está no ar.
            </li>
          </ul>
        </div>
      </Section>

      <Section icon={FileJson} title="Formato do catálogo (esquema)" id="formato">
        <p>
          Um catálogo segue um esquema simples e aberto (BYOC — “traga seu
          próprio catálogo”). Ele tem <span className="text-zinc-200">rails</span>{" "}
          (seções/temas) e cada rail tem <span className="text-zinc-200">itens</span>{" "}
          (obra + download):
        </p>
        <Code>{`{
  "name": "Acervo do Bardo",
  "description": "Catálogo de teste da comunidade.",
  "version": "1.2.0",
  "rails": [
    {
      "id": "mangas",
      "title": "Mangás",
      "items": [
        {
          "id": "op-cap-1",
          "type": "cbz",
          "title": "One Piece — Capítulo 1",
          "author": "Eiichiro Oda",
          "year": "1997",
          "description": "O começo da jornada do Chapéu de Palha.",
          "cover": "https://exemplo.com/covers/op1.jpg",
          "tags": ["mangá", "aventura"],
          "sourceUrl": "https://exemplo.com/downloads/op-cap-1.cbz"
        },
        {
          "id": "o-grimorio-01",
          "type": "epub",
          "title": "O Grimório das Sombras",
          "author": "Uma Autora",
          "year": "2026",
          "description": "Romance de fantasia em três atos.",
          "cover": "https://exemplo.com/covers/grimorio.jpg",
          "tags": ["fantasia"],
          "sourceUrl": "https://exemplo.com/downloads/o-grimorio.epub"
        }
      ]
    },
    {
      "id": "romances",
      "title": "Romances & Ficção",
      "items": [
        {
          "id": "1984-fr",
          "type": "epub",
          "title": "1984",
          "author": "George Orwell",
          "year": "1949",
          "sourceUrl": "https://exemplo.com/downloads/1984.epub"
        }
      ]
    }
  ]
}`}</Code>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
            Campos
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-zinc-400">
            <li>
              <span className="text-zinc-200">name</span> (obrigatório) — nome que
              aparece na lista de Extensões.
            </li>
            <li>
              <span className="text-zinc-200">version</span> (recomendado) — versão
              do catálogo; aparece no selo e ajuda você e o autor a saber se está
              atualizado.
            </li>
            <li>
              <span className="text-zinc-200">rails[].title</span> — título da
              seção exibida na Início.
            </li>
            <li>
              <span className="text-zinc-200">items[].id</span> (obrigatório) — id
              único e estável da obra; usado para salvar posição de leitura e a
              Biblioteca.
            </li>
            <li>
              <span className="text-zinc-200">items[].type</span> (obrigatório) —{" "}
              <span className="text-zinc-200">“epub”</span> ou{" "}
              <span className="text-zinc-200">“cbz”</span> (quadrinhos). Se
              faltar, o Grimório tenta adivinhar pela extensão da URL.
            </li>
            <li>
              <span className="text-zinc-200">items[].title</span> (obrigatório) —
              título exibido no card.
            </li>
            <li>
              <span className="text-zinc-200">items[].sourceUrl</span> (obrigatório)
              — link direto para o arquivo <span className="text-zinc-200">.epub</span>{" "}
              ou <span className="text-zinc-200">.cbz</span>. É o que o leitor
              baixa para abrir a obra.
            </li>
            <li>
              <span className="text-zinc-200">cover</span> (opcional) — imagem da
              capa. Se faltar, o card mostra um placeholder.
            </li>
            <li>
              <span className="text-zinc-200">author / year / description / tags</span>{" "}
              (opcionais) — enriquecem o card.
            </li>
          </ul>
        </div>
      </Section>

      <Section icon={Globe} title="Onde hospedar um catálogo" id="hospedar">
        <p>
          Como o catálogo é um arquivo JSON estático, praticamente qualquer lugar
          serve:
        </p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <span className="text-zinc-200">GitHub Pages / GitLab Pages</span> —
            ideal para a comunidade: repo público + `https://usuario.github.io/
            catalogo.json`.
          </li>
          <li>
            <span className="text-zinc-200">GitHub Gist</span> — perfeito para
            testes rápidos; use o “raw” do gist.
          </li>
          <li>
            <span className="text-zinc-200">CDNs estáticos</span> — um arquivo
            dentro de um pacote npm publicado em {`unpkg.com/jsdelivr`} ganha HTTPS
            de graça.
          </li>
          <li>
            <span className="text-zinc-200">Qualquer host estático</span> —
            Netlify, Vercel, buckets de nuvem, sua própria VPS. Basta {`HTTPS`}.
          </li>
        </ul>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
            Requisitos
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-zinc-400">
            <li>
              Servido via <span className="text-zinc-200">HTTPS</span> (o
              navegador bloqueia conteúdo misto).
            </li>
            <li>
              JSON válido e alcançável no seu dispositivo — se a máquina tiver rede
              restrita, o add-on só funciona se o host for acessível por ela.
            </li>
            <li>
              Não precisa aceitar CORS: se o host bloquear o acesso direto do
              navegador, o Grimório baixa por meio do próprio proxy (veja abaixo).
            </li>
          </ul>
        </div>
      </Section>

      <Section icon={Network} title="Como o Grimório baixa tudo" id="como-funciona">
        <p>
          Para que qualquer host funcione (mesmo os que bloqueiam CORS), o app usa
          duas rotas:
        </p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            <span className="text-zinc-200">Tentativa direta</span> — o navegador
            busca o JSON/fonte direto na URL.
          </li>
          <li>
            <span className="text-zinc-200">Proxy anti-CORS</span> — se a tentativa
            direta falhar, a URL é enviada ao endpoint interno{" "}
            <span className="text-zinc-200">/api/proxy</span> do Grimório, que faz
            a requisição no lugar do navegador e devolve o conteúdo.
          </li>
        </ol>
        <p>
          O proxy mantém um <span className="text-zinc-200">cache de 10 minutos</span>{" "}
          (com revalidação em segundo plano), então catálogos e arquivos
          re-visitados carregam rápido. Para forçar uma cópia nova, use o botão
          de atualizar no add-on.
        </p>
        <p className="text-xs text-zinc-500">
          Por segurança, o proxy só acessa URLs http/https, recusa endereços de
          “loopback” (localhost) e URLs com usuário/senha, e limita o cache por
          tamanho e quantidade.
        </p>
      </Section>

      <Section icon={BookMarked} title="Testar localmente (sem internet)" id="testar-locally">
        <p>
          Sua máquina tem rede restrita? Tudo já vem preparado para rodar offline:
        </p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            O app embute uma cópia do diretório em{" "}
            <span className="text-zinc-200">public/catalog/extensions-catalog.json</span>{" "}
            e catálogos de exemplo em{" "}
            <span className="text-zinc-200">public/samples/catalogs/*.json</span>.
          </li>
          <li>
            Basta rodar o Grimório e ir em{" "}
            <span className="text-zinc-200">Extensões</span> → tocar em{" "}
            <span className="text-zinc-200">Instalar</span>. Os botões já vêm
            apontando para esses arquivos locais do mesmo domínio.
          </li>
          <li>
            Na produção, aponte o app para o diretório real definindo a variável{" "}
            <span className="text-zinc-200">NEXT_PUBLIC_EXTENSIONS_CATALOG_URL</span>{" "}
            (ex.: o deploy estático do catálogo em Vercel).
          </li>
        </ol>
        <p>
          Os <span className="text-zinc-200">sourceUrl</span> das amostras usam as
          obras em <span className="text-zinc-200">/samples/</span> (epub e cbz),
          então o download nem passa pelo proxy (que bloqueia loopback para URLs
          externas). É o jeito mais rápido de entender o esquema na prática.
        </p>
      </Section>

      <Section icon={Bug} title="Solução de problemas" id="problemas">
        <div className="space-y-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-sm font-medium text-zinc-100">
              Status “Falhou” ao adicionar
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Confira se a URL está completa e com HTTPS; se o servidor está de pé;
              se o JSON é válido (use um validator); e se o host é acessível pela
              sua rede. Às vezes um host funciona só via proxy — verifique que a
              URL não é loopback local nem contém usuário/senha.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-sm font-medium text-zinc-100">
              Catálogo certo, mas itens não abrem
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Veja o campo <span className="text-zinc-200">type</span> (use apenas{" "}
              <span className="text-zinc-200">“epub”</span> ou{" "}
              <span className="text-zinc-200">“cbz”</span>) e confirme que o{" "}
              <span className="text-zinc-200">sourceUrl</span> de fato baixa o
              arquivo (teste no navegador). Arquivos acima do limite de cache
              continuam funcionando — só não são cacheados.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-sm font-medium text-zinc-100">
              As capas não carregam
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Capas são opcionais; o Grimório nunca quebra se elas falharem. Se
              muitas capas não aparecem, o host delas pode estar bloqueado — troque
              por URLs HTTPS públicas do mesmo host do catálogo.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-sm font-medium text-zinc-100">
              Atualização de conteúdo não aparece
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              O proxy cacha por até 10 minutos. Espere, use o botão ↻ do add-on ou
              force o autor a publicar no mesmo host/caminho. Por fim, um hard
              refresh (Ctrl+F5) resolve favicons e telas antigas.
            </p>
          </div>
        </div>
      </Section>

      <Section icon={Sparkles} title="Para quem cria catálogos (boas práticas)" id="criar">
        <ul className="list-disc space-y-1 pl-4">
          <li>
            Use <span className="text-zinc-200">ids estáveis</span> — se mudarem,
            o histórico de leitura e a Biblioteca perdem referência.
          </li>
          <li>
            Coloque <span className="text-zinc-200">type</span> explícito (epub /
            cbz) — nunca confie na extensão da URL.
          </li>
          <li>
            Mantenha <span className="text-zinc-200">version</span> semântica e
            aumente a cada mudança; os usuários sabem quando atualizar.
          </li>
          <li>
            Hospede catálogo e conteúdos{' '}
            <span className="text-zinc-200">no mesmo host</span> sempre que
            possível.
          </li>
          <li>
            Publique o esquema no README do repositório para incentivar o uso da
            comunidade.
          </li>
        </ul>
        <p>
          O Grimório não valida a procedência dos arquivos: você só deve adicionar
          catálogos de fontes em que confia, como em qualquer agregador de
          conteúdo.
        </p>
      </Section>

      <footer className="border-t border-white/5 py-8">
        <Link
          href="/addons"
          className="inline-flex items-center gap-2 rounded-lg bg-[#d34134] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Link2 className="size-4" />
          Ir para Extensões e instalar
        </Link>
      </footer>
    </div>
  );
}