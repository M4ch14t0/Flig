/**
 * Serviço de Pagamento Simulado para Sistema Flig
 * 
 * Este módulo simula o processo de pagamento para avanço de posições
 * nas filas. Em produção, deve ser substituído pela integração real
 * com APIs de pagamento como PagSeguro, Mercado Pago, etc.
 * 
 * IMPORTANTE: Este é apenas um sistema de simulação para testes.
 * Para produção, substitua todas as funções por chamadas reais às APIs de pagamento.
 * 
 * @author Flig Team
 * @version 1.0.0
 */

import crypto from 'crypto';
import connection from '../config/db.js';

/**
 * Simula processamento de pagamento
 * 
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} - Resultado do pagamento simulado
 */
async function processPayment(paymentData) {
  try {
    const {
      clientId,
      queueId,
      positions,
      amount,
      paymentMethod = 'credit_card',
      cardData = {}
    } = paymentData;

    // Normaliza o método de pagamento para valores aceitos pelo banco
    const normalizedPaymentMethod = paymentMethod === 'simulated' ? 'credit_card' : paymentMethod;

    console.log(`🔄 Processando pagamento simulado: ${positions} posições por R$ ${amount}`);

    // Simula validação de dados do cartão (apenas se dados foram fornecidos)
    if (paymentMethod === 'credit_card' && cardData && Object.keys(cardData).length > 0) {
      const isValidCard = validateCardData(cardData);
      if (!isValidCard) {
        throw new Error('Dados do cartão inválidos');
      }
    }

    // Simula delay de processamento (1-3 segundos)
    await simulateProcessingDelay();

    // Simula taxa de sucesso de 100% para desenvolvimento/testes
    // Em produção, pode ser reduzida para simular falhas reais
    const successRate = 1.0; // 100% de sucesso para testes
    const isSuccessful = Math.random() < successRate;

    if (!isSuccessful) {
      throw new Error('Pagamento recusado pelo banco');
    }

    // Gera ID de transação simulado
    const transactionId = generateTransactionId();

    // Salva transação no banco (para histórico)
    await saveTransaction({
      transactionId,
      clientId,
      queueId,
      positions,
      amount,
      paymentMethod: normalizedPaymentMethod,
      status: 'approved',
      createdAt: new Date()
    });

    console.log(`✅ Pagamento simulado aprovado: ${transactionId}`);

    return {
      success: true,
      transactionId: transactionId,
      status: 'approved',
      amount: amount,
      positions: positions,
      message: 'Pagamento processado com sucesso'
    };

  } catch (error) {
    console.error('❌ Erro no pagamento simulado:', error);
    
    // Salva transação falhada no banco
    if (paymentData.transactionId) {
      await saveTransaction({
        transactionId: paymentData.transactionId,
        clientId: paymentData.clientId,
        queueId: paymentData.queueId,
        positions: paymentData.positions,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        status: 'failed',
        error: error.message,
        createdAt: new Date()
      });
    }

    return {
      success: false,
      status: 'failed',
      error: error.message,
      message: 'Falha no processamento do pagamento'
    };
  }
}

/**
 * Valida dados do cartão (simulação)
 * 
 * @param {Object} cardData - Dados do cartão
 * @returns {boolean} - True se válido
 */
function validateCardData(cardData) {
  const { number, cvv, expiryMonth, expiryYear, holderName } = cardData;

  // Validações básicas simuladas
  if (!number || number.length < 13 || number.length > 19) {
    return false;
  }

  if (!cvv || cvv.length < 3 || cvv.length > 4) {
    return false;
  }

  if (!expiryMonth || expiryMonth < 1 || expiryMonth > 12) {
    return false;
  }

  const currentYear = new Date().getFullYear();
  if (!expiryYear || expiryYear < currentYear) {
    return false;
  }

  if (!holderName || holderName.length < 2) {
    return false;
  }

  // Simula validação de número do cartão (algoritmo de Luhn)
  return validateCardNumber(number);
}

/**
 * Valida número do cartão usando algoritmo de Luhn
 * 
 * @param {string} cardNumber - Número do cartão
 * @returns {boolean} - True se válido
 */
function validateCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  // Processa dígitos da direita para a esquerda
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Simula delay de processamento
 * 
 * @param {number} minMs - Tempo mínimo em ms
 * @param {number} maxMs - Tempo máximo em ms
 */
function simulateProcessingDelay(minMs = 1000, maxMs = 3000) {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Gera ID único para transação
 * 
 * @returns {string} - ID da transação
 */
function generateTransactionId() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `TXN_${timestamp}_${random}`.toUpperCase();
}

/**
 * Salva transação no banco de dados
 * 
 * @param {Object} transactionData - Dados da transação
 */
