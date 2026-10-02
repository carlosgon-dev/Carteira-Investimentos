// Valores fixos da app, partilhados por vários ficheiros. Nunca mudam enquanto a app corre.

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

// Os tipos de investimento (o campo "tipo" das posições) → o nome que aparece na app
export const NOMES_TIPOS = {
  etf: "ETF's",
  cripto: "Criptomoedas",
  reit: "REIT's",
  acoes: "Ações",
  fundos: "Fundos de investimento",
  ouro: "Ouro digital",
};
