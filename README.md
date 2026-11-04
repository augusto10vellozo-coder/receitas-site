# Sabor de Casa — receitassabordecasa.com.br

Site estático de receitas. HTML gerado por um script Node a partir dos dados em `/dados`.

## Estrutura

```
dados/
  receitas-01.json ... receitas-04.json   # receitas (array de objetos)
  paginas.json                            # Sobre, Contato, Privacidade, Cookies, Termos
scripts/
  build.mjs                               # gera o site inteiro
  serve.mjs                               # servidor local para pré-visualizar
  qa.mjs                                  # checagem de conteúdo/schema
receitas/<slug>.html                      # gerado — não editar à mão
categorias/<slug>.html                    # gerado
index.html                                # gerado
sitemap.xml, robots.txt                   # gerados
images/                                   # fotos (JPG, até ~250 KB)
```

## Pré-visualizar

```bash
node scripts/serve.mjs . 8080
```

Abra http://localhost:8080.

## Publicar mudanças

1. Edite o JSON da receita (ou crie um novo lote `dados/receitas-05.json`).
2. Rode `node scripts/build.mjs`.
3. Commit e push na branch `main`.
4. O GitHub Pages publica sozinho em 1–2 minutos.

## Adicionar uma receita

Copie um objeto existente em `dados/receitas-04.json` e ajuste os campos:

| Campo | Observação |
|---|---|
| `slug` | vira a URL: `/receitas/<slug>.html` (só minúsculas e hífen) |
| `titulo` | H1 e `<title>` |
| `descricao` | meta description, 120–160 caracteres |
| `chamada` | subtítulo exibido abaixo do H1 |
| `imagem` | caminho em `images/`, ex. `images/bolo.jpg` |
| `tempoTexto` | texto exibido, ex. `40 min` |
| `minutosPreparo`, `minutosFogo`, `minutosEspera` | usados no schema `Recipe` |
| `porcoes`, `dificuldade`, `palavrasChave` | metadados |
| `ingredientes`, `passos` | listas |
| `introducao` | 2 parágrafos |
| `dicas`, `variacoes` | listas de 3 a 5 itens |
| `conservacao` | 1 parágrafo |
| `faq` | 3 itens `{ pergunta, resposta }` |
| `publicado`, `atualizado` | datas `AAAA-MM-DD` |

A imagem deve ter 1200 px de largura e ficar abaixo de 250 KB.

## Checklist antes de pedir revisão no AdSense

- [ ] `https://receitassabordecasa.com.br/` abre com HTTPS
- [ ] `www` redireciona para o domínio principal
- [ ] `/sitemap.xml` e `/robots.txt` acessíveis
- [ ] 20+ receitas com conteúdo completo e foto
- [ ] Sobre, Contato, Privacidade, Cookies e Termos no ar
- [ ] Nenhum bloco de anúncio vazio na página
