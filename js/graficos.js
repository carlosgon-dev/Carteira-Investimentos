// Peças visuais reutilizáveis. Cada função devolve HTML em texto (template string).
import { formatar_euro, calcular_percentagem, formatar_percentagem } from "./ferramentas.js";

// #region ==================== PAINEL ====================

// Um painel: caixa com linha à volta, com um cabeçalho e o conteúdo por baixo.
//   conteudo: o HTML que vai dentro (cartões, tabela, gráfico…)
// Opções do cabeçalho (todas opcionais):
//   info:  texto de ajuda, aparece ao passar o rato no "i" ao lado do título
//   nota:  texto pequeno à direita
//   acoes: HTML dos botões, à direita
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

// Uma tabela. Não sabe nada dos dados: recebe os textos já formatados.
//   colunas_cabecalho: o que vai lá em cima, uma entrada por coluna
//                      [{ titulo: "Data" }, { titulo: "Saldo", numero: true }]
//                      numero: alinha à direita
//                      campo_editavel + tipo_campo (opcionais): a coluna pode ser editada com o ✎;
//                        campo_editavel = a chave do objeto que a coluna mostra ("saldo")
//                        tipo_campo = o tipo de campo para a escrever ("number", "date", "text")
//                        minimo (opcional) = o valor mais baixo aceite, ex.: 0
//                        maximo (opcional) = o valor mais alto aceite; nas datas, "hoje" = o dia de hoje
//   linhas_conteudo:   o que vai em cada linha, as células pela ordem das colunas
//                      [["30/09/2026", "10 000,00 €"], …]
export function desenhar_tabela({ colunas_cabecalho, linhas_conteudo }) {
  // Os títulos levam as mesmas pistas de edição que as células (o "+ …" usa-as para criar uma linha nova)
  const html_cabecalho = colunas_cabecalho.map((coluna) => `<th class="${obter_classe_coluna(coluna)}" ${obter_atributos_edicao(coluna)}>${coluna.titulo}</th>`).join("");
  const html_linhas = linhas_conteudo.map((linha) => desenhar_linha_tabela(linha, colunas_cabecalho)).join("");
  return `
    <div class="tabela_caixa">
      <table class="tabela">
        <thead><tr>${html_cabecalho}</tr></thead>
        <tbody>${html_linhas}</tbody>
      </table>
    </div>
  `;
}

/* ---------- Ajudantes da tabela (só usados aqui) ---------- */
// Dão a cada célula as características da sua coluna:
// o alinhamento, para o CSS, e as pistas de edição, para o ✎ do main.js

// Colunas de números alinham à direita
function obter_classe_coluna(coluna) {
  return coluna.numero ? "numero" : "";
}

// Colunas editáveis: a célula leva escrito o campo_editavel, o tipo_campo e, se houver, o minimo e o maximo
function obter_atributos_edicao(coluna) {
  if (!coluna.campo_editavel) return "";
  const atributo_minimo = coluna.minimo !== undefined ? `data-minimo="${coluna.minimo}"` : "";
  const atributo_maximo = coluna.maximo !== undefined ? `data-maximo="${coluna.maximo}"` : "";
  return `data-campo_editavel="${coluna.campo_editavel}" data-tipo_campo="${coluna.tipo_campo}" ${atributo_minimo} ${atributo_maximo}`;
}

// Uma linha da tabela: cada célula recebe o alinhamento e as pistas de edição da sua coluna
function desenhar_linha_tabela(linha, colunas_cabecalho) {
  const html_celulas = linha.map((celula, posicao) => {
    const coluna = colunas_cabecalho[posicao];
    return `<td class="${obter_classe_coluna(coluna)}" ${obter_atributos_edicao(coluna)}>${celula}</td>`;
  }).join("");
  return `<tr>${html_celulas}</tr>`;
}
// #endregion

// #region ==================== BOTÕES ====================

// O botão "+ …" que acrescenta um objeto novo a uma gaveta (vai no cabeçalho do painel, em "acoes")
export function desenhar_botao_adicionar(nome_gaveta, texto) {
  return `<button type="button" class="botao_secundario" data-acao="adicionar" data-gaveta="${nome_gaveta}">${texto}</button>`;
}

