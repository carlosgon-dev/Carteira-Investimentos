import { esperar } from "./ferramentas.js";

// #region ==================== CONSTANTES ====================
const TEMPO_VISIVEL = 6000;
const TEMPO_ANIMACAO = 3000;
// #endregion

// #region ==================== MOTOR ====================
export async function mostrar_notificacao(mensagem_balao) {
  const balao = document.createElement("div");
  balao.className = "notificacao_flutuante";
  balao.textContent = mensagem_balao;
  document.body.append(balao);

  await esperar(50); 
  balao.classList.add("visivel");

  await esperar(TEMPO_VISIVEL);
  balao.classList.remove("visivel");

  await esperar(TEMPO_ANIMACAO);
  balao.remove();
}
// #endregion
