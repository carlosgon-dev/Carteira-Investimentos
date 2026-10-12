// #region ==================== IMPORTS ====================
import { carregar_dados } from "./gestor_dados.js";
import { ativar_eventos } from "./eventos.js";
import { mostrar_surpresa_depois_de_esperar } from "./surpresa.js";
import { ativar_rodape_cotacoes } from "./cotacoes.js";
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
const PAGINAS = {
  carteira: desenhar_pagina_carteira,
  fundos: desenhar_pagina_fundos,

  // Rendimentos
  depositos: desenhar_pagina_depositos,
  governo: desenhar_pagina_governo,
  mais_valias: desenhar_pagina_mais_valias,

  // Investimentos 
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
let dados; 
let pagina_atual; 
let pagina_anterior; 

const CHAVE_SESSIONSTORAGE_PAGINA_ABERTA = "pagina_aberta";
const PAGINA_INICIAL = "carteira";
// #endregion

// #region ==================== NAVEGAÇÃO ====================
function mostrar_pagina(nome_pagina) {
  if (nome_pagina !== pagina_atual) pagina_anterior = pagina_atual; 
  pagina_atual = nome_pagina;
  sessionStorage.setItem(CHAVE_SESSIONSTORAGE_PAGINA_ABERTA, nome_pagina); 
  const funcao_desenhar_pagina = PAGINAS[nome_pagina];
  zona_pagina.innerHTML = funcao_desenhar_pagina ? funcao_desenhar_pagina(dados) : `<h2>EM CONSTRUÇÃO</h2>`;
  marcar_botao_ativo(nome_pagina);
}

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
    ativar_eventos({
      dados,
      mostrar_pagina,
      redesenhar_pagina_atual: () => mostrar_pagina(pagina_atual),
      voltar_pagina_anterior: () => mostrar_pagina(pagina_anterior ?? PAGINA_INICIAL),
    });
    mostrar_pagina(sessionStorage.getItem(CHAVE_SESSIONSTORAGE_PAGINA_ABERTA) ?? PAGINA_INICIAL);
    mostrar_surpresa_depois_de_esperar(); 
    ativar_rodape_cotacoes(); 
  } catch (erro) {
    console.error(erro);
    zona_pagina.innerHTML = `<p class="erro">Não consegui carregar os dados. ${erro.message}</p>`;
  }
}

arrancar();
// #endregion
