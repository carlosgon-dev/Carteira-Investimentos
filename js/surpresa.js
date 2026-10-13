import { esperar } from "./ferramentas.js";

// #region ==================== CONSTANTES ====================
const SEGUNDOS_ATE_SURPRESA = 30;
const FICHEIRO_VIDEO = "data/eder.mp4";
const MILISSEGUNDOS_POR_SEGUNDO = 1000;
const SEGUNDOS_ATE_O_VIDEO_APARECER = 4;
// #endregion

// #region ==================== MOTOR ====================
export async function mostrar_surpresa_depois_de_esperar() {
  await esperar(SEGUNDOS_ATE_SURPRESA * MILISSEGUNDOS_POR_SEGUNDO);

  const ecra_surpresa = criar_ecra_surpresa();
  document.body.append(ecra_surpresa);

  await esperar(50); 
  ecra_surpresa.classList.add("visivel"); 

  await esperar(SEGUNDOS_ATE_O_VIDEO_APARECER * MILISSEGUNDOS_POR_SEGUNDO);
  if (!ecra_surpresa.isConnected) return;
  tocar_video(ecra_surpresa.querySelector("video"));
}
// #endregion

// #region ==================== AUXILIARES ====================

function criar_ecra_surpresa() {
  const ecra_surpresa = document.createElement("div");
  ecra_surpresa.className = "ecra_surpresa";
  ecra_surpresa.innerHTML = `<video class="video_surpresa" src="${FICHEIRO_VIDEO}" controls playsinline></video>`;

  const video = ecra_surpresa.querySelector("video");
  const fechar_surpresa = () => {
    video.pause();
    ecra_surpresa.remove();
  };

  ecra_surpresa.addEventListener("click", (evento) => {
    const video_ja_comecou = video.currentTime > 0;
    if (evento.target === ecra_surpresa && video_ja_comecou) fechar_surpresa();
  });
  video.addEventListener("ended", fechar_surpresa);

  return ecra_surpresa;
}

function tocar_video(video) {
  video.volume = 1; // 1 = volume máximo
  video.play().catch(() => {
    video.muted = true;
    video.play();
    pedir_clique_para_ligar_som(video);
  });
}

function pedir_clique_para_ligar_som(video) {
  const aviso = document.createElement("p");
  aviso.className = "aviso_som";
  aviso.textContent = "🔊 Clica em qualquer sítio para ligar o som";
  video.after(aviso);

  const ligar_som = (evento) => {
    evento.stopPropagation(); // 
    video.muted = false;
    video.volume = 1;
    aviso.remove();
  };
  document.addEventListener("click", ligar_som, { once: true, capture: true });
  document.addEventListener("keydown", ligar_som, { once: true });
}
// #endregion
