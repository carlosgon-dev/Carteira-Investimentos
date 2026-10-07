// Peças visuais reutilizáveis. Cada função devolve HTML em texto (template string).
import { formatar_euro, calcular_percentagem, formatar_percentagem, obter_classe_positivo_negativo } from "./ferramentas.js";

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

// Uma tabela em que cada linha abre (acordeão) e mostra mais coisas por baixo.
// Como o HTML não deixa pôr <details> dentro de <table>, é feita com <div>s + CSS grid; cada linha é um <details>.
//   colunas_cabecalho: igual à desenhar_tabela ([{ titulo: "Nome" }, { titulo: "Investido", numero: true }, …])
//   linhas_conteudo:   [{ celulas: ["Bitcoin", "1 800,00 €", …], conteudo_aberto: "<HTML que aparece ao abrir>" }, …]
// A largura das colunas: as de texto ocupam 1,5 partes, as de números 1 parte.
// O minmax(0, …) obriga TODAS as linhas a ter as colunas iguais (sem ele, um texto comprido alargava a coluna só nessa linha).
export function desenhar_tabela_acordeao({ colunas_cabecalho, linhas_conteudo }) {
  const grelha_colunas = colunas_cabecalho.map((coluna) => (coluna.numero ? "minmax(0, 1fr)" : "minmax(0, 1.5fr)")).join(" ");
  const html_cabecalho = colunas_cabecalho.map((coluna) => `<span class="${obter_classe_coluna(coluna)}">${coluna.titulo}</span>`).join("");
  const html_linhas = linhas_conteudo.map((linha) => desenhar_linha_acordeao(linha, colunas_cabecalho)).join("");
  return `
    <div class="tabela_acordeao" style="--grelha_colunas: ${grelha_colunas}">
      <div class="acordeao_cabecalho">${html_cabecalho}</div>
      ${html_linhas}
    </div>
  `;
}

// Uma linha do acordeão: o <summary> (sempre visível) com as células, e o conteúdo que aparece ao abrir
function desenhar_linha_acordeao(linha, colunas_cabecalho) {
  const html_celulas = linha.celulas.map((celula, posicao) => `<span class="${obter_classe_coluna(colunas_cabecalho[posicao])}">${celula}</span>`).join("");
  return `
    <details class="acordeao_linha">
      <summary>${html_celulas}</summary>
      <div class="acordeao_conteudo">${linha.conteudo_aberto}</div>
    </details>
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

// Um botão que abre outra página da app (ex.: "+ Registar venda" → página registar_venda).
// Leva data-acao="abrir_pagina" e o nome da página: o eventos.js trata do clique.
export function desenhar_botao_abrir_pagina(nome_pagina, texto) {
  return `<button type="button" class="botao_secundario" data-acao="abrir_pagina" data-pagina_destino="${nome_pagina}">${texto}</button>`;
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

// #region ==================== GRÁFICO DE BARRAS ====================

// Um gráfico de barras horizontais: positivos para a direita (verde), negativos para a esquerda (vermelho).
// A pista vai do valor mais baixo (à esquerda) ao mais alto (à direita); o zero fica onde calhar entre os dois.
//   barras: [{ nome: "S&P 500", valor: 61.8, texto: "+61,80 €" }, …]
//   valor null = sem registo: mostra o texto ("—") e não desenha barra
export function desenhar_grafico_barras(barras) {
  const valores = barras.map((barra) => barra.valor ?? 0);
  const minimo = Math.min(0, ...valores); // o mais negativo (ou 0, se não houver negativos)
  const maximo = Math.max(0, ...valores); // o mais positivo (ou 0, se não houver positivos)
  const escala = { minimo, amplitude: maximo - minimo };
  return `<ul class="grafico_barras">${barras.map((barra) => desenhar_linha_barra(barra, escala)).join("")}</ul>`;
}

/* ---------- Ajudantes do gráfico de barras (só usados aqui) ---------- */

// Uma linha: nome · pista com a barra · valor (com a cor do sinal)
// A pista leva a posição do zero numa variável CSS (--posicao_zero), para desenhar lá a linha do zero
function desenhar_linha_barra(barra, escala) {
  return `
    <li class="barra_linha">
      <span class="barra_nome">${barra.nome}</span>
      <div class="barra_pista" style="--posicao_zero: ${calcular_posicao_na_pista(0, escala)}%">${desenhar_barra(barra.valor, escala)}</div>
      <span class="barra_valor ${obter_classe_positivo_negativo(barra.valor ?? 0)}">${barra.texto}</span>
    </li>
  `;
}

// Onde fica um valor na pista, em %: o mínimo fica em 0 % (esquerda) e o máximo em 100 % (direita)
function calcular_posicao_na_pista(valor, escala) {
  if (escala.amplitude === 0) return 0;
  return ((valor - escala.minimo) / escala.amplitude) * 100;
}

// A barra pintada: vai do zero até ao valor (para a direita se for positivo, para a esquerda se for negativo)
function desenhar_barra(valor, escala) {
  if (!valor) return ""; // sem registo ou zero: sem barra
  const posicao_zero = calcular_posicao_na_pista(0, escala);
  const posicao_valor = calcular_posicao_na_pista(valor, escala);
  const inicio = Math.min(posicao_zero, posicao_valor); // a barra começa no ponto mais à esquerda dos dois
  const largura = Math.abs(posicao_valor - posicao_zero);
  const lado = valor > 0 ? "barra_positiva" : "barra_negativa";
  return `<div class="barra ${lado}" style="left: ${inicio}%; width: ${largura}%"></div>`;
}
// #endregion

// #region ==================== ALTERNADOR ====================

// Um grupo de botões em que só um está escolhido (ex.: [Ativo | Área] ou [€ | %]).
//   nome_escolha: o que o grupo muda (ex.: "agrupar_por") · opcoes: [{ valor: "nome", texto: "Ativo" }, …]
//   escolhido: o valor que está ativo agora
// Cada botão leva data-acao="mudar_escolha": o eventos.js trata do clique.
export function desenhar_alternador({ nome_escolha, opcoes, escolhido }) {
  const html_botoes = opcoes.map((opcao) => {
    const classe_ativo = opcao.valor === escolhido ? "ativo" : "";
    return `<button type="button" class="${classe_ativo}" data-acao="mudar_escolha" data-escolha="${nome_escolha}" data-valor="${opcao.valor}">${opcao.texto}</button>`;
  });
  return `<div class="alternador">${html_botoes.join("")}</div>`;
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
