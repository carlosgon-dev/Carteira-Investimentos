// #region ==================== CONSTANTES ====================
const FICHEIRO_DADOS = "data/dados.json";
const CHAVE_LOCALSTORAGE_DADOS = "carteira_investimentos";
// #endregion

// #region ==================== LER O FICHEIRO ====================
async function ler_ficheiro() {
  const resposta = await fetch(FICHEIRO_DADOS);
  if (!resposta.ok) throw new Error(`Não consegui ler ${FICHEIRO_DADOS}`);
  return resposta.json();
}
// #endregion

// #region ==================== O COFRE DOS DADOS (CLOSURE) ====================
export async function carregar_dados() {
  const dados_no_browser = localStorage.getItem(CHAVE_LOCALSTORAGE_DADOS);
  let arquivo = dados_no_browser ? JSON.parse(dados_no_browser) : await ler_ficheiro();

  const guardar = () => localStorage.setItem(CHAVE_LOCALSTORAGE_DADOS, JSON.stringify(arquivo));
  if (!dados_no_browser) guardar(); 

  return {
    ler: (nome_gaveta) => structuredClone(arquivo[nome_gaveta]),

    adicionar: (nome_gaveta, novo_objeto) => {
      const gaveta_antiga = arquivo[nome_gaveta];
      const gaveta_nova = [...gaveta_antiga, novo_objeto];
      arquivo = { ...arquivo, [nome_gaveta]: gaveta_nova };
      guardar();
    },

    apagar: (nome_gaveta, id) => {
      const gaveta_antiga = arquivo[nome_gaveta];
      const gaveta_nova = gaveta_antiga.filter((objeto) => objeto.id !== id);
      arquivo = { ...arquivo, [nome_gaveta]: gaveta_nova };
      guardar();
    },

    editar: (nome_gaveta, id, valores_novos) => {
      const gaveta_antiga = arquivo[nome_gaveta];
      const gaveta_nova = gaveta_antiga.map((objeto) => (objeto.id === id ? { ...objeto, ...valores_novos } : objeto));
      arquivo = { ...arquivo, [nome_gaveta]: gaveta_nova };
      guardar();
    },

    repor: async () => {
      arquivo = await ler_ficheiro();
      guardar();
    },
  };
}
// #endregion
