# Estrutura do JavaScript (projeto real)

Como o código da app está organizado e a ordem em que vai ser escrito.
Feito a 1 de outubro de 2026. Os dados estão descritos em `base-de-dados.md`.

## Regras do código

| Regra                                                             | Exemplo                                     |
| ----------------------------------------------------------------- | ------------------------------------------- |
| Sem classes: só **funções**, agrupadas em **módulos**              | `export function total_investido(…)`        |
| Tudo em **snake_case**: funções, variáveis, ficheiros e dados     | `criar_carteira()`, `id_posicao`            |
| Constantes fixas em **MAIÚSCULAS**                               | `FICHEIROS_DADOS`, `CHAVE_GUARDADA`         |
| Cada função faz **uma** coisa e é reutilizável                    | `formatar_euro(24.6)` → `"24,60 €"`         |
| Os dados **nunca se alteram**: cria-se sempre uma cópia nova       | `[...lista, novo]`, `map`, `filter`         |
| O que pode ser calculado **não se guarda**                        | a mais-valia calcula-se a partir da venda  |
| Comentários curtos, em português                                  | `// Soma o dinheiro posto numa posição`     |

## Pastas do projeto

```
projeto_carteira_investimentos/
  index.html             ← a única página HTML (carrega o main.js)
  css/                   ← 3 ficheiros (ver estrutura_do_css.md)
    base.css
    layout.css
    componentes.css
  data/                  ← a "base de dados" (7 ficheiros JSON)
  js/
    main.js              ← 🚀 ponto de entrada: arranque + eventos
    constantes.js        ← regras fixas (nomes dos ficheiros, tipos, fundos…)
    utils.js             ← ferramentas (formatar euros, datas…)
    carteira.js          ← 🔒 os dados, protegidos por uma closure
    calculos.js          ← posições, totais, planos…
    graficos.js          ← cards, gráficos circulares, linhas, barras, mapa
    paginas/
      carteira.js        ← uma por página do menu (Carteira, Fundos, PPR…)
  artifacts/             ← protótipo, diagramas e documentação (não faz parte da app)
```

```html
<!-- index.html -->
<script type="module" src="js/main.js"></script>
```

## O que faz cada módulo

| Módulo             | Responsabilidade                                                       | Pode importar de                     |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------ |
| `constantes.js`    | valores fixos, que nunca mudam                                         | ninguém                              |
| `utils.js`         | ferramentas genéricas (servem para qualquer app)                       | ninguém                              |
| `carteira.js`      | carregar os dados, guardá-los no `localStorage` e protegê-los          | `constantes`                         |
| `calculos.js`      | contas a partir dos dados (não toca no HTML)                           | `constantes`, `utils`                |
| `graficos.js`      | peças visuais reutilizáveis (devolvem HTML em texto)                   | `utils`                              |
| `paginas/*.js`     | desenhar uma página: junta cálculos + gráficos                         | `calculos`, `graficos`, `utils`      |
| `main.js`          | arrancar a app e ouvir os eventos (cliques, formulários)               | todos                                |

As setas vão sempre no mesmo sentido: `main` → `paginas` → `calculos` / `graficos` → `utils` / `constantes`.
Nenhum módulo de baixo importa um de cima. Assim, cada peça pode ser testada e reutilizada sozinha.

## Como as peças falam entre si

1. A app arranca: o `main.js` pede à **carteira** os dados (do `localStorage` ou, na primeira vez, da pasta `data/`).
2. Clicas num botão do menu → o **evento** (no `main.js`) chama a função da **página**.
3. A página pede os dados à carteira, os **cálculos** fazem as contas e os **gráficos** mostram o resultado.
4. Guardas um registo → o `main.js` pede à carteira para o **adicionar** e volta a desenhar a página.

## A carteira: scope e closures (requisito 6)

- **Scope:** uma variável criada com `const` / `let` só existe dentro do bloco `{ }` onde nasceu.
- **Closure:** uma função criada dentro de outra continua a ver as variáveis de lá, mesmo depois de a de fora ter acabado.
- `criar_carteira()` guarda os `dados` num "cofre" privado. Só se lhes mexe pelos "botões" que ela devolve (`ler`, `adicionar`, `repor`), e esses botões guardam sempre no `localStorage`.

```js
export async function criar_carteira() {
  let dados = …;                                 // 🔒 privado: ninguém lhe chega de fora
  return {
    ler: (gaveta) => structuredClone(dados[gaveta]),   // devolve uma cópia (requisito 3)
    adicionar: (gaveta, registo) => { … },              // cria uma lista nova e guarda
    repor: async () => { … },                           // volta aos dados da pasta data/
  };
}
```

## Carregar os dados (requisito 7)

- **Primeira vez:** lê os 7 ficheiros da pasta `data/` ao mesmo tempo, com `Promise.all`, e junta-os num só objeto.
- **Depois:** lê do `localStorage` (chave `carteira_investimentos`), onde ficam também as mudanças feitas na app.
- **"Repor dados":** apaga as mudanças e volta a ler a pasta `data/`.
- Tudo dentro de `try/catch`: se um ficheiro falhar, a app mostra uma mensagem em vez de ficar em branco.

⚠️ O `fetch` não funciona se abrires o `index.html` com duplo clique (`file://`).
Para correr localmente, usa a extensão **Live Server** do VSCode (botão "Go Live").

## Ordem de trabalho (passo a passo)

1. ✅ Esqueleto: pastas, ficheiros, menu, carregar a base de dados.
2. Navegação: o menu mostra cada página (e marca a que está ativa).
3. Página **Carteira** (cards, gráficos circulares, mapa).
4. Páginas dos investimentos (ETF's, Cripto, REIT's, Ações, Fundos de investimento): tabela + cards, todas com a mesma função.
5. Formulários: Novo registo/compra, Registar rendibilidade, Registar venda.
6. Fundos, Depósitos a prazo, Dinheiro do governo, Mais-valias.
7. PPR e Ouro digital (planos).
8. Histórico de rendibilidade, Calendário, rodapé de notícias.
9. Responsivo (telemóvel), valores fictícios, README e GitHub Pages.
