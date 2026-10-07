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

// #region ==================== NOMES DOS TIPOS ====================
// Os tipos de investimento (o campo "tipo" das posições) → o nome que aparece na app
export const NOMES_TIPOS = {
  etf: "ETF's",
  cripto: "Criptomoedas",
  reit: "REIT's",
  acoes: "Ações",
  fundos: "Fundos de investimento",
  ouro: "Ouro digital",
};

// A página do menu de cada tipo (o data-pagina do botão): depois de uma compra, a app abre a página desse tipo
export const PAGINA_DO_TIPO = {
  etf: "etf",
  cripto: "cripto",
  reit: "reit",
  acoes: "acoes",
  fundos: "fundos_investimento",
  ouro: "ouro",
};
// #endregion
