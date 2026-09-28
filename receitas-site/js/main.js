/* Menu mobile (todas as páginas) + listagem/busca/filtro (página inicial) */
(function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navPrincipal = document.querySelector(".nav-principal");
  menuToggle?.addEventListener("click", () => {
    navPrincipal.classList.toggle("aberto");
    menuToggle.setAttribute("aria-expanded", String(navPrincipal.classList.contains("aberto")));
  });

  const grade = document.getElementById("grade-receitas");
  if (!grade) return;
  const campoBusca = document.getElementById("campo-busca");
  const listaFiltros = document.getElementById("lista-filtros");
  const semResultados = document.getElementById("sem-resultados");
  let categoriaAtiva = "Todas";

  function criarCartao(r) {
    const a = document.createElement("article");
    a.className = "cartao-receita";
    a.innerHTML = `<a href="receita.html?slug=${r.slug}" aria-label="Ver receita: ${r.title}">
      <div class="cartao-figura"><img src="${r.image}" alt="Foto de ${r.title}" loading="lazy" width="400" height="300"></div>
      <div class="cartao-corpo"><p class="cartao-categoria">${r.category}</p><h3 class="cartao-titulo">${r.title}</h3>
      <p class="cartao-meta"><span>⏱ ${r.time}</span><span>🍽 ${r.servings}</span></p></div></a>`;
    return a;
  }

  function renderizar() {
    const t = (campoBusca?.value || "").trim().toLowerCase();
    const lista = RECIPES.filter(r =>
      (categoriaAtiva === "Todas" || r.category === categoriaAtiva) &&
      (!t || r.title.toLowerCase().includes(t) || r.description.toLowerCase().includes(t) ||
        r.ingredients.some(i => i.toLowerCase().includes(t))));
    grade.innerHTML = "";
    lista.forEach(r => grade.appendChild(criarCartao(r)));
    if (semResultados) semResultados.style.display = lista.length ? "none" : "block";
  }

  ["Todas", ...new Set(RECIPES.map(r => r.category))].forEach(cat => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button"; b.className = "filtro-botao"; b.textContent = cat;
    b.setAttribute("aria-pressed", cat === "Todas");
    b.addEventListener("click", () => {
      categoriaAtiva = cat;
      listaFiltros.querySelectorAll(".filtro-botao").forEach(x => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      renderizar();
    });
    li.appendChild(b); listaFiltros.appendChild(li);
  });
  campoBusca?.addEventListener("input", renderizar);
  renderizar();
})();
