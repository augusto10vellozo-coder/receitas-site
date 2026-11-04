// Gerador do site Sabor de Casa.
// Uso: node scripts/build.mjs
// Lê os lotes de receitas em /dados, gera /receitas/<slug>.html, /categorias/<slug>.html,
// a home, o sitemap e o robots.txt.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://receitassabordecasa.com.br";
const SITE_NOME = "Sabor de Casa";
const HOJE = new Date().toISOString().slice(0, 10);

const CATEGORIAS = {
  "Café da manhã": {
    slug: "cafe-da-manha",
    titulo: "Receitas de café da manhã",
    descricao:
      "Receitas de café da manhã simples e rápidas: pães, bolos, panquecas, ovos e vitaminas para começar o dia bem.",
    intro:
      "O café da manhã é a refeição que mais precisa ser prática. Aqui estão receitas que cabem na rotina: massas que rendem vários dias, ovos que ficam prontos em minutos e bebidas para acompanhar. Todas com ingredientes de mercado de bairro e passo a passo detalhado.",
  },
  Almoço: {
    slug: "almoco",
    titulo: "Receitas de almoço",
    descricao:
      "Receitas de almoço para o dia a dia: pratos com arroz, feijão, carnes, saladas e opções para reaproveitar sobras.",
    intro:
      "Almoço de dia de semana pede prato que rende, não gasta muito ingrediente e esquenta bem no dia seguinte. As receitas desta categoria foram pensadas para isso: combinações de proteína, carboidrato e salada que ficam prontas em menos de uma hora.",
  },
  Jantar: {
    slug: "jantar",
    titulo: "Receitas de jantar",
    descricao:
      "Receitas de jantar leves e práticas: sopas, massas, risotos, tortas e peixes para terminar o dia bem.",
    intro:
      "Jantar costuma ser a refeição com menos tempo disponível. Por isso, as receitas aqui priorizam poucas panelas, tempo curto de fogão e ingredientes que você provavelmente já tem. Dá para fazer depois do trabalho sem pedir delivery.",
  },
  Lanches: {
    slug: "lanches",
    titulo: "Receitas de lanches",
    descricao:
      "Lanches caseiros para a tarde ou para receber visita: pizzas, salgados e petiscos fáceis de fazer.",
    intro:
      "Lanche caseiro resolve a fome da tarde e sai mais barato que delivery. Esta seção reúne receitas que não exigem técnica de confeitaria nem forno profissional — só uma frigideira, uma forma e paciência de dez minutos.",
  },
  Sobremesas: {
    slug: "sobremesas",
    titulo: "Receitas de sobremesas",
    descricao:
      "Sobremesas fáceis e testadas: bolos, mousses, doces de colher e clássicos brasileiros para qualquer dia.",
    intro:
      "Sobremesa boa não precisa de seis etapas. As receitas desta categoria usam liquidificador, uma panela e ingredientes que já existem na despensa da maioria das casas brasileiras. Todas indicam o ponto certo e o que fazer se der errado.",
  },
  Bebidas: {
    slug: "bebidas",
    titulo: "Receitas de bebidas",
    descricao:
      "Vitaminas, sucos e bebidas caseiras simples para o café da manhã e para os dias quentes.",
    intro:
      "Bebidas caseiras são a forma mais rápida de usar fruta madura e complementar o café da manhã. As receitas aqui trazem proporção exata de leite, fruta e adoçante para não virar água nem virar papa.",
  },
};

const escapeHtml = (s = "") =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const iso = (minutos) => {
  const m = Number(minutos) || 0;
  return `PT${Math.floor(m / 60) ? `${Math.floor(m / 60)}H` : ""}${m % 60 ? `${m % 60}M` : ""}` || "PT0M";
};

// ---------- carregar dados ----------
const dadosDir = path.join(ROOT, "dados");
const arquivos = fs.readdirSync(dadosDir).filter((f) => f.endsWith(".json") && f.startsWith("receitas"));
const receitas = arquivos
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(dadosDir, f), "utf8")))
  .map((r, i) => ({ ...r, ordem: r.ordem ?? i }))
  .sort((a, b) => a.ordem - b.ordem);

