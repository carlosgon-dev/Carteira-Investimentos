// Ferramentas genéricas, que serviriam para qualquer app.

// 1234.5 → "1234,50 €"
export function formatar_euro(valor) {
  return valor.toLocaleString("pt-PT", { style: "currency", currency: "EUR", useGrouping: "always" });
}

// "2026-09-30" → "30/09/2026"
export function formatar_data(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

// A classe de cor de um número: 318 → "positivo" | -12 → "negativo" | 0 → "" (sem cor)
export function obter_cor_valor(numero) {
  if (numero > 0) return "positivo";
  if (numero < 0) return "negativo";
  return "";
}

// Soma os valores de uma chave em todos os objetos da lista: somar_lista_chave(compras, "montante")
export function somar_lista_chave(lista, chave) {
  return lista.reduce((total, objeto) => total + objeto[chave], 0);
}
