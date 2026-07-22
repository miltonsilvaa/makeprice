/**
 * parser.js
 *
 * Lê mensagens de WhatsApp de feirantes e transforma em objetos de transação.
 * Entende dois tipos: gastos (compras) e vendas.
 */

'use strict';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converte uma string de valor ("50", "25,50", "25.50") para número float.
 * Troca vírgula por ponto antes de converter.
 */
function parseValor(str) {
  return parseFloat(str.replace(',', '.'));
}

/**
 * Capitaliza a primeira letra de uma palavra e deixa o resto em minúsculo.
 * "banana" → "Banana", "MAMÃO" → "Mamão"
 */
function capitalizar(str) {
  if (!str) return null;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Remove espaços extras e converte para minúsculo para facilitar a comparação.
 */
function normalizar(str) {
  return str.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Palavras que indicam que a mensagem deve ser ignorada (saudações, etc.)
// ---------------------------------------------------------------------------
const PALAVRAS_IGNORADAS = [
  'oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite',
  'obrigado', 'obrigada', 'valeu', 'ok', 'sim', 'não', 'nao',
  'tchau', 'até mais', 'ate mais', 'tudo bem', 'tudo bom',
];

// ---------------------------------------------------------------------------
// Padrões de reconhecimento (regex)
// ---------------------------------------------------------------------------

// Número inteiro ou decimal (aceita ponto e vírgula): ex: 50, 25,50, 100.00
const NUMERO = '(\\d+(?:[.,]\\d+)?)';

// Unidade opcional colada ao número: "20kg", "5un", "10l"
const UNIDADE = '(?:kg|g|un|l|lt|cx|pct|sc|saco)?';

// Nome de produto: uma ou mais palavras (aceita acento, hífen, espaço)
const PRODUTO = '([\\wÀ-ÿ]+(?:[\\s-][\\wÀ-ÿ]+)*)';

/**
 * Padrões para GASTO (compra de mercadoria):
 *
 * Formato esperado (em qualquer ordem):
 *   [comprei] <quantidade>[unidade] <produto> <valor>
 *
 * Exemplos:
 *   "10 banana 50"
 *   "comprei 10 banana 50"
 *   "20kg laranja 80"
 *   "5 mamão 25,50"
 */
const REGEX_GASTO = new RegExp(
  // prefixo opcional "comprei" ou "compra"
  '^(?:comprei?\\s+)?' +
  // quantidade com unidade opcional
  NUMERO + UNIDADE + '\\s+' +
  // nome do produto
  PRODUTO + '\\s+' +
  // valor no final
  NUMERO + '$',
  'i'
);

/**
 * Padrões para VENDA:
 *
 * Formatos esperados:
 *   "vendi 100"
 *   "venda 200"
 *   "vendi 150 banana"
 *
 * O produto é opcional.
 */
const REGEX_VENDA = new RegExp(
  // prefixo obrigatório "vendi" ou "venda"
  '^(?:vendi|venda)\\s+' +
  // valor
  NUMERO +
  // produto opcional no final
  '(?:\\s+' + PRODUTO + ')?$',
  'i'
);

// ---------------------------------------------------------------------------
// Funções de parse por linha
// ---------------------------------------------------------------------------

/**
 * Tenta interpretar uma linha como GASTO.
 * Retorna um objeto de transação ou null se não reconhecer.
 */
function tentarGasto(linha, raw) {
  const match = linha.match(REGEX_GASTO);
  if (!match) return null;

  const quantidade = parseValor(match[1]);
  const produto    = capitalizar(match[2]);
  const valor      = parseValor(match[3]);

  // Valida que os números fazem sentido
  if (isNaN(quantidade) || isNaN(valor)) return null;

  return {
    type: 'gasto',
    produto,
    quantidade,
    valor,
    raw,
  };
}

/**
 * Tenta interpretar uma linha como VENDA.
 * Retorna um objeto de transação ou null se não reconhecer.
 */
function tentarVenda(linha, raw) {
  const match = linha.match(REGEX_VENDA);
  if (!match) return null;

  const valor   = parseValor(match[1]);
  const produto = match[2] ? capitalizar(match[2]) : null;

  if (isNaN(valor)) return null;

  return {
    type: 'venda',
    produto,
    quantidade: null,
    valor,
    raw,
  };
}

/**
 * Verifica se uma linha é uma saudação ou mensagem para ignorar.
 */
function deveIgnorar(linha) {
  const normalizada = normalizar(linha);
  return PALAVRAS_IGNORADAS.some((palavra) => normalizada === palavra);
}

/**
 * Processa uma única linha de texto e retorna uma transação ou null.
 */
function parseLinha(linha) {
  const raw = linha.trim();
  if (!raw) return null;           // linha vazia
  if (deveIgnorar(raw)) return null; // saudação ou palavra ignorada

  const normalizada = normalizar(raw);

  // Tenta venda primeiro (tem palavra-chave clara, menos ambíguo)
  const venda = tentarVenda(normalizada, raw);
  if (venda) return venda;

  // Tenta gasto
  const gasto = tentarGasto(normalizada, raw);
  if (gasto) return gasto;

  // Nenhum padrão reconhecido — ignora silenciosamente
  return null;
}

// ---------------------------------------------------------------------------
// Função principal exportada
// ---------------------------------------------------------------------------

/**
 * parseMessage(text, tenantPhone)
 *
 * Recebe uma mensagem de WhatsApp (pode ter várias linhas) e retorna
 * um array com todas as transações identificadas.
 *
 * @param {string} text         - Texto da mensagem recebida
 * @param {string} tenantPhone  - Número do feirante (reservado para uso futuro)
 * @returns {Array<Object>}     - Lista de transações ({ type, produto, quantidade, valor, raw })
 */
function parseMessage(text, tenantPhone) { // eslint-disable-line no-unused-vars
  if (!text || typeof text !== 'string') return [];

  // Divide em linhas (aceita \n, \r\n e \r)
  const linhas = text.split(/\r?\n|\r/);

  const transacoes = [];

  for (const linha of linhas) {
    const transacao = parseLinha(linha);
    if (transacao) {
      transacoes.push(transacao);
    }
  }

  return transacoes;
}

module.exports = { parseMessage };
