import { pool } from '../config/database.js';

class Payment {
  constructor(data) {
    this.id = data.id;
    this.assinatura_id = data.assinatura_id;
    this.payment_id = data.payment_id;
    this.status = data.status;
    this.valor = data.valor;
    this.moeda = data.moeda;
    this.metodo_pagamento = data.metodo_pagamento;
    this.data_pagamento = data.data_pagamento;
    this.data_vencimento = data.data_vencimento;
    this.webhook_data = data.webhook_data;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Criar novo pagamento
  static async create(paymentData) {
    try {
      const { assinatura_id, payment_id, valor, metodo_pagamento, data_vencimento } = paymentData;
      
      const [result] = await pool.execute(`
        INSERT INTO pagamentos 
        (assinatura_id, payment_id, status, valor, metodo_pagamento, data_vencimento)
        VALUES (?, ?, 'pending', ?, ?, ?)
      `, [assinatura_id, payment_id, valor, metodo_pagamento, data_vencimento]);

      return result.insertId;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }

  // Atualizar status do pagamento
  static async updateStatus(paymentId, status, webhookData = null) {
    try {
      const data_pagamento = status === 'approved' ? new Date() : null;
      
      await pool.execute(`
        UPDATE pagamentos 
        SET status = ?, data_pagamento = ?, webhook_data = ?
        WHERE payment_id = ?
      `, [status, data_pagamento, JSON.stringify(webhookData), paymentId]);
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      throw error;
    }
  }

  // Buscar pagamento por ID do Mercado Pago
  static async findByPaymentId(paymentId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM pagamentos WHERE payment_id = ?',
        [paymentId]
      );
      return rows.length > 0 ? new Payment(rows[0]) : null;
    } catch (error) {
      console.error('Erro ao buscar pagamento por ID:', error);
      throw error;
    }
  }

  // Buscar pagamentos de uma assinatura
  static async findByAssinatura(assinaturaId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM pagamentos WHERE assinatura_id = ? ORDER BY created_at DESC',
        [assinaturaId]
      );
      return rows.map(row => new Payment(row));
    } catch (error) {
      console.error('Erro ao buscar pagamentos da assinatura:', error);
      throw error;
    }
  }

  // Verificar se pagamento foi aprovado
  isApproved() {
    return this.status === 'approved';
  }

  // Verificar se pagamento está pendente
  isPending() {
    return this.status === 'pending';
  }

  // Verificar se pagamento foi rejeitado
  isRejected() {
    return this.status === 'rejected';
  }

  // Buscar pagamentos pendentes próximos do vencimento
  static async findPendingNearExpiration() {
    try {
      const [rows] = await pool.execute(`
        SELECT p.*, s.estabelecimento_id, s.data_vencimento
        FROM pagamentos p
        JOIN assinaturas s ON p.assinatura_id = s.id
        WHERE p.status = 'pending' 
        AND p.data_vencimento <= DATE_ADD(NOW(), INTERVAL 1 DAY)
        ORDER BY p.data_vencimento ASC
      `);
      return rows.map(row => new Payment(row));
    } catch (error) {
      console.error('Erro ao buscar pagamentos próximos do vencimento:', error);
      throw error;
    }
  }
}

export default Payment;
