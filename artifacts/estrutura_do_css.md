# Estrutura do CSS

Como os estilos da app estão organizados.
Feito a 1 de outubro de 2026.

## Os 3 ficheiros

Divididos pelo **papel**, não pela página (as páginas reutilizam as mesmas peças).

```
css/
  base.css          ← variáveis (:root), reset, letra e cores gerais
  layout.css        ← a "moldura": menu lateral + zona da página
  componentes.css   ← as peças: cartões, tabelas, botões, formulários, gráficos
```

| Ficheiro           | Pergunta a que responde              | Exemplo                       |
| ------------------ | ------------------------------------ | ----------------------------- |
| `base.css`         | Que cores e medidas usa a app?       | `--cor_destaque: #2563eb;`    |
| `layout.css`       | Onde fica cada zona do ecrã?         | menu à esquerda, página à direita |
| `componentes.css`  | Que aspeto tem cada peça?            | `.cartao`, `.tabela`          |

## Ordem no HTML

A ordem importa: o que vem depois pode usar (e ajustar) o que veio antes.

```html
<link rel="stylesheet" href="css/base.css" />
<link rel="stylesheet" href="css/layout.css" />
<link rel="stylesheet" href="css/componentes.css" />
```

## Regras

- **Cores e medidas só no `:root`** (`base.css`). Nos outros ficheiros usa-se `var(--cor_texto)`, nunca a cor escrita à mão.
- **Tamanhos em `rem`** (1rem = tamanho normal da letra).
- **Nomes em snake_case**, a dizer **o que a peça é**, não onde está: `.cartao`, e não `.cartao_etf`.
- **Uma peça, um sítio:** a tabela de ETF's e a de Cripto usam a mesma `.tabela`.
- Se um dia uma página precisar de algo só dela, cria-se um `paginas.css`. Para já não é preciso.

## Ligação ao JavaScript

O `graficos.js` desenha a peça (o HTML) e o `componentes.css` dá-lhe o aspeto.
Exemplo: `cartao("Investido", "6014,64 €")` cria um `<article class="cartao">`, e o estilo está em `.cartao`.
