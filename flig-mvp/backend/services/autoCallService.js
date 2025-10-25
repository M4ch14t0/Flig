import { pool } from '../config/database.js';
import redisService from './redis.js';

class AutoCallService {
  /**
   * Verifica se uma fila precisa de chamada automática
   * @param {string} queueId - ID da fila
   * @returns {Object} - Status da chamada automática
   */
  static async verificarChamadaAutomatica(queueId) {
    try {
      const [rows] = await pool.execute(
        `SELECT chamada_automatica, intervalo_chamada, ultima_chamada 
         FROM filas 
         WHERE id = ? AND status = 'ativa'`,
        [queueId]
      );

      if (rows.length === 0) {
        return { precisaChamada: false, motivo: 'Fila não encontrada ou inativa' };
      }

      const fila = rows[0];
      
      // Se não tem chamada automática ativada
      if (!fila.chamada_automatica) {
        return { precisaChamada: false, motivo: 'Chamada automática desativada' };
      }

      // Verificar se há clientes na fila
      const clientes = await redisService.getQueueClients(queueId);
      if (!clientes || clientes.length === 0) {
        return { precisaChamada: false, motivo: 'Não há clientes na fila' };
      }

      // Verificar intervalo de tempo
      const agora = new Date();
      const ultimaChamada = fila.ultima_chamada ? new Date(fila.ultima_chamada) : null;
      
      if (ultimaChamada) {
        const diferencaMinutos = (agora.getTime() - ultimaChamada.getTime()) / (1000 * 60);
        if (diferencaMinutos < fila.intervalo_chamada) {
          return { 
            precisaChamada: false, 
            motivo: `Aguardando intervalo (${Math.round(fila.intervalo_chamada - diferencaMinutos)} min restantes)` 
          };
        }
      }

      return { 
        precisaChamada: true, 
        motivo: 'Pronto para chamada automática',
        proximoCliente: clientes[0],
        totalClientes: clientes.length
      };

    } catch (error) {
      console.error('❌ Erro ao verificar chamada automática:', error);
      throw error;
    }
  }

  /**
   * Executa chamada automática para uma fila
   * @param {string} queueId - ID da fila
   * @returns {Object} - Resultado da chamada
   */
  static async executarChamadaAutomatica(queueId) {
    try {
      const status = await this.verificarChamadaAutomatica(queueId);
      
      if (!status.precisaChamada) {
        return { 
          sucesso: false, 
          motivo: status.motivo 
        };
      }

      // Executar chamada do próximo cliente diretamente
      const resultado = await this.chamarProximoClienteDireto(queueId);
      
      if (resultado.success) {
        // Atualizar timestamp da última chamada
        await pool.execute(
          `UPDATE filas SET ultima_chamada = NOW() WHERE id = ?`,
          [queueId]
        );
        
        console.log(`🤖 Chamada automática executada para fila ${queueId}: ${status.proximoCliente.nome}`);
        
        return {
          sucesso: true,
          cliente: status.proximoCliente,
          totalRestantes: status.totalClientes - 1
        };
      }

      return { 
        sucesso: false, 
        motivo: 'Erro ao chamar próximo cliente' 
      };

    } catch (error) {
      console.error('❌ Erro na chamada automática:', error);
      throw error;
    }
  }

  /**
   * Ativa/desativa chamada automática para uma fila
   * @param {string} queueId - ID da fila
   * @param {boolean} ativar - Se deve ativar ou desativar
   * @param {number} intervalo - Intervalo em minutos (opcional)
   */
  static async configurarChamadaAutomatica(queueId, ativar, intervalo = 5) {
    try {
      await pool.execute(
        `UPDATE filas 
         SET chamada_automatica = ?, 
             intervalo_chamada = ?,
             ultima_chamada = NULL
         WHERE id = ?`,
        [ativar, intervalo, queueId]
      );

      console.log(`⚙️ Configuração de chamada automática atualizada para fila ${queueId}: ${ativar ? 'ATIVADA' : 'DESATIVADA'} (intervalo: ${intervalo}min)`);

      return { sucesso: true, ativada: ativar, intervalo };

    } catch (error) {
      console.error('❌ Erro ao configurar chamada automática:', error);
      throw error;
    }
  }

