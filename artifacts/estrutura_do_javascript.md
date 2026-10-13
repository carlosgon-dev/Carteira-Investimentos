# Estrutura do JavaScript

Como o código da app está organizado e como as peças falam entre si.
Atualizado a 12 de outubro de 2026, depois da revisão completa do código. Os dados estão descritos em `base-de-dados.md`.

## Regras do código

| Regra | Exemplo |
| ----- | ------- |
| Sem classes: só **funções**, agrupadas em **módulos** (ES modules) | `export function calcular_total_investido(…)` |
| Tudo em **snake_case**: funções, variáveis, ficheiros e dados | `filtrar_posicoes_abertas`, `id_posicao` |
| **Nomes claros**, mesmo que compridos; as funções começam por um **verbo** | `obter_objeto_por_data_mais_recente`, `escrever_ha_quantos_dias` |
| Booleanos com nome de pergunta | `tem_compras`, `foi_vendida`, `esta_a_confirmar`, `era_linha_nova` |
| Constantes em **MAIÚSCULAS**: as **partilhadas** (2+ ficheiros) no `constantes.js`; as **privadas** no topo do próprio ficheiro | `PREFIXOS_ID` (partilhada) · `NUMERO_CORES` (só `graficos.js`) |
| Funções pequenas, uma coisa cada, com **early return** | `if (!botao) return;` |
| Os dados **nunca se alteram**: cria-se sempre uma cópia nova | `[...gaveta, objeto]`, `map`, `filter`, `structuredClone` |
| O que pode ser calculado **não se guarda** | a posição aberta/fechada calcula-se a partir das compras e vendas |
| Ficheiros organizados em **regiões dobráveis** | `// #region ===== CONSTANTES =====` … `// #endregion` |
| Funções que devolvem objetos/listas têm um **exemplo** no `return` | `return { investido, rendibilidade }; // → { investido: 1580.25, … }` |

## Pastas do projeto

```
projeto_carteira_investimentos/
  index.html               ← a única página HTML (carrega o main.js como módulo)
  css/                     ← 3 ficheiros (ver estrutura_do_css.md)
  data/
    dados.json             ← a "base de dados" inicial (valores fictícios)
    eder.mp4               ← o vídeo da surpresa
  js/
    main.js                ← 🚀 arranque + navegação entre páginas
    gestor_dados.js        ← 🔒 o cofre dos dados (closure + localStorage)
    eventos.js             ← 👂 os 5 ouvidos da app (cliques, formulários)
    constantes.js          ← constantes partilhadas (PREFIXOS_ID, NOMES_CATEGORIAS)
    ferramentas.js         ← ferramentas genéricas (formatar €, %, datas, ids, esperar…)
    calculadores.js        ← contas a partir dos dados (filtrar, somar, agrupar)
    graficos.js            ← peças de desenho (painel, cartão, tabelas, gráficos, botões)
    notificacoes.js        ← o balão "✓ Registo guardado"
    cotacoes.js            ← o rodapé com os preços ao vivo (3 APIs)
    surpresa.js            ← o vídeo do Éder 😄
    paginas/
      carteira.js          ← página Carteira
      fundos.js            ← página Fundos
      investimentos.js     ← ETF's, Criptomoedas, REIT's, Ações e Fundos de investimento (uma função para as 5)
      formularios.js       ← formulário "Novo registo/compra" + rascunhos (sessionStorage)
      depositos.js, governo.js, mais_valias.js, ppr.js, ouro.js, historico.js, calendario.js  ← por fazer (só o título)
  artifacts/               ← documentação, protótipo e diagramas (não faz parte da app)
```

## O que faz cada módulo

| Módulo | Responsabilidade | Importa de |
| ------ | ---------------- | ---------- |
| `constantes.js` | valores fixos usados por vários ficheiros | ninguém |
| `ferramentas.js` | ferramentas genéricas (serviam para qualquer app) | ninguém |
| `gestor_dados.js` | carregar os dados, protegê-los (closure) e guardá-los no `localStorage` | ninguém |
| `calculadores.js` | contas a partir das gavetas (não toca no HTML) | `ferramentas` |
| `graficos.js` | peças visuais reutilizáveis: **recebem dados e devolvem HTML** em texto | `ferramentas` |
| `notificacoes.js`, `surpresa.js`, `cotacoes.js` | peças independentes, cada uma com a sua tarefa | `ferramentas` |
| `paginas/*.js` | desenhar uma página: **juntam** cálculos + gráficos + formatação | `constantes`, `calculadores`, `graficos`, `ferramentas` |
| `eventos.js` | ouvir os cliques/formulários e chamar quem sabe fazer o trabalho | `ferramentas`, `constantes`, `graficos`, `notificacoes`, `paginas/investimentos`, `paginas/formularios` |
| `main.js` | arrancar a app e mostrar as páginas | `gestor_dados`, `eventos`, `cotacoes`, `surpresa`, `paginas/*` |

A ideia: **as páginas decidem o QUÊ** mostrar, **o `graficos.js` decide o COMO**, e **o `calculadores.js` faz as CONTAS**.

## Como as peças falam entre si

### 1. O arranque (`main.js` → `arrancar`)

```
1. dados = await carregar_dados()        → abre o cofre (localStorage ou, na 1.ª vez, data/dados.json)
2. ativar_eventos({ dados, … })          → entrega as ferramentas ao eventos.js e liga os 5 ouvidos
3. mostrar_pagina(…)                     → abre a página do F5 (sessionStorage) ou a Carteira
4. mostrar_surpresa_depois_de_esperar()  → começa a contar os 30 s (sem await)
5. ativar_rodape_cotacoes()              → preços agora e a cada 60 s (sem await)
```

