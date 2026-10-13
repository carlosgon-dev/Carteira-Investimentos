# Base de dados da Carteira de Investimentos

Estrutura dos dados da app e as decisões tomadas ao desenhá-la.
Atualizado a 12 de outubro de 2026. Os valores em `data/dados.json` são **fictícios**.

## Como funciona

O enunciado permite simular a base de dados com ficheiros JSON locais. Por isso:

- **`data/dados.json`**: os **dados iniciais**, carregados com `fetch` + `async/await` + `try/catch` (requisito 7).
- **`localStorage`** (chave `"carteira_investimentos"`): o estado atual, com tudo o que se acrescenta ou muda na app.
- **"Repor dados iniciais"** (menu): esquece as alterações e volta a ler o `dados.json`.

O `dados.json` **nunca muda** a partir da app (um site não pode escrever ficheiros). É o "ponto de partida"; o localStorage é a "base de dados" do dia a dia.

**Regra de ouro:** cada informação escreve-se **uma só vez**, num só sítio. O que pode ser calculado **não se guarda**.

## Convenções (valem para todas as gavetas)

| Regra                                                                | Exemplo                                          |
| -------------------------------------------------------------------- | ------------------------------------------------ |
| `id` único, com um prefixo que diz a gaveta                       | `pos-001`, `com-001`, `ren-001`            |
| Nomes das chaves sempre em**snake_case**                       | `id_posicao`, `nome_ativo`, `area_negocio` |
| Datas sempre como texto`"AAAA-MM-DD"`                              | `"2026-09-30"`                                 |
| Dinheiro sempre como número em euros (ponto nas décimas, sem "€") | `24.60`                                        |
| `null` quer dizer "ainda não se sabe"                             | juros de um depósito ainda ativo                |

Prefixos (`PREFIXOS_ID`, em `constantes.js`): `pos-` posições · `com-` compras · `ren-` rendibilidades · `ven-` vendas · `sal-` saldos dos fundos · `dep-` depósitos · `rec-` dinheiro do governo recebido · `uti-` utilizado · `eve-` eventos.
O número do id é sempre o maior que existe + 1, com 3 algarismos (`gerar_id`): apagar um registo nunca faz repetir ids.

## Nomenclatura no código: arquivo → gavetas → objetos

```
arquivo                         ← o dados.json inteiro (o conjunto de todas as gavetas)
 ├── gaveta_compras             ← uma lista
 │    ├── objeto_compra         ← um registo: { id: "com-001", montante: 400, … }
 │    └── objeto_compra
 ├── gaveta_posicoes
 │    └── objeto_posicao
 └── …
```

| Nível             | Nome no código                          | Exemplo                                               |
| ------------------ | ---------------------------------------- | ----------------------------------------------------- |
| O conjunto de tudo | `arquivo`                              | `let arquivo = …` (no `gestor_dados.js`)         |
| Uma lista          | `gaveta_…` (o texto: `nome_gaveta`) | `gaveta_compras`, `dados.ler("compras")`          |
| Uma lista filtrada | um nome que diga o filtro                | `posicoes_abertas`, `compras_de_posicoes_abertas` |
| Um registo         | `objeto_…`                            | `objeto_compra`, `objeto_posicao`                 |

## As gavetas (`data/dados.json`)

### 1. Investimentos (ETF's, Criptomoedas, REIT's, Ações, Fundos de investimento, Ouro digital)

Quatro gavetas, ligadas pelo `id_posicao`.

```
POSIÇÃO  (pos-006, Bitcoin, cripto, Blockchain)
   ├── compra   (id_posicao: pos-006, 300 €, 10/03)
   ├── compra   (id_posicao: pos-006, 200 €, 15/06)
   ├── rendib.  (id_posicao: pos-006, +215 €, 20/09)
   └── venda    (id_posicao: pos-006, recebi 600 €)  → a posição fecha
```

**`posicoes`**: um ativo que tens (ou tiveste)

| Chave            | Exemplo          | Para que serve                                                                                               |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `id`           | `"pos-006"`    | as outras gavetas ligam-se a ele                                                                             |
| `categoria`    | `"cripto"`     | `etf`, `cripto`, `reit`, `acoes`, `fundos`, `ouro` (o nome no ecrã vem de `NOMES_CATEGORIAS`) |
| `nome_ativo`   | `"Bitcoin"`    | o nome nas tabelas e no gráfico "Por ativo"                                                                 |
| `area_negocio` | `"Blockchain"` | o gráfico "Por área de negócio"                                                                           |

**`compras`**: `id` · `id_posicao` · `data` · `montante` · `origem` (`"Salário"`, `"Explicações"`, `"Juros bancários"`…)

**`rendibilidades`**: `id` · `id_posicao` · `data` · `valor` (em €, pode ser negativo).
Cada registo é uma **"fotografia" da posição inteira** nessa data (o ganho total que a corretora mostra). Por isso **conta só o mais recente** de cada posição; não se somam os registos.

**`vendas`**: `id` · `id_posicao` · `data` · `recebido` (vazia por agora: o formulário "Registar venda" fica para depois)

### 2. Fundos

**`fundo_sobrevivencia`** e **`fundo_maneio`**: uma gaveta para cada fundo, com `id` · `data` · `saldo`.
Conta o saldo mais recente de cada fundo (no mesmo dia, o último inserido): `encontrar_saldo_atual_fundo`.

### 3. Depósitos a prazo

