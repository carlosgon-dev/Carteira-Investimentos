// Página "Fundos": fundo de sobrevivência e fundo de maneio.
import { desenhar_cartao } from "../graficos.js";
import { calcular_saldo_atual_fundo, calcular_total_fundos } from "../calculadores.js";
import { formatar_euro } from "../ferramentas.js";


export function desenhar_fundos(dados) {

  const gaveta_saldos_fundos = dados.ler("saldos_fundos");                                    // 1. a gaveta
  const saldo_sobrevivencia = calcular_saldo_atual_fundo(gaveta_saldos_fundos, "sobrevivencia"); // 2. os saldos
  const saldo_maneio = calcular_saldo_atual_fundo(gaveta_saldos_fundos, "maneio");
  const total_fundos = calcular_total_fundos(gaveta_saldos_fundos);                           // 3. o total


  return `
    <h2>Fundos</h2>

    <section class="fila_cartoes">
      ${desenhar_cartao("Total dos fundos", formatar_euro(total_fundos), "cartao_destaque")}
      ${desenhar_cartao("Fundo de sobrevivência", formatar_euro(saldo_sobrevivencia))}
      ${desenhar_cartao("Fundo de maneio", formatar_euro(saldo_maneio))}
    </section>
  `;
}
