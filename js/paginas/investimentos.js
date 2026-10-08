// Páginas dos investimentos: ETF's, Criptomoedas, REIT's, Ações e Fundos de investimento.
// São todas iguais (cartões + tabela), só muda a categoria. Por isso, uma função serve as 5.
// #region ==================== IMPORTS ====================
import { NOMES_CATEGORIAS } from "../constantes.js";
import {
  calcular_total_investido,
  filtrar_posicoes_por_categoria,
  obter_rendibilidades_atuais,
  agrupar_investido_por_chave,
  agrupar_investido_e_rendibilidade_por_chave,
  filtrar_posicoes_abertas,
  filtrar_por_posicao,
  calcular_investido_e_rendibilidade_por_posicao,
} from "../calculadores.js";
import {
  desenhar_cartao,
  desenhar_painel,
  desenhar_grafico_circular,
  desenhar_grafico_barras,
  desenhar_alternador,
  desenhar_tabela,
  desenhar_tabela_acordeao,
  desenhar_botoes_linha,
  desenhar_botao_abrir_pagina,
} from "../graficos.js";
import {
  formatar_euro,
  formatar_data,
  calcular_percentagem,
  formatar_percentagem,
  acrescentar_sinal,
  escrever_ha_quantos_dias,
  obter_objeto_por_data_mais_recente,
  somar_lista_chave,
  obter_classe_cor_por_sinal,
  ordenar_por_data_mais_recente,
} from "../ferramentas.js";
// #endregion

// #region ==================== COLUNAS DA TABELA ====================
// As colunas da tabela das posições (só leitura: estes valores são calculados)
const COLUNAS_POSICOES = [
  { titulo: "Nome" },
  { titulo: "Área de negócio" },
  { titulo: "Investido", numero: true },
  { titulo: "Rendibilidade", numero: true },
  { titulo: "%", numero: true },
  { titulo: "Valor atual", numero: true },
];

// As colunas da tabela das compras (dentro de cada posição). Estas editam-se com o ✎, como nos Fundos.
const COLUNAS_COMPRAS = [
  { titulo: "Data", campo_editavel: "data", tipo_campo: "date", maximo: "hoje" },
  { titulo: "Montante", campo_editavel: "montante", tipo_campo: "number", minimo: 0, numero: true },
  { titulo: "Origem", campo_editavel: "origem", tipo_campo: "text" },
  { titulo: "" },
];
// #endregion

// #region ==================== ESCOLHAS DO GRÁFICO DE BARRAS ====================
//   agrupar_por: "nome_ativo" (por ativo) ou "area_negocio" · mostrar_em: "euros" ou "percentagem"

// O ponto de partida, quando a app abre: por ativo e em euros (fixo, nunca muda)
const ESCOLHAS_INICIAIS_GRAFICO_BARRAS = { agrupar_por: "nome_ativo", mostrar_em: "euros" };

// As escolhas de agora: começam nas iniciais e mudam com os cliques nos botões (enquanto a app está aberta)
let escolhas_grafico_barras = { ...ESCOLHAS_INICIAIS_GRAFICO_BARRAS };

// Muda uma das escolhas (o eventos.js chama isto quando se clica num botão do alternador)
export function guardar_escolha_grafico_barras(nome_escolha, valor) {
  escolhas_grafico_barras = { ...escolhas_grafico_barras, [nome_escolha]: valor };
}
// #endregion

// #region ==================== PÁGINA ====================
export function desenhar_pagina_investimento(dados, categoria) {
  const gaveta_compras = dados.ler("compras");
  const gaveta_vendas = dados.ler("vendas");
  const gaveta_rendibilidades = dados.ler("rendibilidades");
  const posicoes_da_categoria = filtrar_posicoes_por_categoria(dados.ler("posicoes"), categoria);
  const rendibilidades_atuais = obter_rendibilidades_atuais(posicoes_da_categoria, gaveta_compras, gaveta_vendas, gaveta_rendibilidades);

  const painel_cartoes = desenhar_painel({
    titulo: NOMES_CATEGORIAS[categoria],
    conteudo: desenhar_cartoes_investimento(posicoes_da_categoria, gaveta_compras, gaveta_vendas, rendibilidades_atuais),
  });

  return `
    ${painel_cartoes}
    <div class="lado_a_lado">
      ${desenhar_painel_grafico("Por ativo", posicoes_da_categoria, gaveta_compras, gaveta_vendas, "nome_ativo")}
      ${desenhar_painel_grafico("Por área de negócio", posicoes_da_categoria, gaveta_compras, gaveta_vendas, "area_negocio")}
    </div>
    ${desenhar_painel_barras(posicoes_da_categoria, gaveta_compras, gaveta_vendas, gaveta_rendibilidades)}
    ${desenhar_painel_posicoes(posicoes_da_categoria, gaveta_compras, gaveta_vendas, gaveta_rendibilidades)}
  `;
}
// #endregion

