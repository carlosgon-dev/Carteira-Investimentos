// Contas feitas a partir dos dados. Não tocam no HTML.
import { somar_lista_chave, obter_mais_recente } from "./ferramentas.js";

// #region ==================== FILTROS ====================
// Todos com o mesmo padrão: filtrar_ + o que fica + o critério. Devolvem uma lista nova (a gaveta não muda).

// Tudo o que pertence a uma posição (ex.: "pos-003"): as suas compras, rendibilidades ou vendas
export function filtrar_por_posicao(gaveta, id_posicao) {
  return gaveta.filter((objeto) => objeto.id_posicao === id_posicao);
}

// Só as posições de um tipo ("etf", "cripto"…)
export function filtrar_posicoes_por_tipo(gaveta_posicoes, tipo) {
  return gaveta_posicoes.filter((objeto_posicao) => objeto_posicao.tipo === tipo);
}

// Só as posições que ainda estão abertas (têm compras e não foram vendidas)
export function filtrar_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  return gaveta_posicoes.filter((objeto_posicao) => verificar_posicao_aberta(objeto_posicao, gaveta_compras, gaveta_vendas));
}

// Só as compras das posições que ainda estão abertas (as das posições vendidas ficam de fora)
export function filtrar_compras_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const posicoes_abertas = filtrar_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas);
  const ids_abertas = posicoes_abertas.map((objeto_posicao) => objeto_posicao.id);
  return gaveta_compras.filter((objeto_compra) => ids_abertas.includes(objeto_compra.id_posicao));
}
// #endregion

// #region ==================== POSIÇÕES ====================
// Aberta = tem compras e não foi vendida
export function verificar_posicao_aberta(objeto_posicao, gaveta_compras, gaveta_vendas) {
  const tem_compras = filtrar_por_posicao(gaveta_compras, objeto_posicao.id).length > 0;
  const foi_vendida = filtrar_por_posicao(gaveta_vendas, objeto_posicao.id).length > 0;
  return tem_compras && !foi_vendida;
}

// Dinheiro posto nas posições que ainda estão abertas
export function calcular_total_investido(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const compras_abertas = filtrar_compras_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas);
  return somar_lista_chave(compras_abertas, "montante");
}

// A rendibilidade mais recente de cada posição aberta (uma por posição; as posições sem registo ficam de fora)
export function obter_rendibilidades_atuais(gaveta_posicoes, gaveta_compras, gaveta_vendas, gaveta_rendibilidades) {
  const posicoes_abertas = filtrar_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas);
  const rendibilidades_mais_recentes = posicoes_abertas.map((objeto_posicao) => obter_mais_recente(filtrar_por_posicao(gaveta_rendibilidades, objeto_posicao.id)));
  return rendibilidades_mais_recentes.filter((objeto_rendibilidade) => objeto_rendibilidade !== undefined);
}
// #endregion

// #region ==================== GRÁFICOS CIRCULARES ====================
// O dinheiro investido agrupado por uma CHAVE DA POSIÇÃO, do maior para o menor:
//   chave "tipo" → por tipo (etf, cripto…) · "nome" → por ativo (S&P 500…) · "tema" → por tema (Mercado - USA…)
//   resultado: [{ nome: "etf", valor: 3200 }, …]
export function agrupar_investido_por_posicao(gaveta_posicoes, gaveta_compras, gaveta_vendas, chave) {
  const totais = {};
  for (const objeto_compra of filtrar_compras_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas)) {
    const objeto_posicao = gaveta_posicoes.find((posicao) => posicao.id === objeto_compra.id_posicao);
    const grupo = objeto_posicao[chave] || "Sem " + chave;
    totais[grupo] = (totais[grupo] ?? 0) + objeto_compra.montante;
  }
  return transformar_em_fatias(totais);
}

// O dinheiro investido por ORIGEM (Salário, Explicações…): [{ nome: "Salário", valor: 5100 }, …], do maior para o menor
export function agrupar_investido_por_origem(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const totais_por_origem = {};
  for (const objeto_compra of filtrar_compras_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas)) {
    const origem = objeto_compra.origem || "Sem origem";
    totais_por_origem[origem] = (totais_por_origem[origem] ?? 0) + objeto_compra.montante;
  }
  return transformar_em_fatias(totais_por_origem);
}

// { etf: 3200, cripto: 2850 } → [{ nome: "etf", valor: 3200 }, { nome: "cripto", valor: 2850 }], do maior para o menor
function transformar_em_fatias(totais) {
  const fatias = Object.entries(totais).map(([nome, valor]) => ({ nome, valor }));
  return fatias.sort((fatia_a, fatia_b) => fatia_b.valor - fatia_a.valor);
}
// #endregion

// #region ==================== FUNDOS ====================
// Saldo mais recente de um fundo (a gaveta de um dos fundos). No mesmo dia, conta o último inserido.
export function encontrar_saldo_atual_fundo(gaveta_fundo) {
  if (gaveta_fundo.length === 0) return 0; // fundo ainda sem registos

  const saldos_por_data = [...gaveta_fundo].sort((saldo_a, saldo_b) => saldo_a.data.localeCompare(saldo_b.data));
  const saldo_mais_recente = saldos_por_data.at(-1);
  return saldo_mais_recente.saldo;
}
// #endregion