**`depositos`**: `id` · `nome` · `montante` · `data` · `origem` · `prazo_meses` · `vencimento` · `juros` (`null` enquanto não vence)

### 4. Dinheiro do governo (o "pote")

**`governo_recebido`**: `id` · `data` · `descricao` · `valor`
**`governo_utilizado`**: `id` · `data` · `destino` · `valor`
As utilizações "PPR" **não** estão aqui: são geradas a partir do plano do PPR.

### 5. Planos (um objeto cada, não uma lista)

**`plano_ppr`**: `taxa` (`0.04` = 4 %) · `idade_inicial` · `estrategia` · `anos`, em que cada ano tem:

| Chave         | Exemplo                 | Para que serve                              |
| ------------- | ----------------------- | ------------------------------------------- |
| `ano`       | `2026`                |                                             |
| `governo`   | `1000`                | dinheiro do governo nesse ano (sai do pote) |
| `pessoal`   | `500`                 | dinheiro do salário                        |
| `real`      | `3620.00` ou `null` | quanto valia (escrito à mão)              |
| `real_data` | `"2026-09-30"`        | o dia em que se escreveu o valor real       |

**`plano_ouro`**: `taxa` · `anos` (`ano`, `previsto`, `cashback`, `real`, `real_data`)
As compras do cashback ficam nas gavetas dos investimentos, como uma posição de `categoria: "ouro"`.

### 6. Só de leitura

**`eventos_economia`**: `id` · `data` · `tipo` (`bce`, `fed`, `eua`, `irs`) · `titulo`
⚠️ As datas do BCE e da Fed têm de ser confirmadas nos sites oficiais.

## O que NÃO se guarda (é calculado)

| Calculado                                       | A partir de                                            | Função                                                          |
| ----------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Posição aberta ou fechada                     | tem compras**e** não tem venda                  | `verificar_posicao_aberta`                                      |
| Total investido                                 | soma das compras das posições abertas                | `calcular_total_investido`                                      |
| Rendibilidade atual                             | o registo mais recente de cada posição               | `obter_rendibilidades_atuais`                                   |
| Gráficos (por categoria, área, ativo, origem) | as compras das posições abertas                      | `agrupar_investido_por_chave`, `agrupar_investido_por_origem` |
| Saldo atual de cada fundo                       | o saldo mais recente                                   | `encontrar_saldo_atual_fundo`                                   |
| Mais-valia*(por fazer)*                       | `recebido` da venda − soma das compras da posição |                                                                   |
| Pote do governo por utilizar*(por fazer)*     | recebido − utilizado − dinheiro do governo do PPR    |                                                                   |

## Decisões debatidas

### Um ficheiro ou vários? → um só `dados.json`

Começámos com uma pasta `data/` com 7 ficheiros (um por capítulo, carregados com `Promise.all`). Juntámo-los num só `dados.json`: **um** `fetch`, **uma** chave no localStorage e o cofre trata de tudo da mesma maneira. O `Promise.all` continua a aparecer no rodapé das cotações (3 APIs).

### Por categoria ou por gaveta? → 4 gavetas principais

- **A, por categoria:** uma gaveta para cada categoria (ETF's, Cripto…), cada uma com posições, compras, rendibilidades e vendas.
- **B, por gaveta:** 4 gavetas principais, e cada posição diz a sua categoria. ✅ **Escolhida.**

Porquê a B: as páginas que juntam todas as categorias (Carteira, rodapé, histórico) ficam mais simples, e mudar um ativo de categoria é mudar um campo. Para ver uma categoria, faz-se `filter`:

```js
const posicoes_da_categoria = filtrar_posicoes_por_categoria(dados.ler("posicoes"), "cripto");
const compras_do_bitcoin = filtrar_por_posicao(dados.ler("compras"), "pos-006");
```

### Ligar pelo id da compra ou da posição? → da posição

Uma posição tem várias compras, mas a rendibilidade e a venda são da **posição inteira**. Por isso a gaveta `posicoes` liga tudo.
Voltar a comprar um ativo depois de o vender cria uma **posição nova**, que começa do zero (`encontrar_ou_criar_posicao` só procura entre as posições **abertas**).

### Guardar ou calcular "aberta" e as mais-valias? → calcular

Calcular é instantâneo. Guardar criaria dois sítios a dizer a mesma coisa: se uma compra fosse corrigida, o valor guardado ficava errado sem se dar conta.

```js
export function verificar_posicao_aberta(objeto_posicao, gaveta_compras, gaveta_vendas) {
  const tem_compras = filtrar_por_posicao(gaveta_compras, objeto_posicao.id).length > 0;
  const foi_vendida = filtrar_por_posicao(gaveta_vendas, objeto_posicao.id).length > 0;
  return tem_compras && !foi_vendida;
}
```

### Vendas parciais → ficam para depois

Por princípio, vende-se sempre a posição inteira. Para vendas parciais seria preciso um campo `investido` nas vendas (o custo da parte vendida) e um formulário que pergunte a "% vendida".

### Nota para pensar mais tarde: o cashback do Ouro

O cashback de cada ano fica escrito duas vezes: nas compras de ouro e na coluna "Cashback real" do plano. Mais tarde, o plano pode passar a calculá-lo a partir das compras.

## Ficheiro de exemplo

`artifacts/dados-exemplo.json` tem um exemplo pequeno de todas as gavetas, com a mesma estrutura do `data/dados.json`.