const paginas = JSON.parse(fs.readFileSync(path.join(dadosDir, "paginas.json"), "utf8"));

const slugCategoria = (nome) => CATEGORIAS[nome]?.slug ?? "receitas";
const porCategoria = (nome) => receitas.filter((r) => r.categoria === nome);

// ---------- layout ----------
const navItens = [
  { href: "/", texto: "Receitas", ativo: "home" },
  ...Object.entries(CATEGORIAS).map(([nome, c]) => ({ href: `/categorias/${c.slug}.html`, texto: nome, ativo: c.slug })),
  { href: "/sobre.html", texto: "Sobre", ativo: "sobre" },
  { href: "/contato.html", texto: "Contato", ativo: "contato" },
];

function head({ titulo, descricao, canonical, imagem, tipo = "website", schema = [], ativo = "" }) {
  const ogImg = imagem ? `${SITE}${imagem}` : `${SITE}/images/hero-mesa-posta.jpg`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(titulo)}</title>
<meta name="description" content="${escapeHtml(descricao)}">
<link rel="canonical" href="${SITE}${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="${tipo}">
<meta property="og:site_name" content="${SITE_NOME}">
<meta property="og:title" content="${escapeHtml(titulo)}">
<meta property="og:description" content="${escapeHtml(descricao)}">
<meta property="og:url" content="${SITE}${canonical}">
<meta property="og:image" content="${ogImg}">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
<meta name="google-site-verification" content="X0yhfl1co1b9FpV_TUJk6z1nReO8QQpNqI1T51ynxQM">
${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n")}
</head>
<body data-pagina="${ativo}">
<header class="cabecalho">
  <div class="barra-nav">
    <a href="/" class="logo">Sabor de <span>Casa</span></a>
    <button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>
    <nav class="nav-principal" aria-label="Navegação principal">
      <ul>
        ${navItens.map((i) => `<li><a href="${i.href}"${i.ativo === ativo ? ' class="ativo"' : ""}>${i.texto}</a></li>`).join("\n        ")}
      </ul>
    </nav>
  </div>
</header>`;
}

function rodape() {
  return `<footer class="rodape">
  <div class="container rodape-grade">
    <div>
      <h3>Sabor de Casa</h3>
      <p>Receitas caseiras testadas na cozinha, com ingredientes do dia a dia e passo a passo sem enrolação. Publicamos receitas de café da manhã, almoço, jantar, lanches, sobremesas e bebidas.</p>
    </div>
    <nav aria-label="Categorias">
      <h3>Receitas</h3>
      <ul>
        ${Object.entries(CATEGORIAS).map(([nome, c]) => `<li><a href="/categorias/${c.slug}.html">${nome}</a></li>`).join("\n        ")}
      </ul>
    </nav>
    <nav aria-label="Links institucionais">
      <h3>Institucional</h3>
      <ul>
        <li><a href="/sobre.html">Sobre nós</a></li>
        <li><a href="/contato.html">Contato</a></li>
        <li><a href="/privacidade.html">Política de privacidade</a></li>
        <li><a href="/cookies.html">Política de cookies</a></li>
        <li><a href="/termos.html">Termos de uso</a></li>
      </ul>
    </nav>
  </div>
  <p class="container rodape-baixo">© ${new Date().getFullYear()} Sabor de Casa. Todos os direitos reservados. Conteúdo escrito e revisado por nossa equipe editorial.</p>
</footer>
<script src="/js/main.js"></script>
</body>
</html>`;
}

function cartao(r) {
  return `<article class="cartao-receita" data-categoria="${escapeHtml(r.categoria)}" data-busca="${escapeHtml(
    (r.titulo + " " + r.ingredientes.join(" ")).toLowerCase()
  )}">
  <a href="/receitas/${r.slug}.html">
    <div class="cartao-figura"><img src="/${r.imagem}" alt="${escapeHtml(r.titulo)}" loading="lazy" width="400" height="300"></div>
    <div class="cartao-corpo">
      <p class="cartao-categoria">${escapeHtml(r.categoria)}</p>
      <h3 class="cartao-titulo">${escapeHtml(r.titulo)}</h3>
      <p class="cartao-meta"><span>${escapeHtml(r.tempoTexto)}</span><span>${escapeHtml(r.porcoes)}</span></p>
    </div>
  </a>
