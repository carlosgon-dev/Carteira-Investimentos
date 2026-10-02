// Peças visuais reutilizáveis. Cada função devolve HTML em texto (template string).

// Um cartão com um título e um valor grande.
// estilo (opcional): uma classe extra, por exemplo "cartao_destaque"
export function desenhar_cartao(titulo, valor, estilo = "") {
  return `
    <article class="cartao ${estilo}">
      <h3 class="cartao_titulo">${titulo}</h3>
      <p class="cartao_valor">${valor}</p>
    </article>
  `;
}
