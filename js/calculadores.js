// Contas feitas a partir dos dados. Não tocam no HTML.
import { somar_campo } from "./ferramentas.js";

// Tudo o que pertence a uma posição (ex.: "pos-003")
export function filtrar_por_posicao(lista, id_posicao) {
  return lista.filter((registo) => registo.id_posicao === id_posicao);
}

// Aberta = tem compras e não foi vendida
export function verificar_posicao_aberta(posicao, gaveta_compras, gaveta_vendas) {
  const tem_compras = filtrar_por_posicao(gaveta_compras, posicao.id).length > 0;
  const foi_vendida = filtrar_por_posicao(gaveta_vendas, posicao.id).length > 0;
  return tem_compras && !foi_vendida;
}

// Dinheiro posto nas posições que ainda estão abertas
export function calcular_total_investido(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const posicoes_abertas = gaveta_posicoes.filter((objeto_posicao) => verificar_posicao_aberta(objeto_posicao, gaveta_compras, gaveta_vendas));
  const ids_abertas = posicoes_abertas.map((objeto_posicao) => objeto_posicao.id);
  const compras_abertas = gaveta_compras.filter((objeto_compra) => ids_abertas.includes(objeto_compra.id_posicao));
  return somar_campo(compras_abertas, "montante");
}