</article>`;
}

// ---------- home ----------
function home() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NOME,
      url: SITE + "/",
      inLanguage: "pt-BR",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NOME,
      url: SITE + "/",
      logo: `${SITE}/favicon.svg`,
      email: "contato@receitassabordecasa.com.br",
    },
  ];

  return `${head({
    titulo: `Sabor de Casa — ${receitas.length} receitas fáceis e testadas para o dia a dia`,
    descricao:
      "Receitas caseiras testadas, com ingredientes simples e passo a passo detalhado: café da manhã, almoço, jantar, lanches, sobremesas e bebidas.",
    canonical: "/",
    imagem: "/images/hero-mesa-posta.jpg",
    schema,
    ativo: "home",
  })}
<main>
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <p class="hero-eyebrow">${receitas.length} receitas testadas</p>
        <h1>Receitas de verdade para a correria do dia a dia</h1>
        <p>Receitas simples, com ingredientes de mercado de bairro e o passo a passo que realmente funciona — testado na nossa cozinha antes de publicar.</p>
        <form class="busca-form" role="search" onsubmit="return false;">
          <label for="campo-busca" class="sr-only">Buscar receita</label>
          <input type="search" id="campo-busca" placeholder="Buscar por nome ou ingrediente...">
          <button type="submit" class="botao">Buscar</button>
        </form>
      </div>
      <figure class="hero-figura">
        <img src="/images/hero-mesa-posta.jpg" alt="Mesa posta com pratos de comida caseira" width="640" height="480">
      </figure>
    </div>
  </section>
  <section class="filtros container" aria-label="Filtrar por categoria">
    <ul class="filtros-lista" id="lista-filtros">
      <li><a class="filtro-botao" href="/" aria-current="page">Todas (${receitas.length})</a></li>
      ${Object.entries(CATEGORIAS)
        .map(
          ([nome, c]) =>
            `<li><a class="filtro-botao" href="/categorias/${c.slug}.html">${nome} (${porCategoria(nome).length})</a></li>`
        )
        .join("\n      ")}
    </ul>
  </section>
  <section class="secao-receitas container" aria-labelledby="titulo-receitas">
    <h2 class="secao-titulo" id="titulo-receitas">Todas as receitas</h2>
    <div class="grade-receitas" id="grade-receitas">
      ${receitas.map(cartao).join("\n      ")}
    </div>
    <p class="sem-resultados" id="sem-resultados">Nenhuma receita encontrada com esse termo.</p>
  </section>
  <section class="container bloco-texto">
    <h2>Como escolhemos as receitas</h2>
    <p>Cada receita publicada aqui passa por três etapas: teste na cozinha, revisão do texto e checagem das medidas. Só entra no site o que deu certo com ingredientes encontrados em supermercado comum — sem farinha importada, sem equipamento profissional e sem passo que ninguém entende.</p>
    <p>Quando uma receita tem um ponto crítico (o ponto do brigadeiro, o descanso da massa, a temperatura do óleo), isso aparece escrito no meio do modo de preparo, e não escondido no rodapé. Se você seguir a ordem, dá certo.</p>
  </section>
</main>
${rodape()}`;
}

// ---------- página de receita ----------
function paginaReceita(r) {
  const cat = CATEGORIAS[r.categoria];
  const rel = receitas
    .filter((x) => x.categoria === r.categoria && x.slug !== r.slug)
    .slice(0, 3);

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: r.titulo,
      image: [`${SITE}/${r.imagem}`],
      author: { "@type": "Organization", name: SITE_NOME, url: SITE + "/" },
      publisher: { "@type": "Organization", name: SITE_NOME },
      datePublished: r.publicado,
      dateModified: r.atualizado ?? r.publicado,
      description: r.descricao,
      recipeCategory: r.categoria,
      recipeCuisine: "Brasileira",
      keywords: r.palavrasChave.join(", "),
      prepTime: iso(r.minutosPreparo),
      cookTime: iso(r.minutosFogo),
      totalTime: iso(r.minutosPreparo + r.minutosFogo + (r.minutosEspera ?? 0)),
      recipeYield: r.porcoes,
      recipeIngredient: r.ingredientes,
      recipeInstructions: r.passos.map((p) => ({ "@type": "HowToStep", text: p })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: r.categoria, item: `${SITE}/categorias/${cat.slug}.html` },
        { "@type": "ListItem", position: 3, name: r.titulo },
      ],
    },
  ];

  return `${head({
    titulo: `${r.titulo} — receita fácil passo a passo | ${SITE_NOME}`,
    descricao: r.descricao,
    canonical: `/receitas/${r.slug}.html`,
    imagem: r.imagem,
    tipo: "article",
    schema,
    ativo: cat.slug,
  })}
