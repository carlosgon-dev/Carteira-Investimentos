// Os avisos da app: um balão no canto do ecrã (ex.: "✓ Compra guardada") que aparece devagar,
// fica uns segundos e desaparece sozinho. Melhor do que o alert(), que bloqueia a página.
import { esperar } from "./ferramentas.js";

// #region ==================== CONSTANTES ====================
// Quanto tempo o balão fica visível (em milissegundos)
const TEMPO_VISIVEL = 3000;
// Quanto tempo dura a animação de aparecer/desaparecer (tem de bater certo com o transition do CSS: 0.3s)
const TEMPO_ANIMACAO = 300;
// #endregion

// #region ==================== MOTOR ====================
// Mostra um balão com esta mensagem. Não é preciso esperar por ele (a app continua a funcionar).
export async function mostrar_aviso(mensagem) {
  const balao = document.createElement("div");
  balao.className = "aviso_flutuante";
  balao.textContent = mensagem;
  document.body.append(balao);

  await esperar(50); // deixa o browser desenhar o balão (ainda invisível) antes de o mostrar
  balao.classList.add("visivel"); // aparece devagar (o CSS faz a animação)

  await esperar(TEMPO_VISIVEL);
  balao.classList.remove("visivel"); // desaparece devagar

  await esperar(TEMPO_ANIMACAO);
  balao.remove(); // tira-o da página
}
// #endregion