// O botão ↩ (cancelar) de uma linha à espera: aparece no lugar de outro botão, depois do 1.º clique
export function desenhar_botao_cancelar() {
  return `<button type="button" class="botao_icone" data-acao="cancelar" title="Cancelar">↩</button>`;
}

// Os botões ✎ (editar) e ✕ (apagar) de uma linha de tabela. Servem para qualquer gaveta.
// Cada botão leva escrito o que faz, em que gaveta e em que objeto (para o main.js saber o que fazer ao clique).
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
// Quantas cores há para as fatias (--cor_grafico_1 a 15, no base.css); a partir da 16.ª fatia, as cores repetem-se
const NUMERO_CORES = 15;
const CORTE_ENTRE_FATIAS = 0.4;

// Um gráfico circular (donut) com a legenda por baixo. Ao passar o rato numa fatia, aparece o nome, o valor e a %.
//   fatias: [{ nome: "ETF's", valor: 3200 }, …], já do maior para o menor
// Cada fatia tem a sua cor, sempre pela mesma ordem; a legenda mostra o nome, o valor e a %.
export function desenhar_grafico_circular(fatias) {
  const fatias_com_cor = dar_cor_as_fatias(fatias);
  const total = fatias_com_cor.reduce((soma, fatia) => soma + fatia.valor, 0);
  if (total === 0) return `<p class="painel_nota">Ainda sem dados.</p>`;

  return `
    <div class="grafico_circular_caixa">
      ${desenhar_circulo_fatias(fatias_com_cor, total)}
      <ul class="legenda_grafico">${fatias_com_cor.map((fatia) => desenhar_linha_legenda(fatia, total)).join("")}</ul>
    </div>
  `;
}

/* ---------- Ajudantes do gráfico circular (só usados aqui) ---------- */

// Dá a cada fatia a sua cor, pela ordem (1.ª fatia → cor 1, 2.ª → cor 2…). Todas as fatias aparecem.
// O % (resto da divisão) faz a 9.ª voltar à cor 1, a 10.ª à cor 2, e assim por diante.
function dar_cor_as_fatias(fatias) {
  return fatias.map((fatia, posicao) => ({ ...fatia, cor: `var(--cor_grafico_${(posicao % NUMERO_CORES) + 1})` }));
}

// O círculo em SVG: cada fatia é um anel (<circle>) com a sua cor, a começar onde a anterior acabou.
//   pathLength="100": a volta inteira passa a valer 100, por isso cada fatia ocupa exatamente a sua %
//   stroke-dasharray:  o tamanho do traço pintado (a fatia) e o espaço vazio a seguir
//   stroke-dashoffset: onde a fatia começa (logo a seguir à anterior)
//   <title>:           o balão que aparece ao passar o rato (é do próprio browser, sem JavaScript)
function desenhar_circulo_fatias(fatias_com_cor, total) {
  const html_fatias = [];
  let inicio = 0;
  for (const fatia of fatias_com_cor) {
    const percentagem = calcular_percentagem(fatia.valor, total);
    const tamanho_pintado = Math.max(percentagem - CORTE_ENTRE_FATIAS, 0);
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

// Uma linha da legenda: bolinha da cor · nome · valor · %
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

// #region ==================== CARTÃO ====================

// Um cartão: título, valor grande e, se houver, uma legenda por baixo.
// Opções (todas opcionais):
//   legenda:   texto pequeno por baixo do valor, ex.: "+7,0%"
//   estilo:    uma classe extra, ex.: "cartao_destaque"
//   cor_valor: "positivo" (verde) ou "negativo" (vermelho), ver obter_classe_positivo_negativo()
export function desenhar_cartao({ titulo, valor, legenda = "", estilo = "", cor_valor = "" }) {
  const html_legenda = legenda ? `<p class="cartao_legenda">${legenda}</p>` : "";
  return `
    <article class="cartao ${estilo}">
      <h3 class="cartao_titulo">${titulo}</h3>
      <p class="cartao_valor ${cor_valor}">${valor}</p>
      ${html_legenda}
    </article>
  `;
}
// #endregion
