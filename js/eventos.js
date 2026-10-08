// Os eventos da app: os cliques no menu e nos botões das tabelas (✎ ✓ ✕ ↩ e "+ …") e os formulários.
// Organização: o MOTOR liga 5 eventos; cada evento tem por baixo as suas funções auxiliares.
import { obter_data_hoje, gerar_id } from "./ferramentas.js";
import { PREFIXOS_ID, PAGINA_DA_CATEGORIA } from "./constantes.js";
import { desenhar_botao_cancelar } from "./graficos.js";
import { guardar_escolha_grafico_barras } from "./paginas/investimentos.js";
import { guardar_novo_registo, guardar_rascunho, apagar_rascunho } from "./paginas/formularios.js";
import { mostrar_aviso } from "./avisos.js";

// O que o main.js entrega no arranque (injeção de dependências), em ativar_eventos()
let dados;            // o gestor dos dados (ler, adicionar, editar, apagar)
let mostrar_pagina;   // a função do main.js que desenha uma página
let redesenhar_pagina_atual; // a função do main.js que volta a desenhar a página aberta
let voltar_pagina_anterior; // a função do main.js que volta à página onde se estava antes

let linha_em_espera = null; // a linha com um ✎ ou um ✕ à espera do 2.º clique
let linha_em_espera_original = ""; // como essa linha era antes do 1.º clique (para a poder repor)

// #region ==================== MOTOR ====================

// Liga os 5 eventos da app. O main.js chama isto uma vez, no arranque.
export function ativar_eventos(dependencias) {
  dados = dependencias.dados;
  mostrar_pagina = dependencias.mostrar_pagina;
  redesenhar_pagina_atual = dependencias.redesenhar_pagina_atual;
  voltar_pagina_anterior = dependencias.voltar_pagina_anterior;

  document.querySelector(".menu_lateral").addEventListener("click", tratar_clique_menu);             // evento 1
  document.addEventListener("click", tratar_clique_fora, true);                                       // evento 2
  document.querySelector("#pagina").addEventListener("click", tratar_clique_botao_tabela);           // evento 3
  document.querySelector("#pagina").addEventListener("submit", tratar_envio_formulario);             // evento 4
  document.querySelector("#pagina").addEventListener("input", tratar_escrita_formulario);            // evento 5
  // O "true" do evento 2 faz esse ouvido correr ANTES dos outros (para cancelar primeiro)
}

// #endregion

// #region ==================== EVENTO 1: CLIQUE NO MENU ====================

// O ☰ abre/fecha o menu (telemóvel). Um botão de página abre essa página (o botão diz qual, no data-pagina)
// e fecha o menu, para se ver logo a página escolhida.
function tratar_clique_menu(evento) {
  if (evento.target.closest(".menu_hamburguer")) {
    const menu_esta_aberto = document.querySelector(".menu_lateral").classList.contains("aberto");
    mostrar_menu_telemovel(!menu_esta_aberto);
    return;
  }

  const botao = evento.target.closest("[data-pagina]");
  if (!botao) return; // clicou fora de um botão
  mostrar_pagina(botao.dataset.pagina);
  mostrar_menu_telemovel(false);
}

/* ---------- Auxiliares do ☰ (menu do telemóvel) ---------- */

// Abre (true) ou fecha (false) o menu; o botão mostra ✕ quando está aberto e ☰ quando está fechado.
// No computador, a classe "aberto" não muda nada (o CSS só a usa em ecrãs estreitos).
function mostrar_menu_telemovel(abrir) {
  document.querySelector(".menu_lateral").classList.toggle("aberto", abrir);
  document.querySelector(".menu_hamburguer").textContent = abrir ? "✕" : "☰";
}

// #endregion

// #region ==================== EVENTO 2: CLIQUE FORA DA LINHA EM ESPERA ====================

// Clicar FORA da linha em espera cancela o ✎ ou o ✕: só essa linha volta ao que era.
// O resto da página não muda, por isso o clique continua (ex.: abre logo o ✎ de outra linha).
function tratar_clique_fora(evento) {
  if (!linha_em_espera) return;                          // nenhuma linha à espera
  if (linha_em_espera.contains(evento.target)) return;   // clicou dentro da linha: continua
  repor_linha_em_espera();
}

/* ---------- Auxiliares da linha em espera (também usados pelo evento 3) ---------- */

// Guarda a linha que ficou à espera e como ela era (chamar ANTES de a mudar)
function marcar_linha_em_espera(linha) {
  if (linha_em_espera === linha) return; // já estava à espera: fica o HTML original que já foi guardado
  linha_em_espera = linha;
  linha_em_espera_original = linha.innerHTML;
}

// Uma linha NOVA (do "+ …") não tinha nada antes: ao cancelar, desaparece
function marcar_linha_nova_em_espera(linha) {
  linha_em_espera = linha;
  linha_em_espera_original = null;
}

// Volta a pôr a linha em espera como era antes do 1.º clique (ou tira-a, se era nova)
function repor_linha_em_espera() {
  const era_linha_nova = linha_em_espera_original === null;
  if (era_linha_nova) linha_em_espera.remove();
  else linha_em_espera.innerHTML = linha_em_espera_original;
  linha_em_espera = null;
}

