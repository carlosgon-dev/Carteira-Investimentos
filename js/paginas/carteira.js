// Página "Carteira": onde está o dinheiro agora (fundos + investimentos).
// #region ==================== IMPORTS ====================
import {
  calcular_total_investido,
  encontrar_saldo_atual_fundo,
  agrupar_investido_por_posicao,
  agrupar_investido_por_origem,
} from "../calculadores.js";
import { desenhar_cartao, desenhar_painel, desenhar_grafico_circular } from "../graficos.js";
import { formatar_euro, calcular_percentagem, formatar_percentagem } from "../ferramentas.js";
import { NOMES_TIPOS } from "../constantes.js";
// #endregion

// #region ==================== PÁGINA ====================
export function desenhar_pagina_carteira(dados) {
  const gaveta_posicoes = dados.ler("posicoes");
  const gaveta_compras = dados.ler("compras");
  const gaveta_vendas = dados.ler("vendas");

  return `
    ${desenhar_painel_cartoes(dados, gaveta_posicoes, gaveta_compras, gaveta_vendas)}
    <div class="lado_a_lado">
      ${desenhar_painel_por_tipo(gaveta_posicoes, gaveta_compras, gaveta_vendas)}
      ${desenhar_painel_por_origem(gaveta_posicoes, gaveta_compras, gaveta_vendas)}
    </div>
  `;
}
// #endregion

// #region ==================== AUXILIARES DA PÁGINA ====================
// Os 4 cartões: Carteira (destaque) · Fundo de sobrevivência · Fundo de maneio · Investimentos
function desenhar_painel_cartoes(dados, gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const saldo_sobrevivencia = encontrar_saldo_atual_fundo(dados.ler("fundo_sobrevivencia"));
  const saldo_maneio = encontrar_saldo_atual_fundo(dados.ler("fundo_maneio"));
  const total_investido = calcular_total_investido(gaveta_posicoes, gaveta_compras, gaveta_vendas);
  const total_carteira = saldo_sobrevivencia + saldo_maneio + total_investido;

  // A legenda de cada cartão: que parte da carteira é este valor ("62,3 % da carteira")
  const legenda_da_carteira = (valor) => `${formatar_percentagem(calcular_percentagem(valor, total_carteira))} da carteira`;

  const html_cartoes = `
    <div class="fila_cartoes">
      ${desenhar_cartao({ titulo: "Carteira", valor: formatar_euro(total_carteira), estilo: "cartao_destaque" })}
      ${desenhar_cartao({ titulo: "Fundo de sobrevivência", valor: formatar_euro(saldo_sobrevivencia), legenda: legenda_da_carteira(saldo_sobrevivencia) })}
      ${desenhar_cartao({ titulo: "Fundo de maneio", valor: formatar_euro(saldo_maneio), legenda: legenda_da_carteira(saldo_maneio) })}
      ${desenhar_cartao({ titulo: "Investimentos", valor: formatar_euro(total_investido), legenda: legenda_da_carteira(total_investido) })}
    </div>
  `;

  return desenhar_painel({
    titulo: "Carteira",
    nota: "Fundo de sobrevivência + fundo de maneio + investimentos",
    conteudo: html_cartoes,
  });
}

// Gráfico: os investimentos por tipo (ETF's, Criptomoedas…), com o nome que aparece na app
function desenhar_painel_por_tipo(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const fatias = agrupar_investido_por_posicao(gaveta_posicoes, gaveta_compras, gaveta_vendas, "tipo");
  const fatias_com_nome = fatias.map((fatia) => ({ ...fatia, nome: NOMES_TIPOS[fatia.nome] ?? fatia.nome }));
  return desenhar_painel({ titulo: "Investimentos por tipo", conteudo: desenhar_grafico_circular(fatias_com_nome) });
}

// Gráfico: os investimentos por origem do dinheiro (Salário, Explicações…)
function desenhar_painel_por_origem(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const fatias = agrupar_investido_por_origem(gaveta_posicoes, gaveta_compras, gaveta_vendas);
  return desenhar_painel({ titulo: "Investimentos por origem", conteudo: desenhar_grafico_circular(fatias) });
}
// #endregion
