# Requisitos do enunciado (Projeto Prático JS)

Resumo do enunciado `Projeto-pratico-JS.pdf` e **onde** a app Carteira de Investimentos cumpre cada ponto.
Atualizado a 12 de outubro de 2026, depois da revisão completa do código.

## O que é pedido

Uma **aplicação web interativa e responsiva**, com HTML5, CSS3 e JavaScript ES6+.
O **tema é livre**; a sugestão n.º 2 do enunciado é precisamente uma carteira de finanças pessoais.

## Os 8 requisitos obrigatórios

| # | Requisito                                                                                        | Onde está na app                                                                                                                                                                                                                                                                                                                                   |
| - | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | **Lógica e controlo de fluxo** (if/else, switch, ternários, ciclos, map, filter, reduce) | `switch` nos eventos 3 e 4 (`eventos.js`) · ternários em `acrescentar_sinal`, `obter_limite`… · *early return* em quase todas as funções · `for…of` em `agrupar_investido_por_chave` · `map`/`filter`/`reduce`/`find`/`sort` no `calculadores.js` e no `ferramentas.js`                                        |
| 2 | **Dados simples** (strings, números, booleanos, moedas, datas)                            | `formatar_euro`, `formatar_percentagem`, `formatar_data`, `escrever_ha_quantos_dias` (`ferramentas.js`) · datas em texto `"AAAA-MM-DD"` · `Number(…)` nos campos · booleanos como `verificar_posicao_aberta`, `esta_a_confirmar`                                                                                              |
| 3 | **Dados complexos imutáveis** (adicionar, ordenar, filtrar sem alterar o original)        | o cofre (`gestor_dados.js`) cria sempre uma gaveta **nova** (`[...gaveta, objeto]`, `filter`, `map` + `{ ...objeto, ...valores_novos }`) · `ler` devolve uma **cópia** (`structuredClone`) · `ordenar_por_data_mais_recente` ordena uma cópia (`[...lista]`)                                                      |
| 4 | **DOM dinâmico** (createElement, innerHTML, template strings)                             | todas as páginas são**template strings** (`graficos.js` + `paginas/`) · `createElement` nas notificações e na surpresa · `insertRow` no "+ …" · `innerHTML`/`outerHTML`/`textContent` no `eventos.js`                                                                                                                 |
| 5 | **Reatividade e eventos** (cliques, inputs, formulários, filtros)                         | **5 ouvidos com delegação de eventos** (`ativar_eventos`): menu, clique fora (captura), botões das tabelas (✎ ✓ ✕ ↩ +, € / %, abrir página), `submit` dos formulários, `input` para os rascunhos · menu ☰ no telemóvel · acordeões (`<details>`)                                                                       |
| 6 | **Scope e closures** (const/let, encapsulamento, proteger dados)                           | `carregar_dados()` (`gestor_dados.js`): o `arquivo` fica **privado** e só se lhe chega pelas 5 funções devolvidas (`ler`, `adicionar`, `editar`, `apagar`, `repor`) · **injeção de dependências** do `main.js` para o `eventos.js`                                                                           |
| 7 | **Assincronismo** (fetch, async/await, try/catch)                                          | `ler_ficheiro` (`fetch` do `data/dados.json`) com **async/await** e `try/catch` no `arrancar` · rodapé das cotações com **3 APIs públicas** em paralelo (`Promise.all` + `.then` + `.catch`) · `esperar` = uma **Promise feita à mão** (`new Promise` + `setTimeout`) · `video.play().catch(…)` |
| 8 | **Módulos** (import/export) ou funções reutilizáveis                                   | **ES modules** (`<script type="module">`): 21 ficheiros em `js/` (10) e `js/paginas/` (11) · peças reutilizáveis (`desenhar_painel`, `desenhar_tabela`, `desenhar_pagina_investimento` serve 5 páginas…)                                                                                                                     |

**Persistência (obrigatória):** ✅ `localStorage` para os dados (o cofre) e `sessionStorage` para a página aberta (F5) e para os rascunhos dos formulários.

**Responsiva:** ✅ abaixo de 600px: menu ☰ no topo, tudo numa coluna, cartões 2 a 2, `:root` a 12px (`@media` no fim do `layout.css` e do `componentes.css`).

## Extras que mostram mais do que o pedido

- **Validação nas portas de entrada:** `required`/`min`/`max`/`type="number"` + `checkValidity()` nos campos; `resposta.ok` nos `fetch`; `textContent` nas notificações.
- **Modo escuro automático** (`prefers-color-scheme`) e **menos movimento** (`prefers-reduced-motion`).
- **Gráficos feitos à mão**, sem bibliotecas: donut em SVG (`stroke-dasharray`) e barras com `div`s e percentagens.
- **SPA (Single Page Application):** uma só página HTML; o `main.js` troca o conteúdo do `<main id="pagina">`.

## Entrega

|                                                                                 | Estado                                       |
| ------------------------------------------------------------------------------- | -------------------------------------------- |
| **Repositório no GitHub com valores fictícios**                         | ✅`data/dados.json` com valores fictícios |
| **Publicado no GitHub Pages**                                             | ⏳ por fazer                                 |
| **README.md** (descrição, link do GitHub Pages, como correr localmente) | ⏳ por fazer                                 |

- 📅 **Entrega:** 14/10/2026 até às 23:59
- 🎤 **Apresentação:** 16/10/2026

## Documentação relacionada

- `estrutura_do_javascript.md`: os módulos, as regras do código e como as peças falam entre si.
- `estrutura_do_css.md`: os 3 ficheiros de estilos e as regras.
- `base-de-dados.md`: as gavetas do `dados.json` e as decisões tomadas.
