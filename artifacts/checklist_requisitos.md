# Checklist dos requisitos

Cada requisito do enunciado, com os seus subtópicos, **onde está no código** e **como testar no site**.
Feito a 13 de outubro de 2026. Os números das linhas podem mudar um pouco se os ficheiros forem editados: o nome da função ajuda a encontrar.

## 1. Lógica e controlo de fluxo

**Teste no site:** ETF's → botões **[€ | %]** e **[Ativo | Área]**: as barras mudam e reordenam-se.

| Subtópico | Onde está |
| --------- | --------- |
| `if` / `else` | [eventos.js:112](../js/eventos.js#L112): `repor_linha_em_espera` (linha nova → remove; senão → repõe) |
| `if` com early return | [eventos.js:128](../js/eventos.js#L128) (`if (!botao) return`), [ferramentas.js:13](../js/ferramentas.js#L13) (`calcular_percentagem`: `if (total === 0) return 0`) |
| `switch` | [eventos.js:126](../js/eventos.js#L126) (pelo `data-acao`) e [eventos.js:317](../js/eventos.js#L317) (pelo `data-formulario`) |
| ternário (`? :`) | [ferramentas.js:21](../js/ferramentas.js#L21) (`acrescentar_sinal`), [graficos.js:205](../js/graficos.js#L205) (barra positiva ou negativa) |
| ciclo `for…of` | [calculadores.js:47](../js/calculadores.js#L47) (`agrupar_investido_e_rendibilidade_por_chave`), [graficos.js:144](../js/graficos.js#L144) (fatias do donut) |
| `forEach` | [main.js:68](../js/main.js#L68) (`marcar_botao_ativo`) |
| `map` | [calculadores.js:91](../js/calculadores.js#L91) (`transformar_em_fatias`) |
| `filter` | [calculadores.js:6](../js/calculadores.js#L6) (`filtrar_por_posicao`), [calculadores.js:14](../js/calculadores.js#L14) (`filtrar_posicoes_abertas`) |
| `reduce` | [ferramentas.js:72](../js/ferramentas.js#L72) (`somar_lista_chave`) |
| `find` / `sort` | [formularios.js:109](../js/paginas/formularios.js#L109) (`find`), [calculadores.js:92](../js/calculadores.js#L92) (`sort`, do maior para o menor) |

## 2. Dados simples

**Teste no site:** os valores aparecem como **1 234,56 €**, **12,3 %** e **30/09/2026**.

| Subtópico | Onde está |
| --------- | --------- |
| strings (template strings) | [ferramentas.js:17](../js/ferramentas.js#L17) (`formatar_percentagem`), todo o `graficos.js` |
| números (`Number`) | [eventos.js:288](../js/eventos.js#L288) (`ler_valor_campo`: `"2500"` → `2500`), [formularios.js:84](../js/paginas/formularios.js#L84) |
| booleanos | [calculadores.js:28](../js/calculadores.js#L28) (`tem_compras && !foi_vendida`) |
| moedas (€) | [ferramentas.js:10](../js/ferramentas.js#L10) (`formatar_euro`: `toLocaleString` com `currency: "EUR"`) |
| datas | [ferramentas.js:38](../js/ferramentas.js#L38) (`obter_data_hoje`), [ferramentas.js:42](../js/ferramentas.js#L42) (`escrever_ha_quantos_dias`, `new Date`) |

## 3. Dados complexos imutáveis

**Teste no site:** Fundos → **✎** num saldo → mudar → **✓**: aparece "✓ Alteração guardada".

| Subtópico | Onde está |
| --------- | --------- |
| adicionar sem alterar o original | [gestor_dados.js:27](../js/gestor_dados.js#L27) (`[...gaveta_antiga, novo_objeto]`) |
| apagar (`filter`) sem alterar | [gestor_dados.js:34](../js/gestor_dados.js#L34) |
| editar (`map` + `{ ...objeto }`) sem alterar | [gestor_dados.js:41](../js/gestor_dados.js#L41) |
| ordenar uma cópia | [ferramentas.js:58](../js/ferramentas.js#L58) (`[...lista].sort(…)`) |
| devolver cópias | [gestor_dados.js:23](../js/gestor_dados.js#L23) (`structuredClone`) |

## 4. DOM dinâmico

**Teste no site:** mudar de página no menu → o conteúdo muda **sem recarregar**.

| Subtópico | Onde está |
| --------- | --------- |
| `innerHTML` | [main.js:63](../js/main.js#L63) (`mostrar_pagina`: a página toda) |
| template strings (HTML) | [graficos.js](../js/graficos.js) (todas as peças, ex.: `desenhar_painel`) |
| `createElement` | [notificacoes.js:10](../js/notificacoes.js#L10) (o balão), [surpresa.js:29](../js/surpresa.js#L29) (o ecrã do vídeo) |
| `insertRow`, `outerHTML`, `textContent` | [eventos.js:186](../js/eventos.js#L186), [eventos.js:241](../js/eventos.js#L241), [notificacoes.js:12](../js/notificacoes.js#L12) |
| classes (`classList`) | [eventos.js:66](../js/eventos.js#L66) (menu ☰), [notificacoes.js:16](../js/notificacoes.js#L16) |

## 5. Reatividade e eventos

**Teste no site:** **✕** num saldo → fica **✓** → clicar **fora** → volta ao que era.

| Subtópico | Onde está |
| --------- | --------- |
| cliques | [eventos.js:35–37](../js/eventos.js#L35-L37) (menu, clique fora, botões) |
| inputs | [eventos.js:39](../js/eventos.js#L39) (`input` → rascunho) |
| formulários | [eventos.js:38](../js/eventos.js#L38) (`submit`) e a validação em [eventos.js:272](../js/eventos.js#L272) (`checkValidity`) |
| filtros | [eventos.js:126](../js/eventos.js#L126), `case "mudar_escolha"` (os botões [€ \| %] e [Ativo \| Área]) |

## 6. Scope e closures

**Teste no site:** não se vê no ecrã.

| Subtópico | Onde está |
| --------- | --------- |
| `const` / `let` | [eventos.js:19–25](../js/eventos.js#L19-L25) (`let`), constantes no topo de cada ficheiro |
| closure (encapsulamento) | [gestor_dados.js:15](../js/gestor_dados.js#L15) (`carregar_dados`) |
| proteger os dados | [gestor_dados.js:17](../js/gestor_dados.js#L17) (`let arquivo`, privado: só lá se chega pelas 5 funções devolvidas) |

## 7. Assincronismo

**Teste no site:** o rodapé mostra **"Ao vivo · hh:mm"** e os dados carregam ao abrir.

| Subtópico | Onde está |
| --------- | --------- |
| `fetch` | [gestor_dados.js:8](../js/gestor_dados.js#L8) (`dados.json`), [cotacoes.js:37](../js/cotacoes.js#L37) (APIs) |
| `async` / `await` | [gestor_dados.js:7](../js/gestor_dados.js#L7), [main.js:75](../js/main.js#L75) (`arrancar`) |
| `try` / `catch` | [main.js:76](../js/main.js#L76), [eventos.js:76](../js/eventos.js#L76) (Repor dados) |
| API pública | [cotacoes.js:27–31](../js/cotacoes.js#L27-L31) (`Promise.all` + `.then` + `.catch`) |
| Promise feita à mão | [ferramentas.js:32](../js/ferramentas.js#L32) (`esperar`: `new Promise`) |

## 8. Módulos

**Teste no site:** não se vê no ecrã.

| Subtópico | Onde está |
| --------- | --------- |
| `import` | [main.js:2–16](../js/main.js#L2-L16) |
| `export` | todas as funções partilhadas, ex.: [ferramentas.js:9](../js/ferramentas.js#L9) |
| ligação no HTML | [index.html](../index.html): `<script type="module" src="js/main.js">` |

## Persistência

**Teste no site:** fazer uma alteração → **F5** → continua lá.

| Subtópico | Onde está |
| --------- | --------- |
| `localStorage` | [gestor_dados.js:16](../js/gestor_dados.js#L16) (ler) e [gestor_dados.js:19](../js/gestor_dados.js#L19) (guardar) |
| `sessionStorage` | [main.js:61](../js/main.js#L61) (página aberta) e [formularios.js:15](../js/paginas/formularios.js#L15) (rascunhos) |

## Responsiva

**Teste no site:** no telemóvel (ou F12 → Ctrl+Shift+M), o menu **☰** funciona.

| Subtópico | Onde está |
| --------- | --------- |
| `@media` | [layout.css:152](../css/layout.css#L152) e [componentes.css:554](../css/componentes.css#L554) |

## Entrega

| ✔ | Critério do enunciado | Como confirmar |
| - | --------------------- | -------------- |
| ⬜ | Repositório público no GitHub | ao lado do nome do repositório diz **Public** |
| ⬜ | Valores fictícios | a Carteira mostra os valores do `data/dados.json` (fictícios) |
| ⬜ | Publicado no GitHub Pages | https://carlosgon-dev.github.io/Carteira-Investimentos/ abre e tem as últimas mudanças |
| ⬜ | README com descrição, link e como correr localmente | aparece no repositório, com as 3 secções |
