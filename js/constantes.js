// Constantes PARTILHADAS: só ficam aqui as que são usadas por 2 ou mais ficheiros.
// As que só um ficheiro usa ficam no topo desse ficheiro (região CONSTANTES).

// #region ==================== PREFIXOS DOS IDS ====================
export const PREFIXOS_ID = {
  posicoes: "pos",
  compras: "com",
  rendibilidades: "ren",
  vendas: "ven",
  fundo_sobrevivencia: "sal",
  fundo_maneio: "sal",
  depositos: "dep",
  governo_recebido: "rec",
  governo_utilizado: "uti",
  eventos_economia: "eve",
};
// #endregion

// #region ==================== NOMES DAS CATEGORIAS ====================
// As categorias de investimento (o campo "categoria" das posições) → o nome que aparece na app
export const NOMES_CATEGORIAS = {
  etf: "ETF's",
  cripto: "Criptomoedas",
  reit: "REIT's",
  acoes: "Ações",
  fundos: "Fundos de investimento",
  ouro: "Ouro digital",
};
// #endregion
