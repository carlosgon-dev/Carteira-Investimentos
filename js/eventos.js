import { obter_data_hoje, gerar_id } from "./ferramentas.js";
import { PREFIXOS_ID } from "./constantes.js";
import { desenhar_botao_cancelar } from "./graficos.js";
import { guardar_escolha_grafico_barras } from "./paginas/investimentos.js";
import { guardar_novo_registo, guardar_rascunho_sessionstorage, apagar_rascunho_sessionstorage } from "./paginas/formularios.js";
import { mostrar_notificacao } from "./notificacoes.js";

// #region ==================== CONSTANTES ====================
const PAGINA_DA_CATEGORIA = {
  etf: "etf",
  cripto: "cripto",
  reit: "reit",
  acoes: "acoes",
  fundos: "fundos_investimento",
  ouro: "ouro",
};
// #endregion

let dados;            
let mostrar_pagina;   
let redesenhar_pagina_atual; 
let voltar_pagina_anterior; 

let linha_em_espera = null; 
let linha_em_espera_original = ""; 

// #region ==================== MOTOR ====================

export function ativar_eventos(ferramentas_do_main) {
  dados = ferramentas_do_main.dados;
  mostrar_pagina = ferramentas_do_main.mostrar_pagina;
  redesenhar_pagina_atual = ferramentas_do_main.redesenhar_pagina_atual;
  voltar_pagina_anterior = ferramentas_do_main.voltar_pagina_anterior;

  document.querySelector(".menu_lateral").addEventListener("click", tratar_clique_menu);             
  document.addEventListener("click", tratar_clique_fora_da_linha_em_espera, true);                                     
  document.querySelector("#pagina").addEventListener("click", tratar_clique_botao_tabela);           
  document.querySelector("#pagina").addEventListener("submit", tratar_guardar_formulario);             
  document.querySelector("#pagina").addEventListener("input", atualizar_rascunho_sessionstorage);            
}
// #endregion

// #region ==================== EVENTO 1: CLIQUE NO MENU ====================

function tratar_clique_menu(evento) {
  if (evento.target.closest(".menu_hamburguer")) {
    const menu_esta_aberto = document.querySelector(".menu_lateral").classList.contains("aberto");
    abrir_fechar_menu_telemovel(!menu_esta_aberto);
    return;
  }

  if (evento.target.closest('[data-acao="repor_dados"]')) {
    tratar_clique_repor_dados();
    return;
  }

  const botao = evento.target.closest("[data-pagina]");
  if (!botao) return
  mostrar_pagina(botao.dataset.pagina);
  abrir_fechar_menu_telemovel(false);
}

/* ---------- Auxiliares do ☰ (menu do telemóvel) ---------- */

function abrir_fechar_menu_telemovel(abrir) {
  document.querySelector(".menu_lateral").classList.toggle("aberto", abrir);
  document.querySelector(".menu_hamburguer").textContent = abrir ? "✕" : "☰";
}

/* ---------- Auxiliares do "Repor dados iniciais" ---------- */

async function tratar_clique_repor_dados() {
  const quer_repor = confirm("Apagar todas as alterações e voltar aos dados iniciais?");
  if (!quer_repor) return;

  try {
    await dados.repor();
  } catch {
    mostrar_notificacao("✕ Não consegui repor os dados");
    return;
  }
  abrir_fechar_menu_telemovel(false);
  atualizar_pagina_apos_alteracao();
  mostrar_notificacao("↩ Dados iniciais repostos");
}

// #endregion

// #region ==================== EVENTO 2: CLIQUE FORA DA LINHA EM ESPERA ====================

function tratar_clique_fora_da_linha_em_espera(evento) {
  if (!linha_em_espera) return;                          
  if (linha_em_espera.contains(evento.target)) return;   
  repor_linha_em_espera();
}

/* ---------- Auxiliares da linha em espera (também usados pelo evento 3) ---------- */

function memorizar_linha_em_espera(linha) {
  if (linha_em_espera === linha) return; 
  linha_em_espera = linha;
  linha_em_espera_original = linha.innerHTML;
}

function memorizar_linha_nova_em_espera(linha) {
  linha_em_espera = linha;
  linha_em_espera_original = null;
}

