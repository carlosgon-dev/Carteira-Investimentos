// Página "Carteira": o resumo de tudo.
import { calcular_total_investido } from "../calculadores.js";
import { desenhar_cartao } from "../graficos.js";
import { formatar_euro } from "../ferramentas.js";

export function desenhar_carteira(dados) {
  const gaveta_posicoes = dados.ler("posicoes");
  const gaveta_compras = dados.ler("compras");
  const gaveta_vendas = dados.ler("vendas");
  const total_investido = calcular_total_investido(gaveta_posicoes, gaveta_compras, gaveta_vendas);

  return `
    <h2>Carteira</h2>
    ${desenhar_cartao({ titulo: "Investido", valor: formatar_euro(total_investido) })}
  `;
}
