// #region ==================== IMPORTS ====================
import { NOMES_CATEGORIAS, PREFIXOS_ID } from "../constantes.js";
import { desenhar_painel } from "../graficos.js";
import { obter_data_hoje, gerar_id } from "../ferramentas.js";
import { filtrar_posicoes_abertas } from "../calculadores.js";
// #endregion

// #region ==================== RASCUNHOS (sessionStorage) ====================

function obter_chave_sessionstorage_rascunho(nome_formulario) {
  return `rascunho_${nome_formulario}`;
}
export function guardar_rascunho_sessionstorage(formulario) {
  const valores_escritos = Object.fromEntries(new FormData(formulario)); // { categoria: "etf", nome_ativo: "S&P 500", … }
  sessionStorage.setItem(obter_chave_sessionstorage_rascunho(formulario.dataset.formulario), JSON.stringify(valores_escritos));
}

function ler_rascunho_sessionstorage(nome_formulario) {
  const rascunho_guardado = sessionStorage.getItem(obter_chave_sessionstorage_rascunho(nome_formulario));
  return rascunho_guardado ? JSON.parse(rascunho_guardado) : {};
}

export function apagar_rascunho_sessionstorage(nome_formulario) {
  sessionStorage.removeItem(obter_chave_sessionstorage_rascunho(nome_formulario));
}
// #endregion

// #region ==================== NOVO REGISTO / COMPRA ====================
export function desenhar_pagina_novo_registo(dados) {
  const rascunho = ler_rascunho_sessionstorage("novo_registo");
  const hoje = obter_data_hoje();
  const gaveta_posicoes = dados.ler("posicoes");
  const gaveta_compras = dados.ler("compras");

  const html_formulario = `
    <form class="formulario" data-formulario="novo_registo">
      <label>Categoria
        <select name="categoria" required>${desenhar_opcoes_categorias(rascunho.categoria)}</select>
      </label>
      <label>Ativo
        <input name="nome_ativo" list="sugestoes_ativos" required placeholder="ex.: S&P 500" value="${rascunho.nome_ativo ?? ""}">
      </label>
      <label>Área de negócio
        <input name="area_negocio" list="sugestoes_areas_negocio" placeholder="ex.: Mercado - USA" value="${rascunho.area_negocio ?? ""}">
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

      ${desenhar_sugestoes("sugestoes_ativos", gaveta_posicoes.map((objeto_posicao) => objeto_posicao.nome_ativo))}
      ${desenhar_sugestoes("sugestoes_areas_negocio", gaveta_posicoes.map((objeto_posicao) => objeto_posicao.area_negocio))}
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

export function guardar_novo_registo(dados, formulario) {
  const valores = new FormData(formulario);
  const categoria = valores.get("categoria");
  const nome_ativo = valores.get("nome_ativo").trim();
  const id_posicao = encontrar_ou_criar_posicao(dados, categoria, nome_ativo, valores.get("area_negocio").trim());

  const objeto_novo_registo = {
    id: gerar_id(dados.ler("compras"), PREFIXOS_ID.compras),
    id_posicao,
    data: valores.get("data"),
    montante: Number(valores.get("montante")),
    origem: valores.get("origem").trim(),
  };
  dados.adicionar("compras", objeto_novo_registo);
  apagar_rascunho_sessionstorage("novo_registo");
  return { categoria, nome_ativo };
}
// #endregion

// #region ==================== AUXILIARES DOS FORMULÁRIOS ====================
function desenhar_opcoes_categorias(categoria_escolhida) {
  return Object.entries(NOMES_CATEGORIAS)
    .map(([categoria, nome]) => `<option value="${categoria}" ${categoria === categoria_escolhida ? "selected" : ""}>${nome}</option>`)
    .join("");
}

function desenhar_sugestoes(id_lista, textos_sugeridos) {
  const textos_sugeridos_sem_repetidos = [...new Set(textos_sugeridos)].filter((texto) => texto);
  const html_opcoes = textos_sugeridos_sem_repetidos.map((texto) => `<option value="${texto}">`).join("");
  // → <datalist id="sugestoes_areas_negocio"><option value="Mercado - USA"><option value="Bancos"><option value="Mercado - Global">…</datalist>
  return `<datalist id="${id_lista}">${html_opcoes}</datalist>`;
}

function encontrar_ou_criar_posicao(dados, categoria, nome_ativo, area_negocio) {
  const posicoes_abertas = filtrar_posicoes_abertas(dados.ler("posicoes"), dados.ler("compras"), dados.ler("vendas"));
  const posicao_existente = posicoes_abertas.find(
    (objeto_posicao) => objeto_posicao.categoria === categoria && objeto_posicao.nome_ativo.toLowerCase() === nome_ativo.toLowerCase(),
  );

  if (posicao_existente) return posicao_existente.id;

  const id_novo = gerar_id(dados.ler("posicoes"), PREFIXOS_ID.posicoes);
  const objeto_nova_posicao = { id: id_novo, categoria, nome_ativo, area_negocio };
  dados.adicionar("posicoes", objeto_nova_posicao);
  return id_novo;
}
// #endregion

// #region ==================== OUTROS FORMULÁRIOS ====================
export function desenhar_pagina_registar_rendibilidade(dados) {
  return `
    <h2>EM CONSTRUÇÃO</h2>
  `;
}

export function desenhar_pagina_registar_venda(dados) {
  return `
    <h2>EM CONSTRUÇÃO</h2>
  `;
}
// #endregion
