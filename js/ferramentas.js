// Ferramentas genéricas, que serviriam para qualquer app.

// #region ==================== FORMATAR (EUROS E DATAS) ====================
// 1234.5 → "1234,50 €"
export function formatar_euro(valor) {
  return valor.toLocaleString("pt-PT", { style: "currency", currency: "EUR", useGrouping: "always" });
}

// Que parte do total é este valor, em %: (25, 200) → 12.5. Se o total for 0, dá 0 (não se divide por zero)
export function calcular_percentagem(valor, total) {
  if (total === 0) return 0;
  return (valor / total) * 100;
}

// 62.345 → "62,3 %"
export function formatar_percentagem(percentagem) {
  return `${percentagem.toLocaleString("pt-PT", { maximumFractionDigits: 1 })} %`;
}

// Põe um "+" à frente dos números positivos: ("48,90 €", 48.9) → "+48,90 €" (os negativos já trazem o "-")
export function acrescentar_sinal(texto, numero) {
  return numero > 0 ? `+${texto}` : texto;
}

// "2026-09-30" → "30/09/2026"
export function formatar_data(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
// #endregion

// #region ==================== DATAS E IDS ====================
// A data de hoje, no formato dos dados: "2026-10-02"
export function obter_data_hoje() {
  return new Date().toISOString().slice(0, 10);
}

// Quantos milissegundos tem um dia (as datas do JavaScript contam o tempo em milissegundos)
const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

// Há quantos dias foi esta data: "2026-09-30" (vista a 2026-10-06) → "há 6 dias"
export function descrever_dias_desde(data) {
  const dias = Math.floor((new Date(obter_data_hoje()) - new Date(data)) / MILISSEGUNDOS_POR_DIA);
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

// Quantos algarismos tem o número de um id ("sal-003" → 3)
const ALGARISMOS_ID = 3;

// O próximo id livre de uma gaveta: se lá estão "sal-001" e "sal-002" → "sal-003"
export function gerar_id(gaveta, prefixo) {
  const numeros_usados = gaveta.map((objeto) => Number(objeto.id.split("-")[1]));
  const maior_numero = Math.max(0, ...numeros_usados);
  const numero_novo = String(maior_numero + 1).padStart(ALGARISMOS_ID, "0");
  return `${prefixo}-${numero_novo}`;
}
// #endregion

// #region ==================== LISTAS E NÚMEROS ====================
// Cópia da lista ordenada pela chave "data", do mais recente para o mais antigo (a original não muda)
export function ordenar_mais_recente_primeiro(lista) {
  return [...lista].sort((objeto_a, objeto_b) => objeto_b.data.localeCompare(objeto_a.data));
}

// O objeto com a data mais recente de uma lista (ou undefined, se a lista estiver vazia)
export function obter_mais_recente(lista) {
  return ordenar_mais_recente_primeiro(lista)[0];
}

// A classe de cor de um número: 318 → "positivo" | -12 → "negativo" | 0 → "" (sem cor)
export function obter_classe_positivo_negativo(numero) {
  if (numero > 0) return "positivo";
  if (numero < 0) return "negativo";
  return "";
}

// Soma os valores de uma chave em todos os objetos da lista: somar_lista_chave(compras, "montante")
export function somar_lista_chave(lista, chave) {
  return lista.reduce((total, objeto) => total + objeto[chave], 0);
}
// #endregion
