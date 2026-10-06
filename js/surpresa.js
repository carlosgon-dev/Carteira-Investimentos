// A surpresa: passado um tempo, o ecrã escurece devagar e aparece o vídeo do golo do Éder.
// Mostra o assincronismo com uma Promise feita à mão (setTimeout + async/await) e o createElement.

// #region ==================== CONSTANTES ====================
const SEGUNDOS_ATE_SURPRESA = 30;
const FICHEIRO_VIDEO = "data/eder.mp4";
const MILISSEGUNDOS_POR_SEGUNDO = 1000;
// Quanto tempo o vídeo espera até começar a aparecer (tem de bater certo com o atraso no CSS: 2.5s)
const SEGUNDOS_ATE_O_VIDEO_APARECER = 2.5;
// #endregion

// #region ==================== MOTOR ====================
// Espera 30 segundos e depois mostra o vídeo. O main.js chama isto uma vez, no arranque, SEM await:
// assim a app continua a funcionar normalmente enquanto o tempo passa.
export async function mostrar_surpresa_depois_de_esperar() {
  await esperar(SEGUNDOS_ATE_SURPRESA * MILISSEGUNDOS_POR_SEGUNDO);

  const ecra_surpresa = criar_ecra_surpresa();
  document.body.append(ecra_surpresa);

  await esperar(50); // deixa o browser desenhar o ecrã (ainda invisível) antes de começar a escurecer
  ecra_surpresa.classList.add("visivel"); // o CSS faz o resto: escurece devagar e depois mostra o vídeo

  await esperar(SEGUNDOS_ATE_O_VIDEO_APARECER * MILISSEGUNDOS_POR_SEGUNDO);
  tocar_video(ecra_surpresa.querySelector("video")); // começa a tocar quando aparece
}
// #endregion

// #region ==================== AUXILIARES ====================
// Uma pausa: devolve uma Promise que só fica resolvida passados estes milissegundos
function esperar(milissegundos) {
  return new Promise((resolver) => setTimeout(resolver, milissegundos));
}

// O ecrã escuro, por cima de tudo, com o vídeo ao centro (criado com createElement)
function criar_ecra_surpresa() {
  const ecra_surpresa = document.createElement("div");
  ecra_surpresa.className = "ecra_surpresa";
  ecra_surpresa.innerHTML = `<video class="video_surpresa" src="${FICHEIRO_VIDEO}" controls playsinline></video>`;

  // Clicar no fundo escuro (fora do vídeo) fecha a surpresa; quando o vídeo acaba, também fecha
  ecra_surpresa.addEventListener("click", (evento) => {
    if (evento.target === ecra_surpresa) ecra_surpresa.remove();
  });
  ecra_surpresa.querySelector("video").addEventListener("ended", () => ecra_surpresa.remove());

  return ecra_surpresa;
}

// Põe o vídeo a tocar, com o som no máximo. Primeiro tenta COM som; se o browser recusar (porque ainda não
// clicaste na página), a Promise do play() falha, o .catch apanha a falha e toca SEM som (os browsers deixam sempre).
function tocar_video(video) {
  video.volume = 1; // 1 = volume máximo
  video.play().catch(() => {
    video.muted = true;
    video.play();
    pedir_clique_para_ligar_som(video);
  });
}

// O browser só deixa ligar o som depois de a pessoa interagir com a página.
// Mostra um aviso e, no 1.º clique ou tecla (em qualquer sítio), liga o som no máximo.
function pedir_clique_para_ligar_som(video) {
  const aviso = document.createElement("p");
  aviso.className = "aviso_som";
  aviso.textContent = "🔊 Clica em qualquer sítio para ligar o som";
  video.after(aviso);

  const ligar_som = (evento) => {
    evento.stopPropagation(); // este clique só serve para ligar o som (não fecha o vídeo nem mexe na app)
    video.muted = false;
    video.volume = 1;
    aviso.remove();
  };
  // once: true → cada ouvido só funciona uma vez e depois desliga-se sozinho
  document.addEventListener("click", ligar_som, { once: true, capture: true });
  document.addEventListener("keydown", ligar_som, { once: true });
}
// #endregion
