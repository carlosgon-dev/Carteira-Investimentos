# Base de dados da Carteira de Investimentos

Estrutura dos dados da app e as decisões tomadas ao desenhá-la.
Feito a 1 de outubro de 2026. Exemplo completo, com valores fictícios: `dados-exemplo.json`.

## Como funciona

O enunciado permite simular a base de dados com ficheiros JSON locais. Por isso:

- **Ficheiros JSON** (`data/`): os **dados iniciais**, carregados com `fetch` + `async/await` + `try/catch` (requisito 7).
- **`localStorage`**: tudo o que se acrescenta ou muda na app (persistência obrigatória).

**Regra de ouro:** cada informação escreve-se **uma só vez**, num só sítio. O que pode ser calculado **não se guarda**.

## Convenções (valem para todas as gavetas)

| Regra                                                                | Exemplo                               |
| -------------------------------------------------------------------- | ------------------------------------- |
| `id` único, com um prefixo que diz a gaveta                       | `pos-001`, `com-001`, `ren-001` |
| Nomes dos campos e dos ficheiros sempre em **snake_case** | `id_posicao`, `plano_ppr.json` |
| Datas sempre como texto`"AAAA-MM-DD"`                              | `"2026-09-30"`                      |
| Dinheiro sempre como número em euros (ponto nas décimas, sem "€") | `24.60`                             |
| `null` quer dizer "ainda não se sabe"                             | juros de um depósito ainda ativo     |

Prefixos: `pos-` posições · `com-` compras · `ren-` rendibilidades · `ven-` vendas · `sal-` saldos dos fundos · `dep-` depósitos · `rec-` dinheiro do governo recebido · `uti-` utilizado · `eve-` eventos.

## Nomenclatura no código: arquivo → gavetas → objetos

Os mesmos três nomes em todo o código JavaScript:

```
arquivo                         ← o dados.json inteiro (o conjunto de todas as gavetas)
 ├── gaveta_compras             ← uma lista
 │    ├── objeto_compra         ← um registo: { id: "com-001", montante: 400, … }
 │    └── objeto_compra
 ├── gaveta_vendas
 │    └── objeto_venda
 └── …
```

| Nível              | Nome no código                    | Exemplo                                   |
| ------------------ | --------------------------------- | ----------------------------------------- |
| O conjunto de tudo | `arquivo`                       | `let arquivo = …` (no `gestor_dados.js`) |
| Uma lista          | `gaveta_…` (o texto: `nome_gaveta`) | `gaveta_compras`, `dados.ler("compras")` |
| Um registo         | `objeto_…`                      | `objeto_compra`, `objeto_posicao`       |

## As gavetas

### 1. Investimentos (ETF's, Criptomoedas, REIT's, Ações, Fundos de investimento, Ouro digital)

Quatro gavetas, ligadas pelo `id_posicao`.

```
POSIÇÃO  (pos-003, Bitcoin, cripto, Blockchain)
   ├── compra   (id_posicao: pos-003, 300 €, 10/03)
   ├── compra   (id_posicao: pos-003, 200 €, 15/06)
   ├── rendib.  (id_posicao: pos-003, +215 €, 20/09)
   └── venda    (id_posicao: pos-003, recebi 600 €)  → a posição fecha
```

**`posicoes`**: um ativo que tens (ou tiveste)

| Campo    | Exemplo          | Para que serve                                                 |
| -------- | ---------------- | -------------------------------------------------------------- |
| `id`   | `"pos-003"`    | as outras gavetas ligam-se a ele                               |
| `tipo` | `"cripto"`     | `etf`, `cripto`, `reit`, `acoes`, `fundos`, `ouro` |
| `nome` | `"Bitcoin"`    | o nome nas tabelas                                             |
| `tema` | `"Blockchain"` | o "Tipo / tema" dos gráficos                                  |

**`compras`**: `id` · `id_posicao` · `data` · `montante` · `origem` (`"Salário"`, `"Explicações"`, `"Cashback"`…)

