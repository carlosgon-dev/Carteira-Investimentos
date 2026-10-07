// Os 3 formulários do menu: Novo registo/compra, Registar rendibilidade, Registar venda.
// #region ==================== IMPORTS ====================
import { NOMES_TIPOS, PREFIXOS_ID } from "../constantes.js";
import { desenhar_painel } from "../graficos.js";
import { obter_data_hoje, gerar_id } from "../ferramentas.js";
import { filtrar_posicoes_abertas } from "../calculadores.js";
// #endregion

// #region ==================== RASCUNHOS (sessionStorage) ====================
// O que se vai escrevendo num formulário fica guardado no sessionStorage: se a página recarregar, nada se perde.
// O sessionStorage só dura enquanto o separador do browser está aberto (ao contrário do localStorage).

// A chave de cada rascunho: "rascunho_novo_registo", "rascunho_registar_venda"…
function obter_chave_rascunho(nome_formulario) {
  return `rascunho_${nome_formulario}`;
}

// Guarda tudo o que está escrito no formulário (o eventos.js chama isto a cada letra escrita)
export function guardar_rascunho(formulario) {
  const valores_escritos = Object.fromEntries(new FormData(formulario)); // { tipo: "etf", nome: "S&P 500", … }
  sessionStorage.setItem(obter_chave_rascunho(formulario.dataset.formulario), JSON.stringify(valores_escritos));
}

// O rascunho guardado de um formulário (ou um objeto vazio, se não houver)
function ler_rascunho(nome_formulario) {
  const rascunho_guardado = sessionStorage.getItem(obter_chave_rascunho(nome_formulario));
  return rascunho_guardado ? JSON.parse(rascunho_guardado) : {};
}

// Apaga o rascunho (depois de guardar a sério, ou ao cancelar)
export function apagar_rascunho(nome_formulario) {
  sessionStorage.removeItem(obter_chave_rascunho(nome_formulario));
}
// #endregion

// #region ==================== NOVO REGISTO / COMPRA ====================
// O formulário de uma compra. Os campos com "list" mostram sugestões do que já existe (o <datalist>).
// Se houver rascunho, os campos vêm preenchidos com ele.
export function desenhar_pagina_novo_registo(dados) {
  const rascunho = ler_rascunho("novo_registo");
  const hoje = obter_data_hoje();
  const gaveta_posicoes = dados.ler("posicoes");
  const gaveta_compras = dados.ler("compras");

  const html_formulario = `
    <form class="formulario" data-formulario="novo_registo">
      <label>Tipo
        <select name="tipo" required>${desenhar_opcoes_tipos(rascunho.tipo)}</select>
      </label>
      <label>Ativo
        <input name="nome" list="sugestoes_ativos" required placeholder="ex.: S&P 500" value="${rascunho.nome ?? ""}">
      </label>
      <label>Tema
        <input name="tema" list="sugestoes_temas" placeholder="ex.: Mercado - USA" value="${rascunho.tema ?? ""}">
      </label>
      <label>Data
        <input name="data" type="date" required max="${hoje}" value="${rascunho.data ?? hoje}">
      </label>
      <label>Montante (€)
        <input name="montante" type="number" step="any" min="0.01" required placeholder="ex.: 250" value="${rascunho.montante ?? ""}">
      </label>
      <label>Origem do dinheiro
        <input name="origem" list="sugestoes_origens" placeholder="ex.: Salário" value="${rascunho.origem ?? ""}">
      </label>

      ${desenhar_sugestoes("sugestoes_ativos", gaveta_posicoes.map((objeto_posicao) => objeto_posicao.nome))}
      ${desenhar_sugestoes("sugestoes_temas", gaveta_posicoes.map((objeto_posicao) => objeto_posicao.tema))}
      ${desenhar_sugestoes("sugestoes_origens", gaveta_compras.map((objeto_compra) => objeto_compra.origem))}

      <div class="formulario_botoes">
        <button type="submit" class="botao_principal">Guardar compra</button>
        <button type="button" class="botao_secundario" data-acao="cancelar_formulario" data-formulario="novo_registo">Cancelar</button>
      </div>
    </form>
  `;

  return desenhar_painel({
    titulo: "Novo registo/compra",
    nota: "Se o ativo ainda não existir (ou já foi vendido), é criado de novo",
    conteudo: html_formulario,
  });
}

// Guarda a compra. Se já houver uma posição ABERTA com o mesmo tipo e nome, a compra junta-se a ela;
// se não houver, cria-se uma posição nova. Devolve o tipo e o nome (para a app abrir a página do tipo e avisar).
export function guardar_novo_registo(dados, formulario) {
  const valores = new FormData(formulario);
  const tipo = valores.get("tipo");
  const nome = valores.get("nome").trim();
  const id_posicao = encontrar_ou_criar_posicao(dados, tipo, nome, valores.get("tema").trim());

  dados.adicionar("compras", {
    id: gerar_id(dados.ler("compras"), PREFIXOS_ID.compras),
    id_posicao,
    data: valores.get("data"),
    montante: Number(valores.get("montante")),
    origem: valores.get("origem").trim(),
  });
  apagar_rascunho("novo_registo");
  return { tipo, nome };
}
// #endregion

// #region ==================== AUXILIARES DOS FORMULÁRIOS ====================
// As opções da lista dos tipos (ETF's, Criptomoedas…); a do rascunho vem já escolhida
function desenhar_opcoes_tipos(tipo_escolhido) {
  return Object.entries(NOMES_TIPOS)
    .map(([tipo, nome]) => `<option value="${tipo}" ${tipo === tipo_escolhido ? "selected" : ""}>${nome}</option>`)
    .join("");
}

// Uma lista de sugestões (<datalist>) para um campo de texto, sem repetidos e sem vazios
function desenhar_sugestoes(id_lista, textos) {
  const textos_unicos = [...new Set(textos)].filter((texto) => texto); // new Set tira os repetidos
  const html_opcoes = textos_unicos.map((texto) => `<option value="${texto}">`).join("");
  return `<datalist id="${id_lista}">${html_opcoes}</datalist>`;
}

// O id da posição ABERTA com este tipo e nome; se não houver, cria uma posição nova e devolve o id dela
function encontrar_ou_criar_posicao(dados, tipo, nome, tema) {
  const posicoes_abertas = filtrar_posicoes_abertas(dados.ler("posicoes"), dados.ler("compras"), dados.ler("vendas"));
  const posicao_existente = posicoes_abertas.find(
    (objeto_posicao) => objeto_posicao.tipo === tipo && objeto_posicao.nome.toLowerCase() === nome.toLowerCase(),
  );
  if (posicao_existente) return posicao_existente.id;

  const id_novo = gerar_id(dados.ler("posicoes"), PREFIXOS_ID.posicoes);
  dados.adicionar("posicoes", { id: id_novo, tipo, nome, tema });
  return id_novo;
}
// #endregion

// #region ==================== OUTROS FORMULÁRIOS (por fazer) ====================
export function desenhar_pagina_registar_rendibilidade(dados) {
  return `
    <h2>Registar rendibilidade</h2>
  `;
}

export function desenhar_pagina_registar_venda(dados) {
  return `
    <h2>Registar venda</h2>
  `;
}
// #endregion