// #endregion

// #region ==================== EVENTO 3: CLIQUE NOS BOTÕES DAS TABELAS (✎ ✓ ✕ ↩ +) ====================

// Em qualquer página: cada botão diz a ação, a gaveta e o id; o switch entrega o trabalho a quem sabe
function tratar_clique_botao_tabela(evento) {
  const botao = evento.target.closest("[data-acao]");
  if (!botao) return; // clicou fora de um botão de ação

  const { acao } = botao.dataset; // este dataset tem até 3 propriedades: acao, gaveta e id
  switch (acao) {
    case "editar": tratar_clique_editar(botao); break;
    case "guardar": tratar_clique_guardar(botao); break;
    case "apagar": tratar_clique_apagar(botao); break;
    case "adicionar": tratar_clique_adicionar(botao); break;
    case "guardar_novo": tratar_clique_guardar_novo(botao); break;
    case "cancelar": repor_linha_em_espera(); break;
    case "mudar_escolha": tratar_clique_mudar_escolha(botao); break;
    case "abrir_pagina": mostrar_pagina(botao.dataset.pagina_destino); break;
    case "cancelar_formulario": tratar_clique_cancelar_formulario(botao); break;
  }
}

// Volta a desenhar a página aberta (depois de guardar ou apagar); nenhuma linha fica à espera
function atualizar_pagina_apos_alteracao() {
  linha_em_espera = null;
  redesenhar_pagina_atual();
}

/* ---------- Auxiliares do "Cancelar" dos formulários ---------- */

// Desiste do formulário: apaga o que estava escrito, volta à página anterior e avisa
function tratar_clique_cancelar_formulario(botao) {
  apagar_rascunho(botao.dataset.formulario);
  voltar_pagina_anterior();
  mostrar_aviso("↩ Operação cancelada");
}

/* ---------- Auxiliares do alternador (ex.: [Ativo | Área], [€ | %]) ---------- */

// Guarda a escolha do botão e volta a desenhar a página com ela
function tratar_clique_mudar_escolha(botao) {
  guardar_escolha_grafico_barras(botao.dataset.escolha, botao.dataset.valor);
  atualizar_pagina_apos_alteracao();
}

/* ---------- Auxiliares do "+ …" (adicionar) ---------- */

// Põe no topo da tabela uma linha nova, vazia e já a editar (a data vem com o dia de hoje).
// Os títulos das colunas dizem que campo criar em cada célula.
function tratar_clique_adicionar(botao) {
  const tabela = botao.closest(".painel").querySelector("table");
  const titulos_colunas = [...tabela.querySelectorAll("th")];
  const html_celulas = titulos_colunas.map((titulo_coluna) => desenhar_celula_nova(titulo_coluna, botao.dataset.gaveta)).join("");

  const nova_linha = tabela.tBodies[0].insertRow(0); // insertRow(0) = no topo
  nova_linha.innerHTML = html_celulas;
  marcar_linha_nova_em_espera(nova_linha);
}

