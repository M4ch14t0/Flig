import { pool } from '../config/database.js';

class Plan {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.descricao = data.descricao;
    this.preco = data.preco;
    this.periodo = data.periodo;
    this.max_filas = data.max_filas;
    this.max_clientes_por_fila = data.max_clientes_por_fila;
    this.recursos = data.recursos;
    this.ativo = data.ativo;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Buscar todos os planos ativos
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM planos WHERE ativo = true ORDER BY preco ASC'
      );
      return rows.map(row => new Plan(row));
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      throw error;
    }
  }

  // Buscar plano por ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM planos WHERE id = ? AND ativo = true',
        [id]
      );
      return rows.length > 0 ? new Plan(rows[0]) : null;
    } catch (error) {
      console.error('Erro ao buscar plano por ID:', error);
      throw error;
    }
  }

  // Verificar se plano tem recurso específico
  hasFeature(feature) {
    if (!this.recursos) return false;
    const recursos = typeof this.recursos === 'string' 
      ? JSON.parse(this.recursos) 
      : this.recursos;
    return recursos[feature] === true;
  }

  // Verificar limites do plano
  canCreateQueue(currentQueues) {
    if (this.max_filas === null) return true; // Ilimitado
    return currentQueues < this.max_filas;
  }

  canAddClientToQueue(currentClients) {
    if (this.max_clientes_por_fila === null) return true; // Ilimitado
    return currentClients < this.max_clientes_por_fila;
  }
}

export default Plan;