// #region ==================== AUXILIARES DA PÁGINA ====================
// Os 4 cartões: Valor atual (destaque) · Investido · Rendibilidade · Última atualização
function desenhar_cartoes_investimento(posicoes_da_categoria, gaveta_compras, gaveta_vendas, rendibilidades_atuais) {
  const total_investido = calcular_total_investido(posicoes_da_categoria, gaveta_compras, gaveta_vendas);
  const total_rendibilidade = somar_lista_chave(rendibilidades_atuais, "valor");
  const valor_atual = total_investido + total_rendibilidade;
  const percentagem_rendibilidade = calcular_percentagem(total_rendibilidade, total_investido);
  const rendibilidade_mais_recente = obter_objeto_por_data_mais_recente(rendibilidades_atuais);

  const texto_rendibilidade = acrescentar_sinal(formatar_euro(total_rendibilidade), total_rendibilidade);
  const texto_percentagem = acrescentar_sinal(formatar_percentagem(percentagem_rendibilidade), percentagem_rendibilidade);
  const texto_ultima_data = rendibilidade_mais_recente ? formatar_data(rendibilidade_mais_recente.data) : "—";
  const texto_ha_quantos_dias = rendibilidade_mais_recente ? escrever_ha_quantos_dias(rendibilidade_mais_recente.data) : "sem registos";

  return `
    <div class="fila_cartoes">
      ${desenhar_cartao({ titulo: "Valor atual", valor: formatar_euro(valor_atual), legenda: "Investido + rendibilidade", estilo: "cartao_destaque" })}
      ${desenhar_cartao({ titulo: "Investido", valor: formatar_euro(total_investido), legenda: "O que puseste" })}
      ${desenhar_cartao({ titulo: "Rendibilidade", valor: texto_rendibilidade, legenda: texto_percentagem, cor_valor: obter_classe_cor_por_sinal(total_rendibilidade) })}
      ${desenhar_cartao({ titulo: "Última atualização", valor: texto_ultima_data, legenda: texto_ha_quantos_dias })}
    </div>
  `;
}

// Um painel com um gráfico circular do dinheiro investido, agrupado por uma chave da posição ("nome_ativo" ou "area_negocio")
function desenhar_painel_grafico(titulo, posicoes_da_categoria, gaveta_compras, gaveta_vendas, chave) {
  const fatias = agrupar_investido_por_chave(posicoes_da_categoria, gaveta_compras, gaveta_vendas, chave);
  return desenhar_painel({ titulo, conteudo: desenhar_grafico_circular(fatias) });
}

// O painel das barras: a rendibilidade por ativo ou por área de negócio, em € ou em % (conforme as escolhas feitas nos botões)
function desenhar_painel_barras(posicoes_da_categoria, gaveta_compras, gaveta_vendas, gaveta_rendibilidades) {
  const grupos = agrupar_investido_e_rendibilidade_por_chave(posicoes_da_categoria, gaveta_compras, gaveta_vendas, gaveta_rendibilidades, escolhas_grafico_barras.agrupar_por);
  const barras = grupos.map(transformar_grupo_em_barra);
  const barras_ordenadas = barras.sort((barra_a, barra_b) => (barra_b.valor ?? -Infinity) - (barra_a.valor ?? -Infinity)); // sem registo: no fim
  return desenhar_painel({ titulo: "Rendibilidade", acoes: desenhar_botoes_escolhas_grafico_barras(), conteudo: desenhar_grafico_barras(barras_ordenadas) });
}

// Um grupo → uma barra: o valor (em € ou em %) e o texto já formatado, com sinal
function transformar_grupo_em_barra(grupo) {
  if (grupo.rendibilidade === null) return { nome: grupo.nome, valor: null, texto: "—" };
  const em_percentagem = escolhas_grafico_barras.mostrar_em === "percentagem";
  const valor = em_percentagem ? calcular_percentagem(grupo.rendibilidade, grupo.investido) : grupo.rendibilidade;
  const texto_sem_sinal = em_percentagem ? formatar_percentagem(valor) : formatar_euro(valor);
  return { nome: grupo.nome, valor, texto: acrescentar_sinal(texto_sem_sinal, valor) };
}

