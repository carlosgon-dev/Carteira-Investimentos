// 🚀 Ponto de entrada: arranque da app + eventos.
import { carregar_dados } from "./gestor_dados.js";
import { obter_data_hoje, gerar_id } from "./ferramentas.js";
import { PREFIXOS_ID } from "./constantes.js";
import { desenhar_botao_cancelar } from "./graficos.js";
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
let linha_em_espera = null; // a linha com um ✎ ou um ✕ à espera do 2.º clique
let html_original_linha = ""; // como essa linha era antes do 1.º clique (para a poder repor)

// ---------- Navegação ----------
function mostrar_pagina(nome_pagina) {
  pagina_atual = nome_pagina;
  linha_em_espera = null; // ao redesenhar, nenhuma linha fica à espera
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

// Clicar FORA da linha em espera cancela o ✎ ou o ✕: só essa linha volta ao que era.
// O resto da página não muda, por isso o clique continua (ex.: abre logo o ✎ de outra linha).
// O "true" no fim faz este ouvido correr ANTES dos outros (para cancelar primeiro).
document.addEventListener("click", (evento) => {
  if (!linha_em_espera) return;                          // nenhuma linha à espera
  if (linha_em_espera.contains(evento.target)) return;   // clicou dentro da linha: continua
  repor_linha_em_espera();
}, true);

// Guarda a linha que ficou à espera e como ela era (chamar ANTES de a mudar)
function marcar_linha_em_espera(linha) {
  if (linha_em_espera === linha) return; // já estava à espera: fica o HTML original que já foi guardado
  linha_em_espera = linha;
  html_original_linha = linha.innerHTML;
}

// Uma linha NOVA (do "+ …") não tinha nada antes: ao cancelar, desaparece
function marcar_linha_nova_em_espera(linha) {
  linha_em_espera = linha;
  html_original_linha = null;
}

// Volta a pôr a linha em espera como era antes do 1.º clique (ou tira-a, se era nova)
function repor_linha_em_espera() {
  const era_linha_nova = html_original_linha === null;
  if (era_linha_nova) linha_em_espera.remove();
  else linha_em_espera.innerHTML = html_original_linha;
  linha_em_espera = null;
}

// Botões ✎ ✕ das tabelas, em qualquer página (cada botão diz a ação, a gaveta e o id)
zona_pagina.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-acao]");
  if (!botao) return; // clicou fora de um botão de ação

  const { acao } = botao.dataset; // este dataset tem 3 propriedades: acao, gaveta e id
  switch (acao) {
    case "editar": tratar_clique_editar(botao); break;
    case "guardar": tratar_clique_guardar(botao);  break;
    case "apagar": tratar_clique_apagar(botao); break;
    case "adicionar": tratar_clique_adicionar(botao); break;
    case "guardar_novo": tratar_clique_guardar_novo(botao); break;
    case "cancelar": repor_linha_em_espera(); break;
  }
});

// O "+ …" põe no topo da tabela uma linha nova, vazia e já a editar (a data vem com o dia de hoje).
// Os títulos das colunas dizem que campo criar em cada célula.
function tratar_clique_adicionar(botao) {
  const tabela = botao.closest(".painel").querySelector("table");
  const titulos_colunas = [...tabela.querySelectorAll("th")];
  const html_celulas = titulos_colunas.map((titulo_coluna) => desenhar_celula_nova(titulo_coluna, botao.dataset.gaveta)).join("");

  const nova_linha = tabela.tBodies[0].insertRow(0); // insertRow(0) = no topo
  nova_linha.innerHTML = html_celulas;
  marcar_linha_nova_em_espera(nova_linha);
}

// Uma célula da linha nova: um campo vazio (data de hoje nas datas) ou, na coluna dos botões, o ✓
function desenhar_celula_nova(titulo_coluna, nome_gaveta) {
  const { campo_editavel, tipo_campo, minimo } = titulo_coluna.dataset;
  if (!campo_editavel) {
    return `
      <td>
        <div class="botoes_linha">
          <button type="button" class="botao_icone" data-acao="guardar_novo" data-gaveta="${nome_gaveta}" title="Guardar" aria-label="Guardar">✓</button>
          ${desenhar_botao_cancelar()}
        </div>
      </td>
    `;
  }
  const valor_inicial = tipo_campo === "date" ? obter_data_hoje() : "";
  const atributo_minimo = minimo !== undefined ? `data-minimo="${minimo}"` : "";
  return `
    <td class="${titulo_coluna.className}" data-campo_editavel="${campo_editavel}" data-tipo_campo="${tipo_campo}" ${atributo_minimo}>
      ${desenhar_campo_edicao(tipo_campo, minimo, valor_inicial)}
    </td>
  `;
}

// O campo de escrever de uma célula em edição (usado pelo ✎ e pelo "+ …")
function desenhar_campo_edicao(tipo_campo, minimo, valor) {
  const atributo_min = minimo !== undefined ? `min="${minimo}"` : "";
  return `<input class="campo_tabela" type="${tipo_campo}" step="any" ${atributo_min} required value="${valor}">`;
}

// O ✎ põe a linha a editar: cada célula editável passa a um campo com o valor original, e o ✎ passa a ✓
function tratar_clique_editar(botao) {
  const { gaveta, id } = botao.dataset;
  const objeto = dados.ler(gaveta).find((objeto_gaveta) => objeto_gaveta.id === id);
  const linha = botao.closest("tr");
  marcar_linha_em_espera(linha);

  linha.querySelectorAll("[data-campo_editavel]").forEach((celula) => {
    const valor_original = objeto[celula.dataset.campo_editavel];
    celula.innerHTML = desenhar_campo_edicao(celula.dataset.tipo_campo, celula.dataset.minimo, valor_original);
  });

  botao.dataset.acao = "guardar"; // o próximo clique neste botão guarda
  botao.textContent = "✓";
  trocar_por_cancelar(linha, "apagar"); // o ✕ dá lugar ao ↩
}

// Na linha em espera, o botão desta ação passa a ↩ (cancelar)
function trocar_por_cancelar(linha, acao) {
  linha.querySelector(`[data-acao="${acao}"]`).outerHTML = desenhar_botao_cancelar();
}

// O ✓ do ✎: guarda os valores novos no objeto que já existe e volta a desenhar a página
function tratar_clique_guardar(botao) {
  const linha = botao.closest("tr");
  if (!validar_campos_linha(linha)) return;

  dados.editar(botao.dataset.gaveta, botao.dataset.id, ler_valores_linha(linha));
  mostrar_pagina(pagina_atual);
}

// O ✓ da linha nova (do "+ …"): cria o objeto com um id novo e acrescenta-o à gaveta
function tratar_clique_guardar_novo(botao) {
  const linha = botao.closest("tr");
  if (!validar_campos_linha(linha)) return;

  const nome_gaveta = botao.dataset.gaveta;
  const id_novo = gerar_id(dados.ler(nome_gaveta), PREFIXOS_ID[nome_gaveta]);
  const novo_objeto = { id: id_novo, ...ler_valores_linha(linha) };
  dados.adicionar(nome_gaveta, novo_objeto);
  mostrar_pagina(pagina_atual);
}

// Os campos da linha estão bem preenchidos? Se algum não estiver (vazio, ou abaixo do mínimo),
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


// O ✕ apaga em 2 cliques: o 1.º só pede confirmação (✕ passa a ✓), o 2.º apaga mesmo.
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