function repor_linha_em_espera() {
  const era_linha_nova = linha_em_espera_original === null;
  if (era_linha_nova) linha_em_espera.remove();
  else linha_em_espera.innerHTML = linha_em_espera_original;
  linha_em_espera = null;
}

// #endregion

// #region ==================== EVENTO 3: CLIQUE NOS BOTÕES DAS TABELAS (✎ ✓ ✕ ↩ +) ====================

function tratar_clique_botao_tabela(evento) {
  const botao = evento.target.closest("[data-acao]");
  if (!botao) return;

  const { acao } = botao.dataset; // este dataset tem até 3 propriedades: acao, gaveta e id
  switch (acao) {
    case "editar": tratar_clique_editar(botao); break;
    case "guardar": tratar_clique_guardar_alteracao(botao); break;
    case "apagar": tratar_clique_apagar(botao); break;
    case "adicionar": tratar_clique_adicionar(botao); break;
    case "guardar_linha_nova": tratar_clique_guardar_linha_nova(botao); break;
    case "cancelar": repor_linha_em_espera(); break;
    case "mudar_escolha": tratar_clique_mudar_escolha(botao); break;
    case "abrir_pagina": mostrar_pagina(botao.dataset.pagina_destino); break;
    case "cancelar_formulario": tratar_clique_cancelar_formulario(botao); break;
  }
}

function atualizar_pagina_apos_alteracao() {
  linha_em_espera = null;
  redesenhar_pagina_atual();
}

// #region  ---------- Auxiliares do "Cancelar" dos formulários ---------- */

function tratar_clique_cancelar_formulario(botao) {
  apagar_rascunho_sessionstorage(botao.dataset.formulario);
  voltar_pagina_anterior();
  mostrar_notificacao("↩ Operação cancelada");
}

// #endregion 

// #region ---------- Auxiliares do alternador (ex.: [Ativo | Área], [€ | %]) ---------- 

function tratar_clique_mudar_escolha(botao) {
  guardar_escolha_grafico_barras(botao.dataset.escolha, botao.dataset.valor);
  atualizar_pagina_apos_alteracao();
}

// #endregion


/* ---------- Auxiliares do "+ …" (adicionar) ---------- */

function tratar_clique_adicionar(botao) {
  const tabela = botao.closest(".painel").querySelector("table");
  const titulos_colunas = [...tabela.querySelectorAll("th")];
  const html_celulas = titulos_colunas.map((titulo_coluna) => desenhar_celula_nova(titulo_coluna, botao.dataset.gaveta)).join("");

  const nova_linha = tabela.tBodies[0].insertRow(0);
  nova_linha.innerHTML = html_celulas;
  memorizar_linha_nova_em_espera(nova_linha);
}

function desenhar_celula_nova(titulo_coluna, nome_gaveta) {
  const { campo_editavel, tipo_campo } = titulo_coluna.dataset;
  if (!campo_editavel) {
    return `
      <td>
        <div class="botoes_linha">
          <button type="button" class="botao_icone" data-acao="guardar_linha_nova" data-gaveta="${nome_gaveta}" title="Guardar">✓</button>
          ${desenhar_botao_cancelar()}
        </div>
      </td>
    `;
  }

  const valor_inicial = tipo_campo === "date" ? obter_data_hoje() : "";
  return `
    <td class="${titulo_coluna.className}" data-campo_editavel="${campo_editavel}" data-tipo_campo="${tipo_campo}">
      ${desenhar_campo_edicao(titulo_coluna.dataset, valor_inicial)}
    </td>
  `;
}

function desenhar_campo_edicao(pistas, valor) {
  const atributo_min = pistas.minimo !== undefined ? `min="${obter_limite(pistas.minimo)}"` : "";
  const atributo_max = pistas.maximo !== undefined ? `max="${obter_limite(pistas.maximo)}"` : "";
  return `<input class="campo_tabela" type="${pistas.tipo_campo}" step="any" ${atributo_min} ${atributo_max} required value="${valor}">`;
}

function obter_limite(limite) {
  return limite === "hoje" ? obter_data_hoje() : limite;
}

// #region  ---------- Auxiliares do ✎ (editar) ---------- 