// Uma célula da linha nova: um campo vazio (data de hoje nas datas) ou, na coluna dos botões, o ✓ e o ↩
function desenhar_celula_nova(titulo_coluna, nome_gaveta) {
  const { campo_editavel, tipo_campo } = titulo_coluna.dataset;
  if (!campo_editavel) {
    return `
      <td>
        <div class="botoes_linha">
          <button type="button" class="botao_icone" data-acao="guardar_novo" data-gaveta="${nome_gaveta}" title="Guardar">✓</button>
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

// O campo de escrever de uma célula em edição (usado pelo "+ …" e pelo ✎).
//   pistas: o dataset da célula ou do título da coluna (tipo_campo e, se houver, minimo e maximo)
function desenhar_campo_edicao(pistas, valor) {
  const atributo_min = pistas.minimo !== undefined ? `min="${obter_limite(pistas.minimo)}"` : "";
  const atributo_max = pistas.maximo !== undefined ? `max="${obter_limite(pistas.maximo)}"` : "";
  return `<input class="campo_tabela" type="${pistas.tipo_campo}" step="any" ${atributo_min} ${atributo_max} required value="${valor}">`;
}

// Um limite de um campo: "hoje" passa à data de hoje ("2026-10-02"); os outros ficam como estão
function obter_limite(limite) {
  return limite === "hoje" ? obter_data_hoje() : limite;
}

/* ---------- Auxiliares do ✎ (editar) ---------- */

// Põe a linha a editar: cada célula editável passa a um campo com o valor original, e o ✎ passa a ✓
function tratar_clique_editar(botao) {
  const { gaveta, id } = botao.dataset;
  const objeto = dados.ler(gaveta).find((objeto_gaveta) => objeto_gaveta.id === id);
  const linha = botao.closest("tr");
  marcar_linha_em_espera(linha);

  linha.querySelectorAll("[data-campo_editavel]").forEach((celula) => {
    const valor_original = objeto[celula.dataset.campo_editavel];
    celula.innerHTML = desenhar_campo_edicao(celula.dataset, valor_original);
  });

  botao.dataset.acao = "guardar"; // o próximo clique neste botão guarda
  botao.textContent = "✓";
  trocar_por_cancelar(linha, "apagar"); // o ✕ dá lugar ao ↩
}

// Na linha em espera, o botão desta ação passa a ↩ (cancelar)
function trocar_por_cancelar(linha, acao) {
  linha.querySelector(`[data-acao="${acao}"]`).outerHTML = desenhar_botao_cancelar();
}

/* ---------- Auxiliares do ✓ (guardar) ---------- */

// O ✓ do ✎: guarda os valores novos no objeto que já existe e volta a desenhar a página
function tratar_clique_guardar(botao) {
  const linha = botao.closest("tr");
  if (!validar_campos_linha(linha)) return;

  dados.editar(botao.dataset.gaveta, botao.dataset.id, ler_valores_linha(linha));
  atualizar_pagina_apos_alteracao();
  mostrar_aviso("✓ Alteração guardada");
}

// O ✓ da linha nova (do "+ …"): cria o objeto com um id novo e acrescenta-o à gaveta
function tratar_clique_guardar_novo(botao) {
  const linha = botao.closest("tr");
  if (!validar_campos_linha(linha)) return;

  const nome_gaveta = botao.dataset.gaveta;
  const id_novo = gerar_id(dados.ler(nome_gaveta), PREFIXOS_ID[nome_gaveta]);
  const novo_objeto = { id: id_novo, ...ler_valores_linha(linha) };
  dados.adicionar(nome_gaveta, novo_objeto);
  atualizar_pagina_apos_alteracao();
  mostrar_aviso("✓ Registo adicionado");
}

// Os campos da linha estão bem preenchidos? Se algum não estiver (vazio, ou fora dos limites),
// o browser mostra o aviso junto a ele e a resposta é false
function validar_campos_linha(linha) {
  const campos = [...linha.querySelectorAll(".campo_tabela")];
  const campo_invalido = campos.find((campo) => !campo.checkValidity());
  if (!campo_invalido) return true;
  campo_invalido.reportValidity();
  return false;
}

// Os valores escritos nos campos da linha, num objeto: { data: "2026-10-02", saldo: 3000 }
function ler_valores_linha(linha) {
  const valores = {};
  linha.querySelectorAll("[data-campo_editavel]").forEach((celula) => {
    valores[celula.dataset.campo_editavel] = ler_valor_campo(celula);
  });
  return valores;
}

// O valor escrito no campo de uma célula; os números passam a número ("3000" → 3000)
function ler_valor_campo(celula) {
  const valor_escrito = celula.querySelector("input").value;
  return celula.dataset.tipo_campo === "number" ? Number(valor_escrito) : valor_escrito;
}

/* ---------- Auxiliares do ✕ (apagar) ---------- */

// Apaga em 2 cliques: o 1.º só pede confirmação (✕ passa a ✓), o 2.º apaga mesmo.
// O próprio botão diz a gaveta e o id do objeto a apagar.
function tratar_clique_apagar(botao) {
  const esta_a_confirmar = botao.classList.contains("a_confirmar");
  if (!esta_a_confirmar) {
    const linha = botao.closest("tr");
    marcar_linha_em_espera(linha);
    botao.classList.add("a_confirmar");
    botao.textContent = "✓";
    trocar_por_cancelar(linha, "editar"); // o ✎ dá lugar ao ↩
    return;
  }
  dados.apagar(botao.dataset.gaveta, botao.dataset.id);
  atualizar_pagina_apos_alteracao();
  mostrar_aviso("✓ Registo apagado");
}
// #endregion

// #region ==================== EVENTO 4: GUARDAR UM FORMULÁRIO (submit) ====================

// Quando se carrega no botão "Guardar" de um formulário. O browser só deixa chegar aqui se os campos
// estiverem bem preenchidos (required, min, max): se não estiverem, ele próprio mostra o aviso.
function tratar_envio_formulario(evento) {
  evento.preventDefault(); // sem isto, o browser recarregava a página (é o que um <form> faz por defeito)
  const formulario = evento.target;

  switch (formulario.dataset.formulario) {
    case "novo_registo": tratar_envio_novo_registo(formulario); break;
  }
}

/* ---------- Auxiliares dos formulários ---------- */

// Guarda a compra e abre a página da categoria dela (ex.: ETF's), onde já aparece
function tratar_envio_novo_registo(formulario) {
  const { categoria, nome_ativo } = guardar_novo_registo(dados, formulario);
  mostrar_pagina(PAGINA_DA_CATEGORIA[categoria]);
  mostrar_aviso(`✓ Compra de ${nome_ativo} guardada`);
}
// #endregion

// #region ==================== EVENTO 5: ESCREVER NUM FORMULÁRIO (input) ====================

// A cada letra escrita (ou opção escolhida) num formulário, guarda o rascunho no sessionStorage
function tratar_escrita_formulario(evento) {
  const formulario = evento.target.closest("form[data-formulario]");
  if (!formulario) return; // escreveu noutro sítio (ex.: num campo de uma tabela a editar)
  guardar_rascunho(formulario);
}
// #endregion
