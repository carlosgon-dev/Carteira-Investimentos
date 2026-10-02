// Peças visuais reutilizáveis. Cada função devolve HTML em texto (template string).

// Um painel: caixa com linha à volta, com um cabeçalho e o conteúdo por baixo.
//   conteudo: o HTML que vai dentro (cartões, tabela, gráfico…)
// Opções do cabeçalho (todas opcionais):
//   info:  texto de ajuda, aparece ao passar o rato no "i" ao lado do título
//   nota:  texto pequeno à direita
//   acoes: HTML dos botões, à direita
export function desenhar_painel({ titulo, info = "", nota = "", acoes = "", conteudo }) {
  const html_info = info ? `<span class="info" title="${info}" tabindex="0" aria-label="${info}">i</span>` : "";
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

// Uma tabela. Não sabe nada dos dados: recebe os textos já formatados.
//   colunas_cabecalho: o que vai lá em cima, uma entrada por coluna (numero: alinha à direita)
//                      [{ titulo: "Data" }, { titulo: "Saldo", numero: true }]
//   linhas_conteudo:   o que vai em cada linha, as células pela ordem das colunas
//                      [["30/09/2026", "10 000,00 €"], …]
export function desenhar_tabela({ colunas_cabecalho, linhas_conteudo }) {
  const html_cabecalho = colunas_cabecalho.map((coluna) => `<th class="${obter_classe_coluna(coluna)}">${coluna.titulo}</th>`).join("");
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

// Uma linha da tabela: cada célula recebe o alinhamento da sua coluna
function desenhar_linha_tabela(linha, colunas_cabecalho) {
  const html_celulas = linha.map((celula, posicao) => `<td class="${obter_classe_coluna(colunas_cabecalho[posicao])}">${celula}</td>`).join("");
  return `<tr>${html_celulas}</tr>`;
}

// Colunas de números alinham à direita
function obter_classe_coluna(coluna) {
  return coluna.numero ? "numero" : "";
}

// Os botões ✎ (editar) e ✕ (apagar) de uma linha de tabela. Servem para qualquer gaveta.
// Cada botão leva escrito o que faz, em que gaveta e em que objeto (para o main.js saber o que fazer ao clique).
export function desenhar_botoes_linha(nome_gaveta, id) {
  return `
    <div class="botoes_linha">
      <button type="button" class="botao_icone" data-acao="editar" data-gaveta="${nome_gaveta}" data-id="${id}" title="Editar" aria-label="Editar">✎</button>
      <button type="button" class="botao_icone botao_perigo" data-acao="apagar" data-gaveta="${nome_gaveta}" data-id="${id}" title="Apagar" aria-label="Apagar">✕</button>
    </div>
  `;
}

// Um cartão: título, valor grande e, se houver, uma legenda por baixo.
// Opções (todas opcionais):
//   legenda:   texto pequeno por baixo do valor, ex.: "+7,0%"
//   estilo:    uma classe extra, ex.: "cartao_destaque"
//   cor_valor: "positivo" (verde) ou "negativo" (vermelho), ver obter_cor_valor()
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
