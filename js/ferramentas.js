// Ferramentas genéricas, que serviriam para qualquer app.

// 1234.5 → "1234,50 €"
export function formatar_euro(valor) {
  return valor.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

// "2026-09-30" → "30/09/2026"
export function formatar_data(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Soma um campo de todos os registos de uma lista: somar_campo(compras, "montante")
export function somar_campo(lista, campo) {
  return lista.reduce((total, registo) => total + registo[campo], 0);
}
