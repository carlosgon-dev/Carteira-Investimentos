# Estrutura do CSS

Como os estilos da app estão organizados.
Atualizado a 12 de outubro de 2026.

## Os 3 ficheiros

Divididos pelo **papel**, não pela página (as páginas reutilizam as mesmas peças).

```
css/
  base.css          ← cores e medidas (:root), modo escuro, reset e títulos
  layout.css        ← a "moldura": grelha da app, menu lateral, zona da página, rodapé
  componentes.css   ← as peças: painel, cartões, tabelas, gráficos, botões, formulários…
```

| Ficheiro | Pergunta a que responde | Regiões |
| -------- | ----------------------- | ------- |
| `base.css` | Que cores e medidas usa a app? | CORES E MEDIDAS · MODO ESCURO · RESET, PÁGINA E TÍTULOS |
| `layout.css` | Onde fica cada zona do ecrã? | GRELHA DA APP · MENU LATERAL · TELEMÓVEL |
| `componentes.css` | Que aspeto tem cada peça? | PAINEL · INFO · CARTÕES · TABELA ACORDEÃO · GRÁFICO CIRCULAR · GRÁFICO DE BARRAS · ALTERNADOR · TABELAS · BOTÕES · CORES E MENSAGENS · SURPRESA · FORMULÁRIOS · NOTIFICAÇÃO FLUTUANTE · RODAPÉ DAS COTAÇÕES · TELEMÓVEL |

As regiões do `componentes.css` têm os **mesmos nomes** das peças do `graficos.js`: o JS desenha a peça (o HTML) e o CSS dá-lhe o aspeto.

## Ordem no HTML

A ordem importa: o que vem depois pode usar (e ajustar) o que veio antes.

```html
<link rel="stylesheet" href="css/base.css" />
<link rel="stylesheet" href="css/layout.css" />
<link rel="stylesheet" href="css/componentes.css" />
```

## Regras

- **Cores e medidas só no `:root`** (`base.css`). Nos outros ficheiros usa-se `var(--cor_texto)`, nunca a cor escrita à mão.
- **Os nomes das cores dizem o papel, não a cor** (`--cor_destaque`, `--cor_fundo`): no modo escuro a cor muda, o nome continua certo.
- **Tamanhos em `rem`**: no computador `1rem = 14px`; no telemóvel o `:root` passa a `12px` e tudo encolhe na mesma proporção.
- **Classes em snake_case**, a dizer **o que a peça é**: `.cartao`, `.painel`, `.tabela`.
- **Tags para o geral, classes para o específico**: `h1 { … }` no `base.css`; `.marca { … }` só para o título do menu.
- **Aninhamento (`&`)** só para estados e filhos do próprio elemento (`&:hover`, `&::after`, `& th`) e no máximo 2 níveis.
- **As regiões TELEMÓVEL (`@media (max-width: 600px)`) ficam no fim** de cada ficheiro, para ganharem às regras de cima.
- **Regiões dobráveis** em todos os ficheiros: `/* #region ===== NOME ===== */` … `/* #endregion */`.

## A grelha da app (`layout.css`)

```
computador                           telemóvel (até 600px)
┌────────┬──────────────┐            ┌──────────────┐
│ menu   │   página     │            │ menu (☰)     │
│        │              │            ├──────────────┤
├────────┴──────────────┤            │   página     │
│        rodapé         │            ├──────────────┤
└───────────────────────┘            │   rodapé     │
                                     └──────────────┘
```

O `body` é uma grid (`grid-template-areas`); no telemóvel muda-se só o desenho das áreas.

## Ligação ao JavaScript

**1. O JS escolhe a classe, o CSS decide o aspeto:**

| Classe | Quem a põe/tira | Efeito |
| ------ | --------------- | ------ |
| `ativo` | `main.js` (menu) e `graficos.js` (alternador) | botão escolhido, escuro |
| `aberto` | `eventos.js` (☰) | mostra o menu no telemóvel |
| `visivel` | `notificacoes.js` | o balão aparece e desaparece devagar (`transition`) |
| `a_confirmar` | `eventos.js` (✕) | o ✕ fica vermelho, à espera do 2.º clique |
| `positivo` / `negativo` | `obter_classe_cor_por_sinal` | verde / vermelho |

**2. O JS passa números ao CSS por variáveis:**

| Variável | Quem a escreve | Para quê |
| -------- | -------------- | -------- |
| `--grelha_colunas` | `desenhar_tabela_acordeao` | as colunas do acordeão, iguais em todas as linhas |
| `--ponto_zero` | `desenhar_linha_grafico_barras` | onde fica a linha fina do zero nas barras |

## Acessibilidade e preferências

- **Modo escuro automático:** `@media (prefers-color-scheme: dark)` no `base.css` redefine as cores.
- **Menos movimento:** `@media (prefers-reduced-motion: reduce)` para a faixa das cotações.
- **Foco visível no teclado:** `&:focus-visible` nos botões e campos.
