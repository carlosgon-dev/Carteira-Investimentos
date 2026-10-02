// Contas feitas a partir dos dados. Não tocam no HTML.
import { somar_lista_chave } from "./ferramentas.js";

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

// Dinheiro posto nas posições que ainda estão abertas
export function calcular_total_investido(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const posicoes_abertas = gaveta_posicoes.filter((objeto_posicao) => verificar_posicao_aberta(objeto_posicao, gaveta_compras, gaveta_vendas));
  const ids_abertas = posicoes_abertas.map((objeto_posicao) => objeto_posicao.id);
  const compras_abertas = gaveta_compras.filter((objeto_compra) => ids_abertas.includes(objeto_compra.id_posicao));
  return somar_lista_chave(compras_abertas, "montante");
}

// Saldo mais recente de um fundo (a gaveta de um dos fundos). No mesmo dia, conta o último inserido.
export function encontrar_saldo_atual_fundo(gaveta_fundo) {
  if (gaveta_fundo.length === 0) return 0; // fundo ainda sem registos

  const saldos_por_data = [...gaveta_fundo].sort((saldo_a, saldo_b) => saldo_a.data.localeCompare(saldo_b.data));
  const saldo_mais_recente = saldos_por_data.at(-1);
  return saldo_mais_recente.saldo;
}