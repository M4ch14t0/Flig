const { pool } = require('../config/database');

class Subscription {
  constructor(data) {
    this.id = data.id;
    this.estabelecimento_id = data.estabelecimento_id;
    this.plano_id = data.plano_id;
    this.status = data.status;
    this.data_inicio = data.data_inicio;
    this.data_vencimento = data.data_vencimento;
    this.valor = data.valor;
    this.moeda = data.moeda;
    this.payment_id = data.payment_id;
    this.subscription_id = data.subscription_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Buscar assinatura ativa de um estabelecimento
  static async findActiveByEstabelecimento(estabelecimentoId) {
    try {
      const [rows] = await pool.execute(`
        SELECT s.*, p.nome as plano_nome, p.recursos
        FROM assinaturas s
        JOIN planos p ON s.plano_id = p.id
        WHERE s.estabelecimento_id = ? 
        AND s.status = 'active' 
        AND s.data_vencimento >= CURDATE()
        ORDER BY s.created_at DESC
        LIMIT 1
      `, [estabelecimentoId]);
      
      return rows.length > 0 ? new Subscription(rows[0]) : null;
    } catch (error) {
      console.error('Erro ao buscar assinatura ativa:', error);
      throw error;
    }
  }

  // Criar nova assinatura
  static async create(assinaturaData) {
    try {
      const { estabelecimento_id, plano_id, valor, payment_id, subscription_id } = assinaturaData;
      
      // Calcular datas
      const data_inicio = new Date();
      const data_vencimento = new Date();
      data_vencimento.setMonth(data_vencimento.getMonth() + 1); // +1 mês

      const [result] = await pool.execute(`
        INSERT INTO assinaturas 
        (estabelecimento_id, plano_id, status, data_inicio, data_vencimento, valor, payment_id, subscription_id)
        VALUES (?, ?, 'pending', ?, ?, ?, ?, ?)
      `, [estabelecimento_id, plano_id, data_inicio, data_vencimento, valor, payment_id, subscription_id]);

      return result.insertId;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw error;
    }
  }

  // Ativar assinatura
  static async activate(assinaturaId) {
    try {
      await pool.execute(
        'UPDATE assinaturas SET status = "active" WHERE id = ?',
        [assinaturaId]
      );
    } catch (error) {
      console.error('Erro ao ativar assinatura:', error);
      throw error;
    }
  }

  // Cancelar assinatura
  static async cancel(assinaturaId) {
    try {
      await pool.execute(
        'UPDATE assinaturas SET status = "cancelled" WHERE id = ?',
        [assinaturaId]
      );
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  // Verificar se assinatura está ativa
  isActive() {
    return this.status === 'active' && new Date(this.data_vencimento) >= new Date();
  }

  // Verificar se está próxima do vencimento (7 dias)
  isNearExpiration() {
    const vencimento = new Date(this.data_vencimento);
    const hoje = new Date();
    const diffTime = vencimento - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }

  // Verificar se está vencida
  isExpired() {
    return new Date(this.data_vencimento) < new Date();
  }

  // Buscar todas as assinaturas de um estabelecimento
  static async findByEstabelecimento(estabelecimentoId) {
    try {
      const [rows] = await pool.execute(`
        SELECT s.*, p.nome as plano_nome
        FROM assinaturas s
        JOIN planos p ON s.plano_id = p.id
        WHERE s.estabelecimento_id = ?
        ORDER BY s.created_at DESC
      `, [estabelecimentoId]);
      
      return rows.map(row => new Subscription(row));
    } catch (error) {
      console.error('Erro ao buscar assinaturas do estabelecimento:', error);
      throw error;
    }
  }
}

module.exports = Subscription;
