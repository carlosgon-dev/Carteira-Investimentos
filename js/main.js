// 🚀 Ponto de entrada: arranque da app + navegação entre páginas. Os cliques estão no eventos.js.
// #region ==================== IMPORTS ====================
import { carregar_dados } from "./gestor_dados.js";
import { ativar_eventos } from "./eventos.js";
import { mostrar_surpresa_depois_de_esperar } from "./surpresa.js";
import { desenhar_pagina_carteira } from "./paginas/carteira.js";
import { desenhar_pagina_fundos } from "./paginas/fundos.js";
import { desenhar_pagina_depositos } from "./paginas/depositos.js";
import { desenhar_pagina_governo } from "./paginas/governo.js";
import { desenhar_pagina_mais_valias } from "./paginas/mais_valias.js";
import { desenhar_pagina_investimento } from "./paginas/investimentos.js";
import { desenhar_pagina_ppr } from "./paginas/ppr.js";
import { desenhar_pagina_ouro } from "./paginas/ouro.js";
import { desenhar_pagina_historico } from "./paginas/historico.js";
import { desenhar_pagina_calendario } from "./paginas/calendario.js";
import { desenhar_pagina_novo_registo, desenhar_pagina_registar_rendibilidade, desenhar_pagina_registar_venda } from "./paginas/formularios.js";
// #endregion

// #region ==================== PÁGINAS DO MENU ====================
// Cada botão do menu (data-pagina) → a função que desenha essa página
const PAGINAS = {
  carteira: desenhar_pagina_carteira,
  fundos: desenhar_pagina_fundos,

  // Rendimentos
  depositos: desenhar_pagina_depositos,
  governo: desenhar_pagina_governo,
  mais_valias: desenhar_pagina_mais_valias,

  // Investimentos (os 5 primeiros usam a mesma função, só muda o tipo)
  etf: (dados) => desenhar_pagina_investimento(dados, "etf"),
  cripto: (dados) => desenhar_pagina_investimento(dados, "cripto"),
  reit: (dados) => desenhar_pagina_investimento(dados, "reit"),
  acoes: (dados) => desenhar_pagina_investimento(dados, "acoes"),
  fundos_investimento: (dados) => desenhar_pagina_investimento(dados, "fundos"),
  ppr: desenhar_pagina_ppr,
  ouro: desenhar_pagina_ouro,
  historico: desenhar_pagina_historico,
  calendario: desenhar_pagina_calendario,

  // Formulários
  novo_registo: desenhar_pagina_novo_registo,
  registar_rendibilidade: desenhar_pagina_registar_rendibilidade,
  registar_venda: desenhar_pagina_registar_venda,
};
// #endregion

// #region ==================== VARIÁVEIS PARTILHADAS ====================
const zona_pagina = document.querySelector("#pagina");
let dados; // o cofre dos dados: fica preenchido no arranque
let pagina_atual; // a página que está aberta (para a redesenhar depois de guardar ou apagar)
// #endregion

// #region ==================== NAVEGAÇÃO ====================
function mostrar_pagina(nome_pagina) {
  pagina_atual = nome_pagina;
  const funcao_desenhar_pagina = PAGINAS[nome_pagina]; // a função que desenha esta página (ou undefined)
  zona_pagina.innerHTML = funcao_desenhar_pagina ? funcao_desenhar_pagina(dados) : `<h2>EM CONSTRUÇÃO</h2>`;
  marcar_botao_ativo(nome_pagina);
}

// Pinta no menu só o botão da página aberta
function marcar_botao_ativo(nome_pagina) {
  document.querySelectorAll("[data-pagina]").forEach((botao) => {
    botao.classList.toggle("ativo", botao.dataset.pagina === nome_pagina);
  });
}
// #endregion

// #region ==================== ARRANQUE ====================
async function arrancar() {
  try {
    dados = await carregar_dados();
    // Entrega ao eventos.js o que ele precisa (injeção de dependências)
    ativar_eventos({
      dados,
      mostrar_pagina,
      redesenhar_pagina_atual: () => mostrar_pagina(pagina_atual),
    });
    mostrar_pagina("carteira");
    mostrar_surpresa_depois_de_esperar(); // sem await: a app continua a funcionar enquanto espera
  } catch (erro) {
    console.error(erro);
    zona_pagina.innerHTML = `<p class="erro">Não consegui carregar os dados. ${erro.message}</p>`;
  }
}

arrancar();
// #endregion