function tratar_clique_editar(botao) {
  const { gaveta, id } = botao.dataset;
  const objeto = dados.ler(gaveta).find((objeto_gaveta) => objeto_gaveta.id === id);
  const linha = botao.closest("tr");
  memorizar_linha_em_espera(linha);

  linha.querySelectorAll("[data-campo_editavel]").forEach((celula) => {
    const valor_original = objeto[celula.dataset.campo_editavel];
    celula.innerHTML = desenhar_campo_edicao(celula.dataset, valor_original);
  });

  botao.dataset.acao = "guardar"; 
  botao.textContent = "✓";
  trocar_botao_por_cancelar(linha, "apagar"); 
}

function trocar_botao_por_cancelar(linha, acao) {
  linha.querySelector(`[data-acao="${acao}"]`).outerHTML = desenhar_botao_cancelar();
}

// #endregion


// #region ---------- Auxiliares do ✓ (guardar) ----------

function tratar_clique_guardar_alteracao(botao) {
  const linha = botao.closest("tr");
  if (!validar_campos_linha(linha)) return;

  dados.editar(botao.dataset.gaveta, botao.dataset.id, ler_valores_linha(linha));
  atualizar_pagina_apos_alteracao();
  mostrar_notificacao("✓ Alteração guardada");
}

function tratar_clique_guardar_linha_nova(botao) {
  const linha = botao.closest("tr");
  if (!validar_campos_linha(linha)) return;

  const nome_gaveta = botao.dataset.gaveta;
  const id_novo = gerar_id(dados.ler(nome_gaveta), PREFIXOS_ID[nome_gaveta]);
  const novo_objeto = { id: id_novo, ...ler_valores_linha(linha) };
  dados.adicionar(nome_gaveta, novo_objeto);
  atualizar_pagina_apos_alteracao();
  mostrar_notificacao("✓ Registo adicionado");
}

function validar_campos_linha(linha) {
  const campos = [...linha.querySelectorAll(".campo_tabela")];
  const campo_invalido = campos.find((campo) => !campo.checkValidity());
  if (!campo_invalido) return true;
  campo_invalido.reportValidity();
  return false;
}

function ler_valores_linha(linha) {
  const valores = {};
  linha.querySelectorAll("[data-campo_editavel]").forEach((celula) => {
    valores[celula.dataset.campo_editavel] = ler_valor_campo(celula);
  });
  return valores;
}

function ler_valor_campo(celula) {
  const valor_escrito = celula.querySelector("input").value;
  return celula.dataset.tipo_campo === "number" ? Number(valor_escrito) : valor_escrito;
}

// #endregion

// #region ---------- Auxiliares do ✕ (apagar) ---------- 

function tratar_clique_apagar(botao) {
  const esta_a_confirmar = botao.classList.contains("a_confirmar");
  if (!esta_a_confirmar) {
    const linha = botao.closest("tr");
    memorizar_linha_em_espera(linha);
    botao.classList.add("a_confirmar");
    botao.textContent = "✓";
    trocar_botao_por_cancelar(linha, "editar"); 
    return;
  }
  dados.apagar(botao.dataset.gaveta, botao.dataset.id);
  atualizar_pagina_apos_alteracao();
  mostrar_notificacao("✓ Registo apagado");
}
// #endregion

// #region ==================== EVENTO 4: GUARDAR UM FORMULÁRIO (submit) ====================

function tratar_guardar_formulario(evento) {
  evento.preventDefault(); 
  const formulario = evento.target;

  switch (formulario.dataset.formulario) {
    case "novo_registo": tratar_guardar_novo_registo(formulario); break;
  }
}

/* ---------- Auxiliares dos formulários ---------- */

function tratar_guardar_novo_registo(formulario) {
  const { categoria, nome_ativo } = guardar_novo_registo(dados, formulario);
  mostrar_pagina(PAGINA_DA_CATEGORIA[categoria]);
  mostrar_notificacao(`✓ Compra de ${nome_ativo} guardada`);
}
// #endregion

// #region ==================== EVENTO 5: ESCREVER NUM FORMULÁRIO (input) ====================

function atualizar_rascunho_sessionstorage(evento) {
  const formulario = evento.target.closest("form[data-formulario]");
  if (!formulario) return; 
  guardar_rascunho_sessionstorage(formulario);
}
// #endregion
