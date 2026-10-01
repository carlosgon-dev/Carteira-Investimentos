// Gestor dos dados da app: carrega, protege (closure, requisito 6) e guarda no localStorage.

// Os 7 ficheiros da pasta data/ (a "base de dados")
const FICHEIROS_DADOS = [
  "investimentos",
  "fundos",
  "depositos",
  "governo",
  "plano_ppr",
  "plano_ouro",
  "eventos_economia",
];

// Onde os dados ficam guardados no localStorage
const CHAVE_GUARDADA = "carteira_investimentos";

// Lê os 7 ficheiros da pasta data/ ao mesmo tempo (requisito 7)
// e junta-os num só objeto: { posicoes, compras, …, eventos_economia }
async function ler_ficheiros() {
  const ficheiros = await Promise.all(
    FICHEIROS_DADOS.map(async (nome) => {
      const resposta = await fetch(`data/${nome}.json`);
      if (!resposta.ok) throw new Error(`Não consegui ler data/${nome}.json`);
      return resposta.json();
    }),
  );
  return Object.assign({}, ...ficheiros);
}

export async function carregar_dados() {
  // 🔒 Privado: só os "botões" devolvidos em baixo lhe chegam
  const dados_no_browser = localStorage.getItem(CHAVE_GUARDADA);
  let gavetas = dados_no_browser ? JSON.parse(dados_no_browser) : await ler_ficheiros();

  const guardar = () => localStorage.setItem(CHAVE_GUARDADA, JSON.stringify(gavetas));
  if (!dados_no_browser) guardar(); // só grava se vieram dos ficheiros (1.ª vez)

  return {
    // Devolve uma cópia: quem a receber não consegue estragar os originais (requisito 3)
    ler: (nome_gaveta) => structuredClone(gavetas[nome_gaveta]),

    // Cria uma lista nova com o registo no fim (o original não é alterado)
    adicionar: (nome_gaveta, novo_registo) => {
      const lista_antiga = gavetas[nome_gaveta];
      const lista_nova = [...lista_antiga, novo_registo];
      gavetas = { ...gavetas, [nome_gaveta]: lista_nova };
      guardar();
    },

    // Cria uma lista nova sem o registo com este id (o original não é alterado)
    apagar: (nome_gaveta, id) => {
      const lista_antiga = gavetas[nome_gaveta];
      const lista_nova = lista_antiga.filter((registo) => registo.id !== id);
      gavetas = { ...gavetas, [nome_gaveta]: lista_nova };
      guardar();
    },

    // Esquece as mudanças feitas na app e volta aos dados da pasta data/
    repor: async () => {
      gavetas = await ler_ficheiros();
      guardar();
    },
  };
}
