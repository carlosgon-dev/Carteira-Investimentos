// Gestor dos dados da app: carrega, protege (closure, requisito 6) e guarda no localStorage.

// O ficheiro da base de dados: o arquivo com todas as gavetas
const FICHEIRO_DADOS = "data/dados.json";

// Onde os dados ficam guardados no localStorage
const CHAVE_GUARDADA = "carteira_investimentos";

// Lê a base de dados do ficheiro JSON (requisito 7)
async function ler_ficheiro() {
  const resposta = await fetch(FICHEIRO_DADOS);
  if (!resposta.ok) throw new Error(`Não consegui ler ${FICHEIRO_DADOS}`);
  return resposta.json();
}

export async function carregar_dados() {
  // 🔒 Privado: só os "botões" devolvidos em baixo lhe chegam
  const dados_no_browser = localStorage.getItem(CHAVE_GUARDADA);
  let arquivo = dados_no_browser ? JSON.parse(dados_no_browser) : await ler_ficheiro();

  const guardar = () => localStorage.setItem(CHAVE_GUARDADA, JSON.stringify(arquivo));
  if (!dados_no_browser) guardar(); // só grava se veio do ficheiro (1.ª vez)

  return {
    // Devolve uma cópia: quem a receber não consegue estragar os originais (requisito 3)
    ler: (nome_gaveta) => structuredClone(arquivo[nome_gaveta]),

    // Cria uma gaveta nova com o objeto no fim (o original não é alterado)
    adicionar: (nome_gaveta, novo_objeto) => {
      const gaveta_antiga = arquivo[nome_gaveta];
      const gaveta_nova = [...gaveta_antiga, novo_objeto];
      arquivo = { ...arquivo, [nome_gaveta]: gaveta_nova };
      guardar();
    },

    // Cria uma gaveta nova sem o objeto com este id (o original não é alterado)
    apagar: (nome_gaveta, id) => {
      const gaveta_antiga = arquivo[nome_gaveta];
      const gaveta_nova = gaveta_antiga.filter((objeto) => objeto.id !== id);
      arquivo = { ...arquivo, [nome_gaveta]: gaveta_nova };
      guardar();
    },

    // Esquece as mudanças feitas na app e volta aos dados do ficheiro data/dados.json
    repor: async () => {
      arquivo = await ler_ficheiro();
      guardar();
    },
  };
}
