// Peças visuais reutilizáveis. Cada função devolve HTML em texto (template string).

// Um cartão com um título e um valor grande
export function desenhar_cartao(titulo, valor) {
  return `
    <article class="cartao">
      <h3>${titulo}</h3>
      <p>${valor}</p>
    </article>
  `;
}
