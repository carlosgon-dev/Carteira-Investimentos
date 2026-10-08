// Ferramentas genéricas, que serviriam para qualquer app.
import { MILISSEGUNDOS_POR_DIA, ALGARISMOS_ID } from "./constantes.js";

// #region ==================== FORMATAR (EUROS E DATAS) ====================
export function formatar_euro(valor) {
  return valor.toLocaleString("pt-PT", { style: "currency", currency: "EUR", useGrouping: "always" });
}
export function calcular_percentagem(valor, total) {
  if (total === 0) return 0;
  return (valor / total) * 100;
}
export function formatar_percentagem(percentagem) {
  return `${percentagem.toLocaleString("pt-PT", { maximumFractionDigits: 1 })} %`;
}

export function acrescentar_sinal(texto, numero) {
  return numero > 0 ? `+${texto}` : texto;
}

export function formatar_data(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
// #endregion

// #region ==================== PAUSAS ====================
export function esperar(milissegundos) {
  return new Promise((resolver) => setTimeout(resolver, milissegundos));
}
// #endregion

// #region ==================== DATAS E IDS ====================
export function obter_data_hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function escrever_ha_quantos_dias(data) {
  const dias = Math.floor((new Date(obter_data_hoje()) - new Date(data)) / MILISSEGUNDOS_POR_DIA);
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

export function gerar_id(gaveta, prefixo) {
  const numeros_usados = gaveta.map((objeto) => Number(objeto.id.split("-")[1]));
  const maior_numero = Math.max(0, ...numeros_usados);
  const numero_novo = String(maior_numero + 1).padStart(ALGARISMOS_ID, "0");
  return `${prefixo}-${numero_novo}`;
}
// #endregion

// #region ==================== LISTAS E NÚMEROS ====================
export function ordenar_por_data_mais_recente(lista) {
  return [...lista].sort((objeto_a, objeto_b) => objeto_b.data.localeCompare(objeto_a.data));
}

export function obter_objeto_por_data_mais_recente(lista) {
  return ordenar_por_data_mais_recente(lista)[0];
}

export function obter_classe_cor_por_sinal(numero) {
  if (numero > 0) return "positivo";
  if (numero < 0) return "negativo";
  return "";
}

export function somar_lista_chave(lista, chave) {
  return lista.reduce((total, objeto) => total + objeto[chave], 0);
}
// #endregion
