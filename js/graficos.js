import { formatar_euro, calcular_percentagem, formatar_percentagem, obter_classe_cor_por_sinal, somar_lista_chave } from "./ferramentas.js";
import { NUMERO_CORES, ESPACO_ENTRE_FATIAS } from "./constantes.js";

// #region ==================== PAINEL ====================
export function desenhar_painel({ titulo, info = "", nota = "", acoes = "", conteudo }) {
  const html_info = info ? `<span class="info" title="${info}" tabindex="0">i</span>` : "";
  const html_nota = nota ? `<p class="painel_nota">${nota}</p>` : "";
  return `
    <section class="painel">
      <header class="painel_cabecalho">
        <div class="painel_titulo">
          <h2>${titulo}</h2>
          ${html_info}
        </div>
        <div class="painel_lado_direito">
          ${html_nota}
          ${acoes}
        </div>
      </header>
      ${conteudo}
    </section>
  `;
}
// #endregion

// #region ==================== TABELA ====================

// definicoes_colunas: [{ titulo: "Saldo", campo_editavel: "saldo", tipo_campo: "number", minimo: 0 })
// linhas_conteudo:   [["30/09/2026", "10 000,00 €"], …]
export function desenhar_tabela({ definicoes_colunas, linhas_conteudo }) {
  const html_cabecalho = definicoes_colunas.map((definicao_coluna) => `<th class="${obter_classe_alinhamento_coluna(definicao_coluna)}" ${obter_atributos_campo_editavel(definicao_coluna)}>${definicao_coluna.titulo}</th>`).join("");
  const html_linhas = linhas_conteudo.map((linha) => desenhar_linha_tabela(linha, definicoes_colunas)).join("");
  return `
    <div class="tabela_caixa">
      <table class="tabela">
        <thead><tr>${html_cabecalho}</tr></thead>
        <tbody>${html_linhas}</tbody>
      </table>
    </div>
  `;
}

export function desenhar_tabela_acordeao({ definicoes_colunas, linhas_conteudo }) {
  const grelha_colunas = definicoes_colunas.map((definicao_coluna) => (definicao_coluna.numero ? "minmax(0, 1fr)" : "minmax(0, 1.5fr)")).join(" ");
  const html_cabecalho = definicoes_colunas.map((definicao_coluna) => `<span class="${obter_classe_alinhamento_coluna(definicao_coluna)}">${definicao_coluna.titulo}</span>`).join("");
  const html_linhas = linhas_conteudo.map((linha) => desenhar_linha_acordeao(linha, definicoes_colunas)).join("");
  return `
    <div class="tabela_acordeao" style="--grelha_colunas: ${grelha_colunas}">
      <div class="acordeao_cabecalho">${html_cabecalho}</div>
      ${html_linhas}
    </div>
  `;
}


/* ---------- Ajudantes da tabela ---------- */

function obter_classe_alinhamento_coluna(definicao_coluna) {
  return definicao_coluna.numero ? "numero" : "";
}

function obter_atributos_campo_editavel(definicao_coluna) {
  if (!definicao_coluna.campo_editavel) return "";
  const atributo_minimo = definicao_coluna.minimo !== undefined ? `data-minimo="${definicao_coluna.minimo}"` : "";
  const atributo_maximo = definicao_coluna.maximo !== undefined ? `data-maximo="${definicao_coluna.maximo}"` : "";
  return `data-campo_editavel="${definicao_coluna.campo_editavel}" data-tipo_campo="${definicao_coluna.tipo_campo}" ${atributo_minimo} ${atributo_maximo}`;
}

function desenhar_linha_tabela(linha, definicoes_colunas) {
  const html_celulas = linha.map((celula, indice) => {
    const definicao_coluna = definicoes_colunas[indice];
    return `<td class="${obter_classe_alinhamento_coluna(definicao_coluna)}" ${obter_atributos_campo_editavel(definicao_coluna)}>${celula}</td>`;
  }).join("");
  return `<tr>${html_celulas}</tr>`;

}

/*exmeplo de linha: {celulas: ["S&P 500", "Mercado - USA", "1 580,25 €", "+162,90 €", "+10,3 %", "1 743,15 €"],
                    conteudo_aberto: "<div class='tabela_caixa'><table>…as compras do S&P 500…</table></div>"}*/
function desenhar_linha_acordeao(linha, definicoes_colunas) {
  const html_celulas = linha.celulas.map((celula, indice) => `<span class="${obter_classe_alinhamento_coluna(definicoes_colunas[indice])}">${celula}</span>`).join("");
  return `
    <details class="acordeao_linha">
      <summary>${html_celulas}</summary>
      <div class="acordeao_conteudo">${linha.conteudo_aberto}</div>
    </details>
  `;
}
// #endregion

// #region ==================== BOTÕES ====================

export function desenhar_botao_adicionar(nome_gaveta, texto) {
  return `<button type="button" class="botao_secundario" data-acao="adicionar" data-gaveta="${nome_gaveta}">${texto}</button>`;
}

export function desenhar_botao_abrir_pagina(nome_pagina, texto) {
  return `<button type="button" class="botao_secundario" data-acao="abrir_pagina" data-pagina_destino="${nome_pagina}">${texto}</button>`;
}

export function desenhar_botao_cancelar() {
  return `<button type="button" class="botao_icone" data-acao="cancelar" title="Cancelar">↩</button>`;
}

export function desenhar_botoes_linha(nome_gaveta, id) {
  return `
    <div class="botoes_linha">
      <button type="button" class="botao_icone" data-acao="editar" data-gaveta="${nome_gaveta}" data-id="${id}" title="Editar">✎</button>
      <button type="button" class="botao_icone botao_perigo" data-acao="apagar" data-gaveta="${nome_gaveta}" data-id="${id}" title="Apagar">✕</button>
    </div>
  `;
}
// #endregion