<main>
  <nav class="trilha container" aria-label="Trilha de navegação">
    <a href="/">Início</a> / <a href="/categorias/${cat.slug}.html">${escapeHtml(r.categoria)}</a> / <span>${escapeHtml(r.titulo)}</span>
  </nav>

  <header class="receita-cabecalho container">
    <p class="receita-categoria">${escapeHtml(r.categoria)}</p>
    <h1 class="receita-titulo">${escapeHtml(r.titulo)}</h1>
    <p class="receita-descricao">${escapeHtml(r.chamada)}</p>
  </header>

  <div class="container">
    <figure class="receita-figura">
      <img src="/${r.imagem}" alt="${escapeHtml(r.titulo)} pronto para servir" width="1200" height="675">
    </figure>

    <dl class="receita-info">
      <div><dt>Tempo de preparo</dt><dd>${escapeHtml(r.tempoTexto)}</dd></div>
      <div><dt>Rendimento</dt><dd>${escapeHtml(r.porcoes)}</dd></div>
      <div><dt>Dificuldade</dt><dd>${escapeHtml(r.dificuldade)}</dd></div>
    </dl>

    <article class="receita-conteudo">
      <section aria-labelledby="t-ing">
        <h2 id="t-ing">Ingredientes</h2>
        <ul class="lista-ingredientes">${r.ingredientes.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
      </section>
      <section aria-labelledby="t-prep">
        <h2 id="t-prep">Modo de preparo</h2>
        <ol class="lista-passos">${r.passos.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ol>
      </section>
    </article>

    <section class="receita-texto">
      ${r.introducao.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n      ")}

      <h2>Dicas para acertar de primeira</h2>
      <ul class="lista-dicas">${r.dicas.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>

      <h2>Variações da receita</h2>
      <ul class="lista-dicas">${r.variacoes.map((v) => `<li>${escapeHtml(v)}</li>`).join("")}</ul>

      <h2>Como conservar</h2>
      <p>${escapeHtml(r.conservacao)}</p>

      <h2>Perguntas frequentes</h2>
      <div class="faq">
        ${r.faq
          .map(
            (f, idx) => `<details${idx === 0 ? " open" : ""}><summary>${escapeHtml(f.pergunta)}</summary><p>${escapeHtml(
              f.resposta
            )}</p></details>`
          )
          .join("\n        ")}
      </div>

      <p class="nota-receita">Receita publicada em ${formatarData(r.publicado)} e revisada pela equipe editorial do Sabor de Casa. Se você fizer, conte como ficou: <a href="/contato.html">fale com a gente</a>.</p>
    </section>
  </div>

  <section class="container secao-relacionadas" aria-labelledby="t-rel">
    <h2 class="secao-titulo" id="t-rel">Mais receitas de ${escapeHtml(r.categoria.toLowerCase())}</h2>
    <div class="grade-receitas">
      ${rel.map(cartao).join("\n      ")}
    </div>
  </section>
</main>
${rodape()}`;
}

function formatarData(data) {
  const [a, m, d] = data.split("-");
  return `${d}/${m}/${a}`;
}

// ---------- categoria ----------
function paginaCategoria(nome) {
  const c = CATEGORIAS[nome];
  const lista = porCategoria(nome);
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: c.titulo,
      description: c.descricao,
      url: `${SITE}/categorias/${c.slug}.html`,
      inLanguage: "pt-BR",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: nome },
      ],
    },
  ];
  return `${head({
    titulo: `${c.titulo} — ${lista.length} receitas testadas | ${SITE_NOME}`,
    descricao: c.descricao,
    canonical: `/categorias/${c.slug}.html`,
    schema,
    ativo: c.slug,
  })}
<main>
  <nav class="trilha container" aria-label="Trilha de navegação"><a href="/">Início</a> / <span>${nome}</span></nav>
  <header class="receita-cabecalho container">
    <p class="receita-categoria">Categoria</p>
    <h1 class="receita-titulo">${c.titulo}</h1>
    <p class="receita-descricao">${c.descricao}</p>
  </header>
  <section class="container secao-receitas">
    <p class="texto-categoria">${c.intro}</p>
    <div class="grade-receitas">
      ${lista.map(cartao).join("\n      ")}
    </div>
  </section>
  <section class="container bloco-texto">
    <h2>Como usar estas receitas no dia a dia</h2>
    <p>Escolha uma receita para a semana e faça a lista de compras a partir dos ingredientes. Quase todas usam a mesma base de despensa — óleo, alho, cebola, sal e farinha —, então o custo por prato cai quando você cozinha duas ou três de uma vez.</p>
    <p>Se for a primeira vez fazendo uma delas, siga a quantidade indicada sem dobrar a receita. Massas e cremes não escalam de forma linear: dobrar o leite sem ajustar o tempo de fogo costuma dar ponto errado.</p>
  </section>
</main>
${rodape()}`;
}

// ---------- páginas institucionais ----------
function paginaInstitucional(p) {
  return `${head({
    titulo: `${p.titulo} | ${SITE_NOME}`,
    descricao: p.descricao,
    canonical: `/${p.slug}.html`,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: p.titulo,
        description: p.descricao,
        url: `${SITE}/${p.slug}.html`,
        inLanguage: "pt-BR",
      },
    ],
    ativo: p.slug,
  })}
<main>
  <article class="pagina-institucional container">
    <h1>${escapeHtml(p.titulo)}</h1>
    <p class="atualizado">Última atualização: ${p.atualizado}</p>
    ${p.corpo}
  </article>
</main>
${rodape()}`;
}

// ---------- escrever ----------
function escrever(rel, conteudo) {
  const dest = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, conteudo, "utf8");
}

escrever("index.html", home());
for (const r of receitas) escrever(`receitas/${r.slug}.html`, paginaReceita(r));
for (const nome of Object.keys(CATEGORIAS)) {
  if (porCategoria(nome).length) escrever(`categorias/${CATEGORIAS[nome].slug}.html`, paginaCategoria(nome));
}
for (const p of paginas) escrever(`${p.slug}.html`, paginaInstitucional(p));

// sitemap
const urls = [
  { loc: "/", pri: "1.0", mod: HOJE },
  ...receitas.map((r) => ({ loc: `/receitas/${r.slug}.html`, pri: "0.8", mod: r.atualizado ?? r.publicado })),
  ...Object.keys(CATEGORIAS)
    .filter((n) => porCategoria(n).length)
    .map((n) => ({ loc: `/categorias/${CATEGORIAS[n].slug}.html`, pri: "0.6", mod: HOJE })),
  ...paginas.map((p) => ({ loc: `/${p.slug}.html`, pri: "0.3", mod: HOJE })),
];
escrever(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${u.mod}</lastmod>
    <priority>${u.pri}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`
);
escrever(
  "robots.txt",
  `User-agent: *
Allow: /

User-agent: Mediapartners-Google
Allow: /

Sitemap: ${SITE}/sitemap.xml
`
);
escrever("CNAME", "receitassabordecasa.com.br\n");

// limpar arquivos antigos
for (const velho of ["receita.html", "js/receita.js", "js/recipes-data.js"]) {
  const p = path.join(ROOT, velho);
  if (fs.existsSync(p)) fs.rmSync(p);
}

console.log(`OK: ${receitas.length} receitas, ${Object.keys(CATEGORIAS).length} categorias, ${paginas.length} páginas institucionais.`);
