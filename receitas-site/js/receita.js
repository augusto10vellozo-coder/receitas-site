/* Monta a página de uma receita a partir de ?slug= e injeta dados estruturados schema.org/Recipe */
(function () {
  const slug = new URLSearchParams(location.search).get("slug");
  const r = RECIPES.find(x => x.slug === slug);
  const box = document.getElementById("conteudo-receita");
  if (!box) return;
  if (!r) {
    box.innerHTML = `<div class="pagina-institucional container"><h1>Receita não encontrada</h1><p><a href="index.html">Voltar para a página inicial</a></p></div>`;
    return;
  }
  document.title = `${r.title} — Sabor de Casa`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", r.description);
  box.innerHTML = `
    <nav class="trilha container" aria-label="Trilha de navegação"><a href="index.html">Início</a> / <span>${r.title}</span></nav>
    <header class="receita-cabecalho container">
      <p class="receita-categoria">${r.category}</p>
      <h1 class="receita-titulo">${r.title}</h1>
      <p class="receita-descricao">${r.description}</p>
    </header>
    <div class="container">
      <figure class="receita-figura"><img src="${r.image}" alt="Foto pronta de ${r.title}" width="800" height="450"></figure>
      <dl class="receita-info">
        <div><dt>Tempo de preparo</dt><dd>${r.time}</dd></div>
        <div><dt>Rendimento</dt><dd>${r.servings}</dd></div>
        <div><dt>Dificuldade</dt><dd>${r.difficulty}</dd></div>
      </dl>
      <article class="receita-conteudo">
        <section aria-labelledby="t-ing"><h2 id="t-ing">Ingredientes</h2>
          <ul class="lista-ingredientes">${r.ingredients.map(i => `<li>${i}</li>`).join("")}</ul></section>
        <section aria-labelledby="t-prep"><h2 id="t-prep">Modo de preparo</h2>
          <ol class="lista-passos">${r.steps.map(s => `<li>${s}</li>`).join("")}</ol></section>
      </article>
    </div>`;
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({"@context":"https://schema.org/","@type":"Recipe",name:r.title,description:r.description,recipeCategory:r.category,recipeYield:r.servings,totalTime:r.time,recipeIngredient:r.ingredients,recipeInstructions:r.steps.map(s=>({"@type":"HowToStep",text:s})),image:r.image});
  document.head.appendChild(ld);
  const rel = document.getElementById("receitas-relacionadas");
  const outras = RECIPES.filter(x => x.category === r.category && x.slug !== r.slug).slice(0, 3);
  if (rel && outras.length) rel.innerHTML = `<h2 class="secao-titulo">Mais receitas de ${r.category.toLowerCase()}</h2><div class="grade-receitas">${outras.map(x => `<article class="cartao-receita"><a href="receita.html?slug=${x.slug}"><div class="cartao-figura"><img src="${x.image}" alt="Foto de ${x.title}" loading="lazy" width="400" height="300"></div><div class="cartao-corpo"><p class="cartao-categoria">${x.category}</p><h3 class="cartao-titulo">${x.title}</h3></div></a></article>`).join("")}</div>`;
})();
