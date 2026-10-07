// O rodapé das cotações: uma faixa que corre sem parar, com preços em tempo real vindos da internet.
// Mostra o assincronismo com fetch + .then() + .catch() (a forma "em cadeia" de tratar promessas;
// o gestor_dados.js usa a outra forma, com async/await + try/catch).
import { formatar_euro, formatar_percentagem, acrescentar_sinal, obter_classe_positivo_negativo } from "./ferramentas.js";

// #region ==================== CONSTANTES ====================
// As 3 fontes (grátis, sem registo)
const URL_CRIPTO_E_OURO = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=eur&include_24hr_change=true";
const URL_DOLAR = "https://api.frankfurter.dev/v1/latest?from=EUR&to=USD";
const URL_MEDO_GANANCIA = "https://api.alternative.me/fng/";

// De quanto em quanto tempo os preços se atualizam
const SEGUNDOS_ENTRE_ATUALIZACOES = 60;
const MILISSEGUNDOS_POR_SEGUNDO = 1000;

// Se a internet falhar, o rodapé mostra estes valores (e a etiqueta diz "Exemplo")
const COTACOES_EXEMPLO = [
  { nome: "Bitcoin", texto_valor: "74 500,00 €", variacao: -2.5 },
  { nome: "Ethereum", texto_valor: "2 290,00 €", variacao: -4.9 },
  { nome: "Ouro (onça)", texto_valor: "3 675,00 €", variacao: -0.8 },
  { nome: "EUR/USD", texto_valor: "1,1269", variacao: null },
  { nome: "Medo & Ganância (cripto)", texto_valor: "71 · Greed", variacao: null },
];
// #endregion

// #region ==================== MOTOR ====================
// Vai buscar as cotações agora e depois a cada 60 segundos. O main.js chama isto uma vez, no arranque.
export function ativar_rodape_cotacoes() {
  atualizar_cotacoes();
  setInterval(atualizar_cotacoes, SEGUNDOS_ENTRE_ATUALIZACOES * MILISSEGUNDOS_POR_SEGUNDO);
}

// Pede as 3 fontes ao mesmo tempo (Promise.all). Quando chegarem todas → .then desenha o rodapé;
// se alguma falhar (sem internet, API em baixo) → .catch desenha os valores de exemplo.
function atualizar_cotacoes() {
  Promise.all([buscar_cripto_e_ouro(), buscar_dolar(), buscar_medo_ganancia()])
    .then(([cotacoes_cripto_e_ouro, cotacao_dolar, cotacao_medo]) => {
      desenhar_rodape([...cotacoes_cripto_e_ouro, cotacao_dolar, cotacao_medo], `Ao vivo · ${obter_hora_agora()}`);
    })
    .catch(() => desenhar_rodape(COTACOES_EXEMPLO, "Exemplo"));
}
// #endregion

// #region ==================== IR BUSCAR À INTERNET ====================
// Pede um endereço e devolve o JSON da resposta (se a resposta vier com erro, a promessa falha)
function buscar_json(url) {
  return fetch(url).then((resposta) => {
    if (!resposta.ok) throw new Error(`Falhou: ${url}`);
    return resposta.json();
  });
}

// Bitcoin, Ethereum e Ouro (PAX Gold = 1 onça de ouro), em euros, com a variação das últimas 24 h
function buscar_cripto_e_ouro() {
  return buscar_json(URL_CRIPTO_E_OURO).then((precos) => [
    criar_cotacao_em_euros("Bitcoin", precos.bitcoin),
    criar_cotacao_em_euros("Ethereum", precos.ethereum),
    criar_cotacao_em_euros("Ouro (onça)", precos["pax-gold"]),
  ]);
}

// Quantos dólares vale 1 euro
function buscar_dolar() {
  return buscar_json(URL_DOLAR).then((resposta) => ({
    nome: "EUR/USD",
    texto_valor: resposta.rates.USD.toLocaleString("pt-PT", { minimumFractionDigits: 4 }),
    variacao: null,
  }));
}

// O índice "Medo & Ganância" das criptomoedas (0 = medo extremo, 100 = ganância extrema)
function buscar_medo_ganancia() {
  return buscar_json(URL_MEDO_GANANCIA).then((resposta) => ({
    nome: "Medo & Ganância (cripto)",
    texto_valor: `${resposta.data[0].value} · ${resposta.data[0].value_classification}`,
    variacao: null,
  }));
}

// { eur: 74555, eur_24h_change: -2.49 } → { nome, texto_valor: "74 555,00 €", variacao: -2.49 }
function criar_cotacao_em_euros(nome, preco) {
  return { nome, texto_valor: formatar_euro(preco.eur), variacao: preco.eur_24h_change };
}
// #endregion

// #region ==================== DESENHAR ====================
// O rodapé: a etiqueta fixa à esquerda e a faixa que corre. O conteúdo vai DUAS vezes seguidas:
// quando a 1.ª cópia acaba de passar, a 2.ª está no mesmo sítio, e a faixa recomeça sem se notar o salto.
function desenhar_rodape(cotacoes, etiqueta) {
  const html_cotacoes = cotacoes.map(desenhar_cotacao).join("");
  document.querySelector(".rodape").innerHTML = `
    <span class="rodape_etiqueta">${etiqueta}</span>
    <div class="rodape_faixa">
      <div class="rodape_faixa_conteudo">${html_cotacoes}${html_cotacoes}</div>
    </div>
  `;
}

// Uma cotação: nome a negrito, valor e (se houver) a variação, verde ou vermelha
function desenhar_cotacao(cotacao) {
  const html_variacao = cotacao.variacao === null
    ? ""
    : `<span class="${obter_classe_positivo_negativo(cotacao.variacao)}">${acrescentar_sinal(formatar_percentagem(cotacao.variacao), cotacao.variacao)}</span>`;
  return `<span class="cotacao"><strong>${cotacao.nome}</strong> ${cotacao.texto_valor} ${html_variacao}</span>`;
}

// A hora de agora: "14:05"
function obter_hora_agora() {
  return new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}
// #endregion
