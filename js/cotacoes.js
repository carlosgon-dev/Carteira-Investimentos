import { formatar_euro, formatar_percentagem, acrescentar_sinal, obter_classe_cor_por_sinal } from "./ferramentas.js";

// #region ==================== CONSTANTES ====================
const URL_BITCOIN_ETHEREUM_OURO = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=eur&include_24hr_change=true";
const URL_DOLAR = "https://api.frankfurter.dev/v1/latest?from=EUR&to=USD";
const URL_MEDO_GANANCIA = "https://api.alternative.me/fng/";

const SEGUNDOS_ENTRE_ATUALIZACOES = 60;
const MILISSEGUNDOS_POR_SEGUNDO = 1000;

const COTACOES_EXEMPLO = [
  { nome: "Bitcoin", texto_valor: "74 500,00 €", variacao: -2.5 },
  { nome: "Ethereum", texto_valor: "2 290,00 €", variacao: -4.9 },
  { nome: "Ouro (onça)", texto_valor: "3 675,00 €", variacao: -0.8 },
  { nome: "EUR/USD", texto_valor: "1,1269", variacao: null },
  { nome: "Medo & Ganância (cripto)", texto_valor: "71 · Greed", variacao: null },
];
// #endregion

// #region ==================== MOTOR ====================
export function ativar_rodape_cotacoes() {
  atualizar_cotacoes();
  setInterval(atualizar_cotacoes, SEGUNDOS_ENTRE_ATUALIZACOES * MILISSEGUNDOS_POR_SEGUNDO);
}

function atualizar_cotacoes() {
  Promise.all([buscar_bitcoin_ethereum_ouro(), buscar_dolar(), buscar_medo_ganancia()])
    .then(([cotacoes_bitcoin_ethereum_ouro, cotacao_dolar, cotacao_medo]) => {
      desenhar_rodape([...cotacoes_bitcoin_ethereum_ouro, cotacao_dolar, cotacao_medo], `Ao vivo · ${obter_hora_agora()}`);
    })
    .catch(() => desenhar_rodape(COTACOES_EXEMPLO, "Exemplo"));
}
// #endregion

// #region ==================== IR BUSCAR À INTERNET ====================
function buscar_json(url) {
  return fetch(url).then((resposta) => {
    if (!resposta.ok) throw new Error(`Falhou: ${url}`);
    return resposta.json();
  });
}

function buscar_bitcoin_ethereum_ouro() {
  return buscar_json(URL_BITCOIN_ETHEREUM_OURO).then((precos) => [
    criar_cotacao_em_euros("Bitcoin", precos.bitcoin),
    criar_cotacao_em_euros("Ethereum", precos.ethereum),
    criar_cotacao_em_euros("Ouro (onça)", precos["pax-gold"]),
  ]);
}

function buscar_dolar() {
  return buscar_json(URL_DOLAR).then((resposta) => ({
    nome: "EUR/USD",
    texto_valor: resposta.rates.USD.toLocaleString("pt-PT", { minimumFractionDigits: 4 }),
    variacao: null,
  }));
}

function buscar_medo_ganancia() {
  return buscar_json(URL_MEDO_GANANCIA).then((resposta) => ({
    nome: "Medo & Ganância (cripto)",
    texto_valor: `${resposta.data[0].value} · ${resposta.data[0].value_classification}`,
    variacao: null,
  }));
}

function criar_cotacao_em_euros(nome, preco) {
  return { nome, texto_valor: formatar_euro(preco.eur), variacao: preco.eur_24h_change };
}
// #endregion

// #region ==================== DESENHAR ====================
function desenhar_rodape(cotacoes, etiqueta) {
  const html_cotacoes = cotacoes.map(desenhar_cotacao).join("");
  document.querySelector(".rodape").innerHTML = `
    <span class="rodape_etiqueta">${etiqueta}</span>
    <div class="rodape_faixa">
      <div class="rodape_faixa_conteudo">${html_cotacoes}${html_cotacoes}</div>
    </div>
  `;
}

function desenhar_cotacao(cotacao) {
  const html_variacao = cotacao.variacao === null
    ? ""
    : `<span class="${obter_classe_cor_por_sinal(cotacao.variacao)}">${acrescentar_sinal(formatar_percentagem(cotacao.variacao), cotacao.variacao)}</span>`;
  return `<span class="cotacao"><strong>${cotacao.nome}</strong> ${cotacao.texto_valor} ${html_variacao}</span>`;
}

function obter_hora_agora() {
  return new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}
// #endregion
