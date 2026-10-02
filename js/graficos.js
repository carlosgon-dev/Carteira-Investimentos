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