Tudo dentro de `try/catch`: se os dados não carregarem, aparece uma mensagem em vez de um ecrã em branco.

### 2. A navegação (SPA: uma só página HTML)

`mostrar_pagina("fundos")` vai buscar a função ao objeto `PAGINAS` (`PAGINAS["fundos"]` → `desenhar_pagina_fundos`), que **devolve HTML**, e mete-o no `<main id="pagina">` com `innerHTML`. A app nunca muda de ficheiro HTML: só troca o recheio dessa caixa.

### 3. Os 5 ouvidos (`eventos.js` → `ativar_eventos`)

| Evento | Onde | Função | O que faz |
| ------ | ---- | ------ | --------- |
| 1 | `click` no menu | `tratar_clique_menu` | ☰ (telemóvel), "Repor dados iniciais", ou abrir uma página |
| 2 | `click` no documento (**captura**) | `tratar_clique_fora_da_linha_em_espera` | cancela o ✎ / ✕ / "+ …" a meio quando se clica fora da linha |
| 3 | `click` na página | `tratar_clique_botao_tabela` | um `switch` pelo `data-acao`: editar, guardar, apagar, adicionar, cancelar, mudar escolha (€ / %), abrir página, cancelar formulário |
| 4 | `submit` na página | `tratar_guardar_formulario` | `preventDefault` + um `switch` pelo `data-formulario` |
| 5 | `input` na página | `atualizar_rascunho_sessionstorage` | guarda o rascunho do formulário a cada letra |

Com **delegação de eventos**, 5 ouvidos chegam para a app toda: cada botão diz o que quer pelos atributos `data-…` (`data-acao`, `data-gaveta`, `data-id`, `data-pagina`…).

### 4. O ciclo de uma alteração

```
clique (✎ ✓, ✕ ✓, "+ …" ✓, Guardar compra)
  → validação nas portas de entrada (required/min/max + checkValidity, Number(…))
  → dados.editar / adicionar / apagar (o cofre grava no localStorage)
  → a página é redesenhada (redesenhar_pagina_atual)
  → mostrar_notificacao("✓ …")
```

## O cofre: scope e closures (requisito 6)

- **Scope:** uma variável criada com `const` / `let` só existe dentro do bloco `{ }` onde nasceu.
- **Closure:** uma função criada dentro de outra continua a ver as variáveis de lá, mesmo depois de a de fora ter acabado.
- `carregar_dados()` guarda o `arquivo` num "cofre" privado. Só se lhe mexe pelas funções que ela devolve, e cada alteração é gravada logo no `localStorage`.

```js
export async function carregar_dados() {
  let arquivo = …;                                        // 🔒 privado: ninguém lhe chega de fora
  return {
    ler: (nome_gaveta) => structuredClone(arquivo[nome_gaveta]),   // devolve uma cópia (requisito 3)
    adicionar: (nome_gaveta, novo_objeto) => { … },               // gaveta nova + guardar()
    editar: (nome_gaveta, id, valores_novos) => { … },
    apagar: (nome_gaveta, id) => { … },
    repor: async () => { … },                                     // volta ao data/dados.json
  };
}
```

**Injeção de dependências:** o `main.js` entrega ao `eventos.js` o que ele precisa (`ativar_eventos({ dados, mostrar_pagina, redesenhar_pagina_atual, voltar_pagina_anterior })`). O `eventos.js` não importa o `main.js`; recebe as "ferramentas do main".

## Assincronismo (requisito 7)

| Onde | Forma | Para quê |
| ---- | ----- | -------- |
| `gestor_dados.js` → `ler_ficheiro` | `async/await` + `resposta.ok` | ler o `data/dados.json` |
| `main.js` → `arrancar` | `try/catch` | mostrar um erro se os dados falharem |
| `cotacoes.js` | `fetch(…).then(…)` + `Promise.all` + `.catch` | 3 APIs ao mesmo tempo; se falharem, valores de exemplo |
| `ferramentas.js` → `esperar` | `new Promise` + `setTimeout` | pausas (notificações, surpresa) |
| `surpresa.js` | `video.play().catch(…)` | se o browser bloquear o som, toca sem som |

⚠️ O `fetch` não funciona se abrires o `index.html` com duplo clique (`file://`). Para correr localmente, usa a extensão **Live Server** do VSCode.

## Armazenamento

| Onde | Chave | O quê |
| ---- | ----- | ----- |
| `localStorage` | `CHAVE_LOCALSTORAGE_DADOS` (`"carteira_investimentos"`) | os dados, com todas as alterações |
| `sessionStorage` | `CHAVE_SESSIONSTORAGE_PAGINA_ABERTA` (`"pagina_aberta"`) | a página aberta, para voltar a ela depois do F5 |
| `sessionStorage` | `obter_chave_sessionstorage_rascunho(…)` (`"rascunho_novo_registo"`) | o que já está escrito num formulário |

## Estado

- ✅ Feito: Carteira, Fundos, as 5 páginas de investimentos, formulário "Novo registo/compra", rodapé das cotações, notificações, versão para telemóvel, valores fictícios.
- ⏳ Por fazer (fora da entrega): formulários "Registar rendibilidade" e "Registar venda"; páginas Depósitos, Governo, Mais-valias, PPR, Ouro, Histórico e Calendário.
- 💡 Ideias para depois: guardar os dados de forma permanente (servidor Node, gravar no ficheiro ou Exportar/Importar) e proteger os dados com password (Web Crypto).