**`rendibilidades`**: `id` · `id_posicao` · `data` · `valor` (em €, pode ser negativo)

**`vendas`**: `id` · `id_posicao` · `data` · `recebido`

### 2. Fundos

**`saldos_fundos`**: `id` · `fundo` (`"sobrevivencia"` ou `"maneio"`) · `data` · `saldo`
Conta o saldo mais recente de cada fundo (no mesmo dia, o último inserido).

### 3. Depósitos a prazo

**`depositos`**: `id` · `nome` · `montante` · `data` · `origem` · `prazo_meses` · `vencimento` · `juros` (`null` enquanto não vence)

### 4. Dinheiro do governo (o "pote")

**`governo_recebido`**: `id` · `data` · `descricao` · `valor`
**`governo_utilizado`**: `id` · `data` · `destino` · `valor`
As utilizações "PPR" **não** estão aqui: são geradas a partir do plano do PPR.

### 5. Planos (um objeto cada, não uma lista)

**`plano_ppr`**: `taxa` (`0.04` = 4 %) · `idade_inicial` · `estrategia` · `anos`, em que cada ano tem:

| Campo        | Exemplo                 | Para que serve                             |
| ------------ | ----------------------- | ------------------------------------------ |
| `ano`      | `2026`                |                                            |
| `governo`  | `1000`                | dinheiro do governo nesse ano (sai do pote) |
| `pessoal`  | `500`                 | dinheiro do salário                       |
| `real`     | `3620.00` ou `null` | quanto valia (escrito com o ✎)            |
| `real_data` | `"2026-09-30"`        | o dia em que se escreveu o valor real      |

**`plano_ouro`**: `taxa` · `anos` (`ano`, `previsto`, `cashback`, `real`, `real_data`)
As compras do cashback ficam nas gavetas dos investimentos, como uma posição de `tipo: "ouro"`.

### 6. Só de leitura

**`eventos_economia`**: `id` · `data` · `tipo` (`bce`, `fed`, `eua`, `irs`) · `titulo`
⚠️ As datas do BCE e da Fed têm de ser confirmadas nos sites oficiais.

## O que NÃO se guarda (é calculado)

| Calculado                                                 | A partir de                                            |
| --------------------------------------------------------- | ------------------------------------------------------ |
| Posição aberta ou fechada                               | tem compras**e** não tem venda                  |
| Mais-valia                                                | `recebido` da venda − soma das compras da posição |
| Saldo atual de cada fundo                                 | o saldo mais recente                                   |
| Pote do governo por utilizar                               | recebido − utilizado − dinheiro do governo do PPR     |
| Compras e rendibilidade do PPR                            | o plano do PPR                                         |
| Rendibilidade do Ouro                                     | o plano do Ouro − as compras de ouro                  |
| Rendimentos                                               | juros dos depósitos + governo recebido + mais-valias   |
| Juros por ano, projeções, datas pessoais do calendário | as gavetas acima                                       |

## Decisões debatidas

### Por tipo ou por gaveta? → 4 gavetas principais

Comparámos duas organizações para os investimentos:

