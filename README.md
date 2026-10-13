# Carteira de Investimentos

Aplicação web para acompanhar uma carteira de finanças pessoais: **fundos** (sobrevivência e maneio) e **investimentos** (ETF's, criptomoedas, REIT's, ações, fundos de investimento e ouro digital), com gráficos, tabelas editáveis e um rodapé com cotações ao vivo.

Projeto final do módulo de JavaScript (UPskill), feito com **HTML5, CSS3 e JavaScript ES6+**, sem bibliotecas nem frameworks.

> Os valores em `data/dados.json` são **fictícios**.

## 🔗 Ver a app

**https://carlosgon-dev.github.io/Carteira-Investimentos/**

## O que a app faz

- **Carteira:** o total (fundos + investimentos), o peso de cada parte e 3 gráficos circulares: por categoria, por área de negócio e por origem do dinheiro.
- **Fundos:** o saldo atual de cada fundo e o histórico, com edição direta na tabela (✎ editar, ✕ apagar com confirmação, "+ Atualizar saldo").
- **Investimentos** (5 páginas com a mesma função): cartões com o valor atual e a rendibilidade, gráficos por ativo e por área de negócio, gráfico de barras da rendibilidade (por ativo ou área, em € ou %) e uma tabela que abre para mostrar as compras de cada posição.
- **Novo registo/compra:** formulário com validação, sugestões e rascunho automático (não se perde o que se escreveu se a página recarregar).
- **Rodapé ao vivo:** Bitcoin, Ethereum, ouro, EUR/USD e o índice "Medo & Ganância", de 3 APIs públicas, atualizados a cada minuto.
- **Responsiva:** no telemóvel, o menu passa a um botão ☰ e tudo se arruma numa coluna.
- **Modo escuro** automático, conforme as definições do sistema.

## Como correr localmente

A app carrega os dados com `fetch`, por isso **não funciona** se abrires o `index.html` com duplo clique (`file://`). É preciso um servidor local:

1. Clonar o repositório:
   ```
   git clone https://github.com/carlosgon-dev/Carteira-Investimentos.git
   ```
2. Abrir a pasta no **VSCode**.
3. Instalar a extensão **Live Server** (Ritwick Dey).
4. Abrir o `index.html` e carregar em **"Go Live"** (canto inferior direito). A app abre no browser.

## Estrutura do projeto

```
index.html          ← a única página HTML (SPA)
css/                ← base.css (cores), layout.css (moldura), componentes.css (peças)
data/dados.json     ← a base de dados inicial (valores fictícios)
js/
  main.js           ← arranque e navegação
  gestor_dados.js   ← os dados, protegidos por uma closure e guardados no localStorage
  eventos.js        ← os cliques e os formulários (5 ouvidos com delegação de eventos)
  calculadores.js   ← as contas
  graficos.js       ← as peças de desenho (painel, cartões, tabelas, gráficos)
  ferramentas.js    ← formatar euros, percentagens, datas…
  paginas/          ← uma função por página
artifacts/          ← documentação do projeto
```

Mais detalhes em `artifacts/`:
- `requisitos-do-enunciado.md`: onde a app cumpre cada requisito;
- `estrutura_do_javascript.md`: os módulos e como as peças falam entre si;
- `estrutura_do_css.md`: a organização dos estilos;
- `base-de-dados.md`: as gavetas do `dados.json` e as decisões tomadas.

## Conceitos de JavaScript usados

| Requisito | Na app |
| --------- | ------ |
| Lógica e controlo de fluxo | `switch`, ternários, *early return*, `map`/`filter`/`reduce`/`find`/`sort` |
| Dados simples | formatação de euros, percentagens e datas em pt-PT (`toLocaleString`) |
| Dados imutáveis | o gestor de dados cria sempre listas novas (`[...lista]`, `map`, `filter`) e devolve cópias (`structuredClone`) |
| DOM dinâmico | template strings, `createElement`, `insertRow` |
| Eventos | delegação de eventos com atributos `data-…` |
| Scope e closures | os dados ficam privados dentro de `carregar_dados()` |
| Assincronismo | `fetch` com `async/await` + `try/catch`, e com `.then` + `Promise.all` + `.catch` nas cotações |
| Módulos | ES modules (`import` / `export`) |
| Persistência | `localStorage` (dados) e `sessionStorage` (página aberta e rascunhos) |

## APIs públicas usadas

- [CoinGecko](https://www.coingecko.com/en/api): Bitcoin, Ethereum e ouro (PAX Gold), em euros;
- [Frankfurter](https://frankfurter.dev): câmbio EUR/USD;
- [alternative.me](https://alternative.me/crypto/fear-and-greed-index/): índice "Medo & Ganância" das criptomoedas.

Se alguma falhar, o rodapé mostra valores de exemplo, com a etiqueta "Exemplo".

## Autor

Carlos Gonçalves · [github.com/carlosgon-dev](https://github.com/carlosgon-dev)
