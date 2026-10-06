// Contas feitas a partir dos dados. Não tocam no HTML.
import { somar_lista_chave } from "./ferramentas.js";

// #region ==================== POSIÇÕES ====================
// Tudo o que pertence a uma posição (ex.: "pos-003")
export function filtrar_por_posicao(gaveta, id_posicao) {
  return gaveta.filter((objeto) => objeto.id_posicao === id_posicao);
}

// Aberta = tem compras e não foi vendida
export function verificar_posicao_aberta(objeto_posicao, gaveta_compras, gaveta_vendas) {
  const tem_compras = filtrar_por_posicao(gaveta_compras, objeto_posicao.id).length > 0;
  const foi_vendida = filtrar_por_posicao(gaveta_vendas, objeto_posicao.id).length > 0;
  return tem_compras && !foi_vendida;
}

// Só as compras das posições que ainda estão abertas (as das posições vendidas ficam de fora)
export function filtrar_compras_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const posicoes_abertas = gaveta_posicoes.filter((objeto_posicao) => verificar_posicao_aberta(objeto_posicao, gaveta_compras, gaveta_vendas));
  const ids_abertas = posicoes_abertas.map((objeto_posicao) => objeto_posicao.id);
  return gaveta_compras.filter((objeto_compra) => ids_abertas.includes(objeto_compra.id_posicao));
}

// Dinheiro posto nas posições que ainda estão abertas
export function calcular_total_investido(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const compras_abertas = filtrar_compras_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas);
  return somar_lista_chave(compras_abertas, "montante");
}
// #endregion

// #region ==================== GRÁFICOS CIRCULARES ====================
// O dinheiro investido por TIPO (etf, cripto…): [{ nome: "etf", valor: 3200 }, …], do maior para o menor
export function agrupar_investido_por_tipo(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const totais_por_tipo = {};
  for (const objeto_compra of filtrar_compras_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas)) {
    const objeto_posicao = gaveta_posicoes.find((posicao) => posicao.id === objeto_compra.id_posicao);
    const tipo = objeto_posicao.tipo;
    totais_por_tipo[tipo] = (totais_por_tipo[tipo] ?? 0) + objeto_compra.montante;
  }
  return transformar_em_fatias(totais_por_tipo);
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
