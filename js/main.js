// 🚀 Ponto de entrada: arranque da app + eventos.
import { carregar_dados } from "./gestor_dados.js";
import { desenhar_carteira } from "./paginas/carteira.js";
import { desenhar_fundos } from "./paginas/fundos.js";
import { desenhar_depositos } from "./paginas/depositos.js";
import { desenhar_governo } from "./paginas/governo.js";
import { desenhar_mais_valias } from "./paginas/mais_valias.js";
import { desenhar_investimento } from "./paginas/investimentos.js";
import { desenhar_ppr } from "./paginas/ppr.js";
import { desenhar_ouro } from "./paginas/ouro.js";
import { desenhar_historico } from "./paginas/historico.js";
import { desenhar_calendario } from "./paginas/calendario.js";
import { desenhar_novo_registo, desenhar_registar_rendibilidade, desenhar_registar_venda } from "./paginas/formularios.js";

// Cada botão do menu (data-pagina) → a função que desenha essa página
const PAGINAS = {
  carteira: desenhar_carteira,
  fundos: desenhar_fundos,

  // Rendimentos
  depositos: desenhar_depositos,
  governo: desenhar_governo,
  mais_valias: desenhar_mais_valias,

  // Investimentos (os 5 primeiros usam a mesma função, só muda o tipo)
  etf: (dados) => desenhar_investimento(dados, "etf"),
  cripto: (dados) => desenhar_investimento(dados, "cripto"),
  reit: (dados) => desenhar_investimento(dados, "reit"),
  acoes: (dados) => desenhar_investimento(dados, "acoes"),
  fundos_investimento: (dados) => desenhar_investimento(dados, "fundos"),
  ppr: desenhar_ppr,
  ouro: desenhar_ouro,
  historico: desenhar_historico,

  calendario: desenhar_calendario,

  // Formulários
  novo_registo: desenhar_novo_registo,
  registar_rendibilidade: desenhar_registar_rendibilidade,
  registar_venda: desenhar_registar_venda,
};

const zona_pagina = document.querySelector("#pagina");
let dados; // o cofre dos dados: fica preenchido no arranque
let pagina_atual; // a página que está aberta (para a redesenhar depois de apagar)

// ---------- Navegação ----------
function mostrar_pagina(nome_pagina) {
  pagina_atual = nome_pagina;
  const desenhar_pagina = PAGINAS[nome_pagina];
  zona_pagina.innerHTML = desenhar_pagina ? desenhar_pagina(dados) : `<h2>EM CONSTRUÇÃO</h2>`;
  marcar_botao_ativo(nome_pagina);
}

// Pinta no menu só o botão da página aberta
function marcar_botao_ativo(nome_pagina) {
  document.querySelectorAll("[data-pagina]").forEach((botao) => {
    botao.classList.toggle("ativo", botao.dataset.pagina === nome_pagina);
  });
}

// ---------- Eventos ----------
document.querySelector(".menu_lateral").addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-pagina]");
  if (!botao) return; // clicou fora de um botão
  mostrar_pagina(botao.dataset.pagina);
});

// Botões ✎ ✕ das tabelas, em qualquer página (cada botão diz a ação, a gaveta e o id)
zona_pagina.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-acao]");
  if (!botao) return; // clicou fora de um botão de ação

  const { acao } = botao.dataset; //este dataset tem 3 propriedades: acao, gaveta e id
  if (acao === "editar") tratar_clique_editar(botao);
  else (acao === "apagar") tratar_clique_apagar(botao);
);


function tratar_clique_editar(botao) {
  const { gaveta, id } = botao.dataset;
  if (gaveta === "fundo_sobrevivencia" || gaveta === "fundo_maneio") {
    mostrar_pagina("registar_rendibilidade");
    return;
  }


// O ✕ apaga em 2 cliques: o 1.º só pede confirmação (✕ passa a ✓), o 2.º apaga mesmo.
// O próprio botão diz a gaveta e o id do objeto a apagar.
function tratar_clique_apagar(botao) {
  const esta_a_confirmar = botao.classList.contains("a_confirmar");
  if (!esta_a_confirmar) {
    botao.classList.add("a_confirmar");
    botao.textContent = "✓";
    return;
  }
  dados.apagar(botao.dataset.gaveta, botao.dataset.id);
  mostrar_pagina(pagina_atual);
}

// ---------- Arranque ----------
async function arrancar() {
  try {
    dados = await carregar_dados();
    mostrar_pagina("carteira");
  } catch (erro) {
    console.error(erro);
    zona_pagina.innerHTML = `<p class="erro">Não consegui carregar os dados. ${erro.message}</p>`;
  }
}

arrancar();