// #region ==================== GRÁFICO CIRCULAR ====================

// fatias: [{ nome: "etf", valor: 3200 }, { nome: "cripto", valor: 2850 }], do maior para o menor
export function desenhar_grafico_circular(fatias) {
  const fatias_com_cor = dar_cor_as_fatias(fatias);
  const total = somar_lista_chave(fatias_com_cor, "valor");
  if (total === 0) return `<p class="painel_nota">Ainda sem dados.</p>`;

  return `
    <div class="grafico_circular_caixa">
      ${desenhar_circulo_fatias(fatias_com_cor, total)}
      <ul class="legenda_grafico">${fatias_com_cor.map((fatia) => desenhar_linha_legenda(fatia, total)).join("")}</ul>
    </div>
  `;
}

/* ---------- Ajudantes do gráfico circular---------- */

function dar_cor_as_fatias(fatias) {
  return fatias.map((fatia, indice) => ({ ...fatia, cor: `var(--cor_grafico_${(indice % NUMERO_CORES) + 1})` }));
}

function desenhar_circulo_fatias(fatias_com_cor, total) {
  const html_fatias = [];
  let inicio = 0;
  for (const fatia of fatias_com_cor) {
    const percentagem = calcular_percentagem(fatia.valor, total);
    const tamanho_pintado = Math.max(percentagem - ESPACO_ENTRE_FATIAS, 0);
    html_fatias.push(`
      <circle class="fatia" cx="50" cy="50" r="38" pathLength="100" style="stroke: ${fatia.cor}"
              stroke-dasharray="${tamanho_pintado} 100" stroke-dashoffset="${-inicio}">
        <title>${fatia.nome}: ${formatar_euro(fatia.valor)} (${formatar_percentagem(percentagem)})</title>
      </circle>
    `);
    inicio += percentagem;
  }
  return `<svg class="grafico_circular" viewBox="0 0 100 100">${html_fatias.join("")}</svg>`;
}

function desenhar_linha_legenda(fatia, total) {
  const percentagem = formatar_percentagem(calcular_percentagem(fatia.valor, total));
  return `
    <li>
      <span class="bolinha" style="background: ${fatia.cor}"></span>
      <span class="legenda_nome">${fatia.nome}</span>
      <span class="legenda_valor">${formatar_euro(fatia.valor)}</span>
      <span class="legenda_percentagem">${percentagem}</span>
    </li>
  `;
}
// #endregion

// #region ==================== GRÁFICO DE BARRAS ====================

//   barras: [{ nome: "S&P 500", valor: 61.8, texto: "+61,80 €" }, …]
export function desenhar_grafico_barras(barras) {
  const valores = barras.map((barra) => barra.valor ?? 0);
  const minimo = Math.min(0, ...valores); // o mais negativo (ou 0, se não houver negativos)
  const maximo = Math.max(0, ...valores); // o mais positivo (ou 0, se não houver positivos)
  const escala = { minimo, amplitude: maximo - minimo };
  return `<ul class="grafico_barras">${barras.map((barra) => desenhar_linha_grafico_barras(barra, escala)).join("")}</ul>`;
}

/* ---------- Ajudantes do gráfico de barras ---------- */

function desenhar_linha_grafico_barras(barra, escala) {
  const ponto_zero = calcular_ponto_na_pista(0, escala);
  return `
    <li class="barra_linha">
      <span class="barra_nome">${barra.nome}</span>
      <div class="barra_pista" style="--ponto_zero: ${ponto_zero}%">${desenhar_barra(barra.valor, escala, ponto_zero)}</div>
      <span class="barra_valor ${obter_classe_cor_por_sinal(barra.valor ?? 0)}">${barra.texto}</span>
    </li>
  `;
}

function calcular_ponto_na_pista(valor, escala) {
  if (escala.amplitude === 0) return 0;
  return ((valor - escala.minimo) / escala.amplitude) * 100;
}

function desenhar_barra(valor, escala, ponto_zero) {
  if (!valor) return "";
  const ponto_valor = calcular_ponto_na_pista(valor, escala);
  const inicio = Math.min(ponto_zero, ponto_valor); 
  const largura = Math.abs(ponto_valor - ponto_zero);
  const classe_sinal_barra = valor > 0 ? "barra_positiva" : "barra_negativa";
  return `<div class="barra ${classe_sinal_barra}" style="left: ${inicio}%; width: ${largura}%"></div>`;
}
// #endregion

// #region ==================== ALTERNADOR ====================

export function desenhar_alternador({ nome_escolha, opcoes, escolhido }) {
  const html_botoes = opcoes.map((opcao) => {
    const classe_ativo = opcao.valor === escolhido ? "ativo" : "";
    return `<button type="button" class="${classe_ativo}" data-acao="mudar_escolha" data-escolha="${nome_escolha}" data-valor="${opcao.valor}">${opcao.texto}</button>`;
  });
  return `<div class="alternador">${html_botoes.join("")}</div>`;
}
// #endregion

// #region ==================== CARTÃO ====================

export function desenhar_cartao({ titulo, valor, legenda = "", destaque = false, cor_valor = "" }) {
  const html_legenda = legenda ? `<p class="cartao_legenda">${legenda}</p>` : "";
  const classe_destaque = destaque ? "cartao_destaque" : "";
  return `
    <article class="cartao ${classe_destaque}">
      <h3 class="cartao_titulo">${titulo}</h3>
      <p class="cartao_valor ${cor_valor}">${valor}</p>
      ${html_legenda}
    </article>
  `;
}
// #endregion
