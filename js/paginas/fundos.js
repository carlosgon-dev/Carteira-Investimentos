// Página "Fundos": fundo de sobrevivência e fundo de maneio.
import { desenhar_cartao, desenhar_painel, desenhar_tabela, desenhar_botoes_linha, desenhar_botao_adicionar } from "../graficos.js";
import { encontrar_saldo_atual_fundo } from "../calculadores.js";
import { formatar_euro, formatar_data, ordenar_mais_recente_primeiro } from "../ferramentas.js";

// As colunas das duas tabelas dos fundos (a última, sem título, é a dos botões ✎ ✕).
// campo_editavel + tipo_campo: estas colunas podem ser editadas com o ✎
// minimo: o valor mais baixo aceite (um saldo nunca é negativo)
// maximo: o valor mais alto aceite ("hoje": um saldo não pode ter data no futuro)
const COLUNAS_FUNDO = [
  { titulo: "Data", campo_editavel: "data", tipo_campo: "date", maximo: "hoje" },
  { titulo: "Saldo", campo_editavel: "saldo", tipo_campo: "number", minimo: 0, numero: true },
  { titulo: "" },
];

export function desenhar_fundos(dados) {
  const gaveta_fundo_sobrevivencia = dados.ler("fundo_sobrevivencia");
  const gaveta_fundo_maneio = dados.ler("fundo_maneio");
  const saldo_sobrevivencia = encontrar_saldo_atual_fundo(gaveta_fundo_sobrevivencia);
  const saldo_maneio = encontrar_saldo_atual_fundo(gaveta_fundo_maneio);
  const total_fundos = saldo_sobrevivencia + saldo_maneio;

  const html_cartoes = `
    <div class="fila_cartoes">
      ${desenhar_cartao({ titulo: "Total dos fundos", valor: formatar_euro(total_fundos), estilo: "cartao_destaque" })}
      ${desenhar_cartao({ titulo: "Fundo de sobrevivência", valor: formatar_euro(saldo_sobrevivencia) })}
      ${desenhar_cartao({ titulo: "Fundo de maneio", valor: formatar_euro(saldo_maneio) })}
    </div>
  `;

  const painel_cartoes = desenhar_painel({
    titulo: "Fundos",
    info: "Fundo de sobrevivência: a reserva para emergências. Fundo de maneio: o dinheiro na conta à ordem, pronto a usar.",
    nota: "O saldo mais recente de cada fundo é o que conta na Carteira",
    conteudo: html_cartoes,
  });

  return `
    ${painel_cartoes}
    <div class="lado_a_lado">
      ${desenhar_painel_fundo("Fundo de sobrevivência", "fundo_sobrevivencia", gaveta_fundo_sobrevivencia)}
      ${desenhar_painel_fundo("Fundo de maneio", "fundo_maneio", gaveta_fundo_maneio)}
    </div>
  `;
}

// Um painel com a tabela dos saldos de um fundo, do mais recente para o mais antigo
//   nome_gaveta: para os botões ✎ ✕ saberem de que gaveta é cada linha
function desenhar_painel_fundo(titulo, nome_gaveta, gaveta_fundo) {
  const saldos_ordenados = ordenar_mais_recente_primeiro(gaveta_fundo);
  const linhas_saldos = saldos_ordenados.map((objeto_saldo) => [
    formatar_data(objeto_saldo.data),
    formatar_euro(objeto_saldo.saldo),
    desenhar_botoes_linha(nome_gaveta, objeto_saldo.id),
  ]);
  const html_tabela = desenhar_tabela({ colunas_cabecalho: COLUNAS_FUNDO, linhas_conteudo: linhas_saldos });
  const html_botao_adicionar = desenhar_botao_adicionar(nome_gaveta, "+ Atualizar saldo");
  return desenhar_painel({ titulo, acoes: html_botao_adicionar, conteudo: html_tabela });
}
