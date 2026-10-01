# Requisitos do enunciado (Projeto Prático JS)

Resumo do enunciado `Projeto-pratico-JS.pdf` e onde a app Carteira de Investimentos cumpre cada ponto.
Feito a 1 de outubro de 2026, a partir do protótipo (versão 124).

## O que é pedido

Uma **aplicação web interativa e responsiva**, com HTML5, CSS3 e JavaScript ES6+.
O **tema é livre**; a sugestão n.º 2 do enunciado é precisamente uma carteira de finanças pessoais.

## Os 8 requisitos obrigatórios

| # | Requisito                                                                                                     | Na app                                                              |
| - | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1 | **Lógica e controlo de fluxo** (if/else, switch, ternários, for, map, filter, reduce)                 | totais, posições, cores por ano, filtros… em todo o lado         |
| 2 | **Dados simples** (strings, números, booleanos, moedas, datas)                                         | `formatar_euro`, datas pt-PT, validação dos formulários         |
| 3 | **Dados complexos imutáveis** (ordenar, filtrar, adicionar sem alterar o original)                     | a carteira usa sempre`[...array]`, `map` e `filter`           |
| 4 | **DOM dinâmico** (createElement, innerHTML, template strings)                                          | todas as páginas são desenhadas com template strings              |
| 5 | **Reatividade e eventos** (cliques, inputs, filtros, formulários, badges)                              | formulários, ✎ ✕, botões %/€, acordeões, filtros              |
| 6 | **Scope e closures** (const/let, encapsulamento, proteger dados)                                        | `criar_carteira()`: os dados ficam privados dentro da closure   |
| 7 | **Assincronismo** (fetch, async/await, try/catch). Pode ser uma API pública ou um `dados.json` local | pasta `data/` com `Promise.all` e rodapé de notícias (APIs)          |
| 8 | **Módulos** (import/export) ou funções reutilizáveis                                                | `js/` com módulos (ver `estrutura_do_javascript.md`) |

**Persistência (obrigatória):** `localStorage` ou `sessionStorage`. ✅ A app guarda tudo no `localStorage`.

## Estrutura do JavaScript (projeto real)

Está no seu próprio ficheiro: `estrutura_do_javascript.md` (módulos, regras do código, a closure da carteira e a ordem de trabalho).

## Entrega

1. **Repositório público no GitHub** ⚠️ com **valores fictícios**, não os valores reais.
2. **Publicado e a funcionar no GitHub Pages**, e é daí que se apresenta.
3. **README.md** com:
   - uma breve descrição do projeto;
   - o link direto para o site no GitHub Pages;
   - como correr o projeto localmente.

- 📅 **Entrega:** 14/10/2026 até às 23:59
- 🎤 **Apresentação:** 16/10/2026

## O que isto significa para a base de dados

O enunciado permite **ficheiros JSON locais para simular a base de dados**. Por isso:

- **pasta `data/`** (7 ficheiros JSON): os dados iniciais (fictícios), carregados com `fetch` + `async/await` + `try/catch` → requisito 7;
- **`localStorage`**: o que se acrescenta ou muda na app → persistência.

Tudo descrito em `base-de-dados.md`.