  /**
   * Verifica todas as filas que precisam de chamada automática
   * @returns {Array} - Lista de filas que precisam de chamada
   */
  static async verificarTodasFilas() {
    try {
      const [rows] = await pool.execute(
        `SELECT id, nome, chamada_automatica, intervalo_chamada, ultima_chamada 
         FROM filas 
         WHERE status = 'ativa' AND chamada_automatica = TRUE`
      );

      const filasParaChamada = [];

      for (const fila of rows) {
        const status = await this.verificarChamadaAutomatica(fila.id);
        if (status.precisaChamada) {
          filasParaChamada.push({
            queueId: fila.id,
            nome: fila.nome,
            proximoCliente: status.proximoCliente,
            totalClientes: status.totalClientes
          });
        }
      }

      return filasParaChamada;

    } catch (error) {
      console.error('❌ Erro ao verificar todas as filas:', error);
      throw error;
    }
  }

  /**
   * Executa chamadas automáticas para todas as filas elegíveis
   * @returns {Object} - Resultado das chamadas
   */
  static async executarTodasChamadas() {
    try {
      const filasParaChamada = await this.verificarTodasFilas();
      const resultados = [];

      for (const fila of filasParaChamada) {
        try {
          const resultado = await this.executarChamadaAutomatica(fila.queueId);
          resultados.push({
            queueId: fila.queueId,
            nome: fila.nome,
            sucesso: resultado.sucesso,
            motivo: resultado.motivo || 'Chamada executada',
            cliente: resultado.cliente
          });
        } catch (error) {
          console.error(`❌ Erro ao executar chamada automática para fila ${fila.queueId}:`, error);
          resultados.push({
            queueId: fila.queueId,
            nome: fila.nome,
            sucesso: false,
            motivo: 'Erro interno',
            erro: error.message
          });
        }
      }

      console.log(`🤖 Executadas ${resultados.filter(r => r.sucesso).length} chamadas automáticas de ${resultados.length} filas elegíveis`);

      return {
        totalFilas: resultados.length,
        sucessos: resultados.filter(r => r.sucesso).length,
        falhas: resultados.filter(r => !r.sucesso).length,
        resultados
      };

    } catch (error) {
      console.error('❌ Erro ao executar todas as chamadas:', error);
      throw error;
    }
  }

  /**
   * Chama o próximo cliente diretamente (sem usar o controller)
   * @param {string} queueId - ID da fila
   * @returns {Object} - Resultado da chamada
   */
  static async chamarProximoClienteDireto(queueId) {
    try {
      
      // Obter clientes da fila
      const clients = await redisService.getQueueClients(queueId);
      if (!clients || clients.length === 0) {
        return { success: false, motivo: 'Não há clientes na fila' };
      }

      // Pegar o primeiro cliente (próximo a ser atendido)
      const proximoCliente = clients[0];
      
      // Remover cliente da fila
      await redisService.removeClientFromQueue(queueId, proximoCliente.email);
      
      // Registrar tempo de atendimento
      try {
        const TempoEsperaService = require('./tempoEsperaService');
        await TempoEsperaService.registrarAtendimento(
          proximoCliente.id || `client-${Date.now()}`,
          queueId,
          proximoCliente.email
        );
      } catch (tempoError) {
        console.warn('⚠️ Erro ao registrar tempo de atendimento:', tempoError);
      }

      console.log(`✅ Cliente ${proximoCliente.nome} foi chamado automaticamente`);
      
      return {
        success: true,
        cliente: proximoCliente,
        totalRestantes: clients.length - 1
      };

    } catch (error) {
      console.error('❌ Erro ao chamar próximo cliente:', error);
      return { success: false, motivo: 'Erro interno' };
    }
  }
}

export default AutoCallService;
