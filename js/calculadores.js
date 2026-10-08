// Contas feitas a partir dos dados. Não tocam no HTML.
import { somar_lista_chave, obter_objeto_por_data_mais_recente } from "./ferramentas.js";

// #region ==================== FILTROS ====================

export function filtrar_por_posicao(gaveta, id_posicao) {
  return gaveta.filter((objeto) => objeto.id_posicao === id_posicao);
}

export function filtrar_posicoes_por_categoria(gaveta_posicoes, categoria) {
  return gaveta_posicoes.filter((objeto_posicao) => objeto_posicao.categoria === categoria);
}

export function filtrar_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  return gaveta_posicoes.filter((objeto_posicao) => verificar_posicao_aberta(objeto_posicao, gaveta_compras, gaveta_vendas));
}

export function filtrar_compras_de_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const posicoes_abertas = filtrar_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas);
  const ids_abertas = posicoes_abertas.map((objeto_posicao) => objeto_posicao.id);
  return gaveta_compras.filter((objeto_compra) => ids_abertas.includes(objeto_compra.id_posicao));
}
// #endregion

// #region ==================== POSIÇÕES ====================
export function verificar_posicao_aberta(objeto_posicao, gaveta_compras, gaveta_vendas) {
  const tem_compras = filtrar_por_posicao(gaveta_compras, objeto_posicao.id).length > 0;
  const foi_vendida = filtrar_por_posicao(gaveta_vendas, objeto_posicao.id).length > 0;
  return tem_compras && !foi_vendida;
}

export function calcular_total_investido(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const compras_de_posicoes_abertas = filtrar_compras_de_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas);
  return somar_lista_chave(compras_de_posicoes_abertas, "montante");
}

export function obter_rendibilidades_atuais(gaveta_posicoes, gaveta_compras, gaveta_vendas, gaveta_rendibilidades) {
  const posicoes_abertas = filtrar_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas);
  const rendibilidades_mais_recentes = posicoes_abertas.map((objeto_posicao) => {
    const rendibilidades_da_posicao = filtrar_por_posicao(gaveta_rendibilidades, objeto_posicao.id);
    return obter_objeto_por_data_mais_recente(rendibilidades_da_posicao);
  });
  return rendibilidades_mais_recentes.filter((objeto_rendibilidade) => objeto_rendibilidade !== undefined); // → [{ id: "ren-004", id_posicao: "pos-001", data: "2026-09-28", valor: 162.9 }, …]
}

export function agrupar_investido_e_rendibilidade_por_chave(gaveta_posicoes, gaveta_compras, gaveta_vendas, gaveta_rendibilidades, chave) {
  const grupos = {};
  for (const objeto_posicao of filtrar_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas)) {
    const nome_grupo = objeto_posicao[chave] || "Sem " + chave;
    const grupo = grupos[nome_grupo] ?? { nome: nome_grupo, investido: 0, rendibilidade: null };
    const investido_e_rendibilidade = calcular_investido_e_rendibilidade_por_posicao(objeto_posicao, gaveta_compras, gaveta_rendibilidades);

    grupo.investido += investido_e_rendibilidade.investido;
    if (investido_e_rendibilidade.rendibilidade !== null) grupo.rendibilidade = (grupo.rendibilidade ?? 0) + investido_e_rendibilidade.rendibilidade;

    grupos[nome_grupo] = grupo;
  }
  return Object.values(grupos); // → [{ nome: "Mercado - Global", investido: 720, rendibilidade: 96.5 }, …]
}

export function calcular_investido_e_rendibilidade_por_posicao(objeto_posicao, gaveta_compras, gaveta_rendibilidades) {
  const investido = somar_lista_chave(filtrar_por_posicao(gaveta_compras, objeto_posicao.id), "montante");
  const rendibilidade_mais_recente = obter_objeto_por_data_mais_recente(filtrar_por_posicao(gaveta_rendibilidades, objeto_posicao.id));
  const rendibilidade = rendibilidade_mais_recente ? rendibilidade_mais_recente.valor : null;
  return { investido, rendibilidade }; // → { investido: 1580.25, rendibilidade: 162.9 }  (rendibilidade null = sem registo)
}
// #endregion

// #region ==================== GRÁFICOS CIRCULARES ====================

export function agrupar_investido_por_chave(gaveta_posicoes, gaveta_compras, gaveta_vendas, chave) {
  const totais_por_grupo = {};
  for (const objeto_compra of filtrar_compras_de_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas)) {
    const objeto_posicao = gaveta_posicoes.find((posicao) => posicao.id === objeto_compra.id_posicao);
    const grupo = objeto_posicao[chave] || "Sem " + chave;
    totais_por_grupo[grupo] = (totais_por_grupo[grupo] ?? 0) + objeto_compra.montante;
  }

  return transformar_em_fatias(totais_por_grupo);  //   resultado: [{ nome: "etf", valor: 3200 }, …]
}

export function agrupar_investido_por_origem(gaveta_posicoes, gaveta_compras, gaveta_vendas) {
  const totais_por_origem = {};
  for (const objeto_compra of filtrar_compras_de_posicoes_abertas(gaveta_posicoes, gaveta_compras, gaveta_vendas)) {
    const origem = objeto_compra.origem || "Sem origem";
    totais_por_origem[origem] = (totais_por_origem[origem] ?? 0) + objeto_compra.montante;
  }
  return transformar_em_fatias(totais_por_origem); // [{ nome: "Salário", valor: 5100 }, …]
}

function transformar_em_fatias(totais_por_grupo) {
  const fatias = Object.entries(totais_por_grupo).map(([nome, valor]) => ({ nome, valor }));
  return fatias.sort((fatia_a, fatia_b) => fatia_b.valor - fatia_a.valor); 
  // { etf: 3200, cripto: 2850 } → [{ nome: "etf", valor: 3200 }, { nome: "cripto", valor: 2850 }], do maior para o menor
}
// #endregion

// #region ==================== FUNDOS ====================
export function encontrar_saldo_atual_fundo(gaveta_fundo) {
  if (gaveta_fundo.length === 0) return 0;

  const saldos_por_data = [...gaveta_fundo].sort((saldo_a, saldo_b) => saldo_a.data.localeCompare(saldo_b.data));
  const saldo_mais_recente = saldos_por_data.at(-1);
  return saldo_mais_recente.saldo;
}
// #endregion
