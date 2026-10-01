// Páginas dos investimentos: ETF's, Criptomoedas, REIT's, Ações e Fundos de investimento.
// São todas iguais (tabela + cartões), só muda o tipo. Por isso, uma função serve as 5.
import { NOMES_TIPOS } from "../constantes.js";

export function desenhar_investimento(dados, tipo) {
  return `
    <h2>${NOMES_TIPOS[tipo]}</h2>
  `;
}
