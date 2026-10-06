// Páginas dos investimentos: ETF's, Criptomoedas, REIT's, Ações e Fundos de investimento.
// São todas iguais (cartões + tabela), só muda o tipo. Por isso, uma função serve as 5.
// #region ==================== IMPORTS ====================
import { NOMES_TIPOS } from "../constantes.js";
import {
  calcular_total_investido,
  filtrar_posicoes_por_tipo,
  obter_rendibilidades_atuais,
  agrupar_investido_por_posicao,
} from "../calculadores.js";
import { desenhar_cartao, desenhar_painel, desenhar_grafico_circular } from "../graficos.js";
import {
  formatar_euro,
  formatar_data,
  calcular_percentagem,
  formatar_percentagem,
  acrescentar_sinal,
  descrever_dias_desde,
  obter_mais_recente,
  somar_lista_chave,
  obter_classe_positivo_negativo,
} from "../ferramentas.js";
// #endregion

// #region ==================== PÁGINA ====================
export function desenhar_pagina_investimento(dados, tipo) {
  const gaveta_compras = dados.ler("compras");
  const gaveta_vendas = dados.ler("vendas");
  const posicoes_do_tipo = filtrar_posicoes_por_tipo(dados.ler("posicoes"), tipo);
  const rendibilidades_atuais = obter_rendibilidades_atuais(posicoes_do_tipo, gaveta_compras, gaveta_vendas, dados.ler("rendibilidades"));

  const painel_cartoes = desenhar_painel({
    titulo: NOMES_TIPOS[tipo],
    conteudo: desenhar_cartoes_investimento(posicoes_do_tipo, gaveta_compras, gaveta_vendas, rendibilidades_atuais),
  });

  return `
    ${painel_cartoes}
    <div class="lado_a_lado">
      ${desenhar_painel_grafico("Por ativo", posicoes_do_tipo, gaveta_compras, gaveta_vendas, "nome")}
      ${desenhar_painel_grafico("Por tema", posicoes_do_tipo, gaveta_compras, gaveta_vendas, "tema")}
    </div>
  `;
}
// #endregion

// #region ==================== AUXILIARES DA PÁGINA ====================
// Os 4 cartões: Valor atual (destaque) · Investido · Rendibilidade · Última atualização
function desenhar_cartoes_investimento(posicoes_do_tipo, gaveta_compras, gaveta_vendas, rendibilidades_atuais) {
  const total_investido = calcular_total_investido(posicoes_do_tipo, gaveta_compras, gaveta_vendas);
  const total_rendibilidade = somar_lista_chave(rendibilidades_atuais, "valor");
  const valor_atual = total_investido + total_rendibilidade;
  const percentagem_rendibilidade = calcular_percentagem(total_rendibilidade, total_investido);
  const rendibilidade_mais_recente = obter_mais_recente(rendibilidades_atuais);

  const texto_rendibilidade = acrescentar_sinal(formatar_euro(total_rendibilidade), total_rendibilidade);
  const texto_percentagem = acrescentar_sinal(formatar_percentagem(percentagem_rendibilidade), percentagem_rendibilidade);
  const texto_ultima_data = rendibilidade_mais_recente ? formatar_data(rendibilidade_mais_recente.data) : "—";
  const texto_ha_quantos_dias = rendibilidade_mais_recente ? descrever_dias_desde(rendibilidade_mais_recente.data) : "sem registos";

  return `
    <div class="fila_cartoes">
      ${desenhar_cartao({ titulo: "Valor atual", valor: formatar_euro(valor_atual), legenda: "Investido + rendibilidade", estilo: "cartao_destaque" })}
      ${desenhar_cartao({ titulo: "Investido", valor: formatar_euro(total_investido), legenda: "O que puseste" })}
      ${desenhar_cartao({ titulo: "Rendibilidade", valor: texto_rendibilidade, legenda: texto_percentagem, cor_valor: obter_classe_positivo_negativo(total_rendibilidade) })}
      ${desenhar_cartao({ titulo: "Última atualização", valor: texto_ultima_data, legenda: texto_ha_quantos_dias })}
    </div>
  `;
}

// Um painel com um gráfico circular do dinheiro investido, agrupado por uma chave da posição ("nome" ou "tema")
function desenhar_painel_grafico(titulo, posicoes_do_tipo, gaveta_compras, gaveta_vendas, chave) {
  const fatias = agrupar_investido_por_posicao(posicoes_do_tipo, gaveta_compras, gaveta_vendas, chave);
  return desenhar_painel({ titulo, conteudo: desenhar_grafico_circular(fatias) });
}
// #endregion
