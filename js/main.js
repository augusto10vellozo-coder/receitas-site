// Menu mobile + busca instantânea na home.
(function () {
  const botao = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-principal");
  if (botao && nav) {
    botao.addEventListener("click", () => {
      const aberto = nav.classList.toggle("aberto");
      botao.setAttribute("aria-expanded", String(aberto));
    });
  }

  const campo = document.getElementById("campo-busca");
  const grade = document.getElementById("grade-receitas");
  const vazio = document.getElementById("sem-resultados");
  if (!campo || !grade) return;

  const cartoes = Array.from(grade.querySelectorAll(".cartao-receita"));
  const normalizar = (t) =>
    t
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  function filtrar() {
    const termo = normalizar(campo.value.trim());
    let visiveis = 0;
    cartoes.forEach((c) => {
      const alvo = normalizar(c.dataset.busca || "");
      const mostra = !termo || alvo.includes(termo);
      c.hidden = !mostra;
      if (mostra) visiveis++;
    });
    if (vazio) vazio.style.display = visiveis === 0 ? "block" : "none";
  }

  campo.addEventListener("input", filtrar);
  const form = campo.closest("form");
  if (form) form.addEventListener("submit", (e) => e.preventDefault());
})();
