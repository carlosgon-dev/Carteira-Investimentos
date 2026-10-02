// Página "Fundos": fundo de sobrevivência e fundo de maneio.
import { desenhar_cartao, desenhar_painel } from "../graficos.js";
import { calcular_saldo_atual_fundo, calcular_total_fundos } from "../calculadores.js";
import { formatar_euro } from "../ferramentas.js";

export function desenhar_fundos(dados) {
  const gaveta_saldos_fundos = dados.ler("saldos_fundos");
  const saldo_sobrevivencia = calcular_saldo_atual_fundo(gaveta_saldos_fundos, "sobrevivencia");
  const saldo_maneio = calcular_saldo_atual_fundo(gaveta_saldos_fundos, "maneio");
  const total_fundos = calcular_total_fundos(gaveta_saldos_fundos);

  const html_cartoes = `
    <div class="fila_cartoes">
      ${desenhar_cartao({ titulo: "Total dos fundos", valor: formatar_euro(total_fundos), estilo: "cartao_destaque" })}
      ${desenhar_cartao({ titulo: "Fundo de sobrevivência", valor: formatar_euro(saldo_sobrevivencia) })}
      ${desenhar_cartao({ titulo: "Fundo de maneio", valor: formatar_euro(saldo_maneio) })}
    </div>
  `;

  return desenhar_painel({
    titulo: "Fundos",
    info: "Fundo de sobrevivência: a reserva para emergências. Fundo de maneio: o dinheiro na conta à ordem, pronto a usar.",
    nota: "O saldo mais recente de cada fundo é o que conta na Carteira",
    conteudo: html_cartoes,
  });
}