- **A, por tipo:** uma gaveta para cada tipo (ETF's, Cripto…), cada uma com posições, compras, rendibilidades e vendas.
- **B, por gaveta:** 4 gavetas principais, e cada registo diz o seu tipo. ✅ **Escolhida.**

Porquê a B: as páginas que juntam todos os tipos (Carteira, mapa, rodapé, histórico) ficam mais simples, o "Registar rendibilidade" do menu escreve numa só gaveta, e mudar um ativo de tipo é mudar um campo.
O receio da A (isolar um tipo para o poder mudar) também se resolve na B: em JSON, cada objeto pode ter os seus próprios campos. Se as Ações precisarem de `"dividendos"`, só as posições de Ações o têm.

Para ver um tipo, faz-se `filter`:

```js
// Tudo o que pertence a um tipo (ex.: "cripto")
function dados_do_tipo(dados, tipo) {
  const posicoes = dados.posicoes.filter((p) => p.tipo === tipo);
  const ids = posicoes.map((p) => p.id);
  const do_tipo = (lista) => lista.filter((x) => ids.includes(x.id_posicao));
  return { posicoes, compras: do_tipo(dados.compras), rendibilidades: do_tipo(dados.rendibilidades), vendas: do_tipo(dados.vendas) };
}
```

### Ligar pelo id da compra ou da posição? → da posição

Uma posição tem várias compras, mas a rendibilidade e a venda são da **posição inteira**. Por isso a gaveta `posicoes` liga tudo.
Voltar a comprar um ativo depois de o vender cria uma **posição nova**, que começa do zero (sem herdar rendibilidades antigas).

### Guardar ou calcular as mais-valias? → calcular

Calcular é instantâneo (mesmo com 1000 vendas, menos de 1 milissegundo).
Guardar cria dois sítios a dizer a mesma coisa: se uma compra for corrigida, a mais-valia guardada fica errada sem se dar conta. Calculada, corrige-se sozinha.
Se for preciso, calcula-se uma vez por cada vez que a página é desenhada e guarda-se numa variável (não na base de dados).

### Booleano "aberta": guardar ou calcular? → calcular

```js
function esta_aberta(dados, posicao) {
  const tem_compras = dados.compras.some((c) => c.id_posicao === posicao.id);
  const foi_vendida = dados.vendas.some((v) => v.id_posicao === posicao.id);
  return tem_compras && !foi_vendida;
}
```

| Compras | Venda | Estado                                                               |
| ------- | ----- | -------------------------------------------------------------------- |
| sim     | não  | aberta                                                               |
| sim     | sim   | fechada (vai para as Mais-valias)                                    |
| não    | não  | vazia (só se se apagarem todas as compras; a decidir no JavaScript) |

### Vendas parciais → ficam para depois

Por princípio, vende-se sempre a posição inteira. As vendas parciais complicam demasiado e ficam para um dia, tratadas à parte.
Nesse dia seria preciso: um campo `investido` nas vendas (o custo da parte vendida, que é diferente do `recebido`) e um formulário que pergunte a "% vendida".

### Nota para pensar mais tarde: o cashback do Ouro

O cashback de cada ano fica escrito duas vezes: nas compras de ouro e na coluna "Cashback real" do plano. Mais tarde, o plano pode passar a calculá-lo a partir das compras.

## Um ficheiro por capítulo (pasta `data/`, criada)

Em vez de um só `dados.json`, uma pasta `data/` com um ficheiro por capítulo. O que está ligado entre si fica no mesmo ficheiro.

```
data/                      ← a "base de dados"
  investimentos.json       ← posicoes + compras + rendibilidades + vendas (ligadas pelo id_posicao)
  fundos.json              ← saldos_fundos
  depositos.json           ← depositos
  governo.json             ← governo_recebido + governo_utilizado
  plano_ppr.json           ← plano_ppr
  plano_ouro.json          ← plano_ouro
  eventos_economia.json    ← eventos_economia (só leitura)
```

Carregam-se todos ao mesmo tempo, com `Promise.all` (requisito 7):

```js
async function carregar_base_de_dados() {
  try {
    const nomes = ["investimentos", "fundos", "depositos", "governo", "plano_ppr", "plano_ouro", "eventos_economia"];
    const ficheiros = await Promise.all(nomes.map((n) => fetch(`data/${n}.json`).then((r) => r.json())));
    // ficheiros[0] = investimentos, ficheiros[1] = fundos, …
  } catch (erro) {
    console.error("Não consegui carregar a base de dados", erro);
  }
}
```

Vantagens: ficheiros pequenos e isolados, um exemplo perfeito de `Promise.all`, e cada ficheiro pode ter a sua chave no `localStorage`.
Desvantagem: são 7 pedidos em vez de 1, mas carregam em milissegundos.