async function saveTransaction(transactionData) {
  try {
    const sql = `
      INSERT INTO transacoes_pagamentos 
      (transaction_id, client_id, queue_id, positions, amount, payment_method, status, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      transactionData.transactionId,
      transactionData.clientId,
      transactionData.queueId,
      transactionData.positions,
      transactionData.amount,
      transactionData.paymentMethod,
      transactionData.status,
      transactionData.error || null,
      transactionData.createdAt
    ];

    await new Promise((resolve, reject) => {
      connection.query(sql, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log(`💾 Transação salva no banco: ${transactionData.transactionId}`);

  } catch (error) {
    console.error('❌ Erro ao salvar transação:', error);
    // Não lança erro para não interromper o fluxo principal
  }
}

/**
 * Busca histórico de transações de um cliente
 * 
 * @param {string} clientId - ID do cliente
 * @returns {Promise<Array>} - Lista de transações
 */
async function getClientTransactions(clientId) {
  try {
    const sql = `
      SELECT * FROM transacoes_pagamentos 
      WHERE client_id = ? 
      ORDER BY created_at DESC
    `;

    const results = await new Promise((resolve, reject) => {
      connection.query(sql, [clientId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    return results;

  } catch (error) {
    console.error('❌ Erro ao buscar transações do cliente:', error);
    throw error;
  }
}

/**
 * Busca estatísticas de pagamentos de uma fila
 * 
 * @param {string} queueId - ID da fila
 * @returns {Promise<Object>} - Estatísticas de pagamentos
 */
async function getQueuePaymentStats(queueId) {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_transactions,
        SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'approved' THEN positions ELSE 0 END) as total_positions_advanced
      FROM transacoes_pagamentos 
      WHERE queue_id = ?
    `;

    const results = await new Promise((resolve, reject) => {
      connection.query(sql, [queueId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const stats = results[0];
    
    return {
      totalTransactions: parseInt(stats.total_transactions) || 0,
      approvedTransactions: parseInt(stats.approved_transactions) || 0,
      totalRevenue: parseFloat(stats.total_revenue) || 0,
      totalPositionsAdvanced: parseInt(stats.total_positions_advanced) || 0,
      successRate: stats.total_transactions > 0 ? 
        (stats.approved_transactions / stats.total_transactions * 100).toFixed(2) : 0
    };

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de pagamento:', error);
    throw error;
  }
}

/**
 * Simula webhook de confirmação de pagamento
 * 
 * NOTA: Em produção, esta função deve ser chamada pelo webhook real
 * da API de pagamento quando o pagamento for confirmado.
 * 
 * @param {string} transactionId - ID da transação
 * @returns {Promise<Object>} - Resultado da confirmação
 */
async function confirmPayment(transactionId) {
  try {
    console.log(`🔔 Simulando webhook de confirmação: ${transactionId}`);

    // Atualiza status da transação no banco
    const sql = 'UPDATE transacoes_pagamentos SET status = ?, updated_at = NOW() WHERE transaction_id = ?';
    
    await new Promise((resolve, reject) => {
      connection.query(sql, ['confirmed', transactionId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log(`✅ Pagamento confirmado: ${transactionId}`);

    return {
      success: true,
      transactionId: transactionId,
      status: 'confirmed',
      message: 'Pagamento confirmado com sucesso'
    };

  } catch (error) {
    console.error('❌ Erro ao confirmar pagamento:', error);
    throw error;
  }
}

/**
 * Calcula valor do avanço baseado no número de posições
 * Sistema de juros compostos: R$ 10,00 inicial + 15% a cada posição
 * 
 * @param {number} positions - Número de posições
 * @param {number} basePrice - Preço base por posição (ignorado, usando sistema fixo)
 * @returns {number} - Valor total
 */
function calculateAdvancePrice(positions, basePrice = 2.00) {
  const initialPrice = 10.00; // R$ 10,00 inicial
  const interestRate = 0.15; // 15% de juros
  
  if (positions <= 0) return 0;
  if (positions === 1) return initialPrice;
  
  // Juros compostos: P * (1 + r)^n
  // Onde P = preço inicial, r = taxa de juros, n = número de posições - 1
  const totalPrice = initialPrice * Math.pow(1 + interestRate, positions - 1);
  
  // Arredonda para 2 casas decimais
  return Math.round(totalPrice * 100) / 100;
}

export {
  processPayment,
  validateCardData,
  validateCardNumber,
  generateTransactionId,
  saveTransaction,
  getClientTransactions,
  getQueuePaymentStats,
  confirmPayment,
  calculateAdvancePrice
};

export default {
  processPayment,
  validateCardData,
  validateCardNumber,
  generateTransactionId,
  saveTransaction,
  getClientTransactions,
  getQueuePaymentStats,
  confirmPayment,
  calculateAdvancePrice
};

