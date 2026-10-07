// Valores fixos da app, partilhados por vários ficheiros. Nunca mudam enquanto a app corre.

// #region ==================== PREFIXOS DOS IDS ====================
// O prefixo dos ids de cada gaveta (ver gerar_id): um objeto novo em "compras" recebe "com-047"
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

// A página do menu de cada categoria (o data-pagina do botão): depois de uma compra, a app abre a página dessa categoria
export const PAGINA_DA_CATEGORIA = {
  etf: "etf",
  cripto: "cripto",
  reit: "reit",
  acoes: "acoes",
  fundos: "fundos_investimento",
  ouro: "ouro",
};
// #endregion