// Os 2 alternadores do painel: [Ativo | Área] e [€ | %]
function desenhar_botoes_escolhas_grafico_barras() {
  const alternador_grupo = desenhar_alternador({
    nome_escolha: "agrupar_por",
    opcoes: [{ valor: "nome_ativo", texto: "Ativo" }, { valor: "area_negocio", texto: "Área" }],
    escolhido: escolhas_grafico_barras.agrupar_por,
  });
  const alternador_unidade = desenhar_alternador({
    nome_escolha: "mostrar_em",
    opcoes: [{ valor: "euros", texto: "€" }, { valor: "percentagem", texto: "%" }],
    escolhido: escolhas_grafico_barras.mostrar_em,
  });
  return alternador_grupo + alternador_unidade;
}

// O painel da tabela: uma linha por posição aberta, da que tem mais dinheiro investido para a que tem menos
function desenhar_painel_posicoes(posicoes_da_categoria, gaveta_compras, gaveta_vendas, gaveta_rendibilidades) {
  const posicoes_abertas = filtrar_posicoes_abertas(posicoes_da_categoria, gaveta_compras, gaveta_vendas);
  const posicoes_com_investido_e_rendibilidade = posicoes_abertas.map((objeto_posicao) => ({
    ...objeto_posicao,
    ...calcular_investido_e_rendibilidade_por_posicao(objeto_posicao, gaveta_compras, gaveta_rendibilidades),
  }));
  const posicoes_ordenadas = posicoes_com_investido_e_rendibilidade.sort((posicao_a, posicao_b) => posicao_b.investido - posicao_a.investido);

  // Cada posição → uma linha que abre: em cima, os valores da posição; ao abrir, a tabela das suas compras
  const linhas_posicoes = posicoes_ordenadas.map((posicao) => ({
    celulas: transformar_posicao_em_linha(posicao),
    conteudo_aberto: desenhar_tabela_compras(posicao, gaveta_compras),
  }));
  const html_tabela = desenhar_tabela_acordeao({ colunas_cabecalho: COLUNAS_POSICOES, linhas_conteudo: linhas_posicoes });
  const html_botoes = `
    ${desenhar_botao_abrir_pagina("novo_registo", "+ Novo registo/compra")}
    ${desenhar_botao_abrir_pagina("registar_rendibilidade", "+ Registar rendibilidade")}
    ${desenhar_botao_abrir_pagina("registar_venda", "+ Registar venda")}
  `;
  return desenhar_painel({ titulo: "Posições", acoes: html_botoes, conteudo: html_tabela });
}

// Uma posição → uma linha da tabela (as células pela ordem das colunas). Sem registo de rendibilidade: "—"
function transformar_posicao_em_linha(posicao) {
  const tem_rendibilidade = posicao.rendibilidade !== null;
  const rendibilidade = posicao.rendibilidade ?? 0;
  const percentagem = calcular_percentagem(rendibilidade, posicao.investido);
  const classe_cor = obter_classe_cor_por_sinal(rendibilidade);
  const texto_rendibilidade = acrescentar_sinal(formatar_euro(rendibilidade), rendibilidade);
  const texto_percentagem = acrescentar_sinal(formatar_percentagem(percentagem), percentagem);
  const celula_rendibilidade = tem_rendibilidade ? `<span class="${classe_cor}">${texto_rendibilidade}</span>` : "—";
  const celula_percentagem = tem_rendibilidade ? `<span class="${classe_cor}">${texto_percentagem}</span>` : "—";

  return [
    posicao.nome_ativo,
    posicao.area_negocio,
    formatar_euro(posicao.investido),
    celula_rendibilidade,
    celula_percentagem,
    formatar_euro(posicao.investido + rendibilidade),
  ];
}

// A tabela das compras de uma posição (aparece ao abrir a linha), da mais recente para a mais antiga.
// Cada compra tem ✎ ✕, como os saldos dos Fundos: as compras são objetos da gaveta "compras".
function desenhar_tabela_compras(posicao, gaveta_compras) {
  const compras_da_posicao = ordenar_por_data_mais_recente(filtrar_por_posicao(gaveta_compras, posicao.id));
  const linhas_compras = compras_da_posicao.map((objeto_compra) => [
    formatar_data(objeto_compra.data),
    formatar_euro(objeto_compra.montante),
    objeto_compra.origem || "—",
    desenhar_botoes_linha("compras", objeto_compra.id),
  ]);
  return desenhar_tabela({ colunas_cabecalho: COLUNAS_COMPRAS, linhas_conteudo: linhas_compras });
}
// #endregion
