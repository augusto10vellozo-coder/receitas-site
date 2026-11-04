import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv[2];
const dir = path.join(ROOT, "receitas");
const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));

let problemas = 0;
for (const f of arquivos) {
  const html = fs.readFileSync(path.join(dir, f), "utf8");
  const titulo = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
  const canonical = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1] || "";
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  let schemaOk = true;
  for (const bloco of ld) {
    try { JSON.parse(bloco); } catch { schemaOk = false; }
  }
  const texto = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ");
  const palavras = texto.split(/\s+/).filter((p) => p.length > 1).length;
  const imgs = [...html.matchAll(/src="(\/images\/[^"]+)"/g)].map((m) => m[1]);
  const faltando = imgs.filter((i) => !fs.existsSync(path.join(ROOT, i)));
  const alerta = [];
  if (!canonical) alerta.push("sem canonical");
  if (desc.length < 80 || desc.length > 165) alerta.push(`desc ${desc.length}c`);
  if (!schemaOk) alerta.push("schema inválido");
  if (palavras < 500) alerta.push(`só ${palavras} palavras`);
  if (faltando.length) alerta.push("imagem faltando: " + faltando.join(","));
  if (alerta.length) problemas++;
  console.log(`${f.padEnd(42)} ${String(palavras).padStart(5)} palavras  ${alerta.length ? "⚠ " + alerta.join(" | ") : "ok"}`);
}
console.log(`\n${arquivos.length} páginas, ${problemas} com alerta.`);
