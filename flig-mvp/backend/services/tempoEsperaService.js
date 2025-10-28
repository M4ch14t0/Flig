/**
 * Serviço de Cálculo de Tempo de Espera
 * 
 * Implementa o sistema de cálculo de tempo de espera conforme especificado:
 * - Calcula tempo individual quando usuário é atendido
 * - Atualiza média incremental da fila
 * - Fornece estimativas para usuários na fila
 * 
 * @version 1.0.0
 */

import { pool } from '../config/database.js';

class TempoEsperaService {
  
  /**
   * Registra a entrada de um cliente na fila
   * @param {string} clientId - ID do cliente
   * @param {string} queueId - ID da fila
   * @param {string} email - Email do cliente
   */
  static async registrarEntrada(clientId, queueId, email) {
    try {
      const tempoEntrada = new Date();
      
      // Converter Date para string MySQL no formato correto (horário local)
      // Isso evita problemas de timezone quando o MySQL interpreta o valor
      const year = tempoEntrada.getFullYear();
      const month = String(tempoEntrada.getMonth() + 1).padStart(2, '0');
      const day = String(tempoEntrada.getDate()).padStart(2, '0');
      const hour = String(tempoEntrada.getHours()).padStart(2, '0');
      const minute = String(tempoEntrada.getMinutes()).padStart(2, '0');
      const second = String(tempoEntrada.getSeconds()).padStart(2, '0');
      const tempoEntradaMySQLFormat = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      
      // Buscar dados do cliente no Redis para obter posição real
      const redisService = await import('./redis.js');
      const clients = await redisService.getQueueClients(queueId);
      const clientPosition = clients.find(c => c.email === email)?.position || 1;
      
      // Primeiro, verificar se o registro existe
      const [existingRows] = await pool.execute(
        `SELECT id FROM historico_clientes_filas 
         WHERE client_id = ? AND queue_id = ? AND email_cliente = ?`,
        [clientId, queueId, email]
      );
      
      if (existingRows.length > 0) {
        // Se existe, atualizar
        await pool.execute(
          `UPDATE historico_clientes_filas 
           SET tempo_entrada = ?, posicao_inicial = ? 
           WHERE client_id = ? AND queue_id = ? AND email_cliente = ?`,
          [tempoEntradaMySQLFormat, clientPosition, clientId, queueId, email]
        );
      } else {
        // Se não existe, criar novo registro
        await pool.execute(
          `INSERT INTO historico_clientes_filas 
           (client_id, queue_id, email_cliente, nome_cliente, telefone_cliente, posicao_inicial, tempo_entrada, status, data_entrada) 
           VALUES (?, ?, ?, 'Cliente', '00000000000', ?, ?, 'aguardando', NOW())`,
          [clientId, queueId, email, clientPosition, tempoEntradaMySQLFormat]
        );
      }
      
      console.log(`⏰ Cliente ${email} entrou na fila na posição ${clientPosition} às ${tempoEntrada.toISOString()}`);
      return tempoEntrada;
    } catch (error) {
      console.error('❌ Erro ao registrar tempo de entrada:', error);
      throw error;
    }
  }

  /**
   * Registra o atendimento de um cliente e calcula tempo de espera
   * @param {string} clientId - ID do cliente
   * @param {string} queueId - ID da fila
   * @param {string} email - Email do cliente
   * @returns {Object} - Dados do tempo de espera calculado
   */
  static async registrarAtendimento(clientId, queueId, email) {
    try {
      const tempoAtendimento = new Date();
      
      // Buscar dados do cliente no histórico
      const [rows] = await pool.execute(
        `SELECT tempo_entrada, posicao_inicial 
         FROM historico_clientes_filas 
         WHERE client_id = ? AND queue_id = ? AND email_cliente = ?`,
        [clientId, queueId, email]
      );
      
      if (rows.length === 0) {
        throw new Error('Cliente não encontrado no histórico');
      }
      
      const { tempo_entrada } = rows[0];
      
      if (!tempo_entrada) {
        console.warn(`⚠️ Tempo de entrada não encontrado para ${email}, usando tempo atual`);
        // Se não tem tempo de entrada, usar tempo atual (caso de migração)
        const tempoEntrada = new Date();
        await pool.execute(
          `UPDATE historico_clientes_filas 
           SET tempo_entrada = ? 
           WHERE client_id = ? AND queue_id = ? AND email_cliente = ?`,
          [tempoEntrada, clientId, queueId, email]
        );
        
        const tempoEsperaMinutos = 0; // Tempo zero para casos sem dados
        await this.atualizarHistoricoComTempo(clientId, queueId, email, tempoAtendimento, tempoEsperaMinutos);
        return { tempoEsperaMinutos, tempoEntrada: tempoEntrada, tempoAtendimento };
      }
      
      // Calcular tempo de espera em minutos
      // MySQL retorna datetime no formato 'YYYY-MM-DD HH:MM:SS' em horário local
      // Precisamos fazer parse manual para evitar problemas de timezone
      let tempoEntradaDate;
      
      if (typeof tempo_entrada === 'string' && tempo_entrada.includes(' ') && !tempo_entrada.includes('T')) {
        // Formato MySQL: '2025-10-12 21:54:29'
        // Parse manual para garantir horário local
        const [datePart, timePart] = tempo_entrada.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);
        
        // Criar Date em horário local
        tempoEntradaDate = new Date(year, month - 1, day, hour, minute, second);
      } else if (tempo_entrada instanceof Date) {
        tempoEntradaDate = tempo_entrada;
      } else {
        // Fallback para strings ISO ou outros formatos
        tempoEntradaDate = new Date(tempo_entrada);
      }
      
      const tempoEsperaMs = tempoAtendimento.getTime() - tempoEntradaDate.getTime();
      const tempoEsperaMinutos = Math.max(0, Math.round((tempoEsperaMs / 1000 / 60) * 10) / 10); // Arredondar para 1 casa decimal
      
      console.log(`⏰ Cliente ${email} esperou ${tempoEsperaMinutos} minutos (entrada: ${tempo_entrada}, atendimento: ${tempoAtendimento.toISOString()})`);
      
      // Atualizar histórico com tempo de atendimento e espera
      await this.atualizarHistoricoComTempo(clientId, queueId, email, tempoAtendimento, tempoEsperaMinutos);
      
      // Atualizar média da fila (média móvel ponderada)
      await this.atualizarMediaFila(queueId, tempoEsperaMinutos);
      
      // Calcular intervalo entre chamadas (tempo de atendimento real)
      const intervaloEntreChamadas = await this.calcularIntervaloEntreChamadas(clientId, queueId, tempoAtendimento);
      console.log(`⏱️ Intervalo entre chamadas: ${intervaloEntreChamadas} minutos`);
      
      console.log(`⏰ Cliente ${email} esperou ${tempoEsperaMinutos} minutos`);
      
      return {
        tempoEsperaMinutos,
        tempoEntrada: new Date(tempo_entrada),
        tempoAtendimento,
        intervaloEntreChamadas
      };
      
    } catch (error) {
      console.error('❌ Erro ao registrar atendimento:', error);
      throw error;
    }
  }

  /**
   * Atualiza o histórico com tempo de atendimento e espera
   */
  static async atualizarHistoricoComTempo(clientId, queueId, email, tempoAtendimento, tempoEsperaMinutos) {
    await pool.execute(
      `UPDATE historico_clientes_filas 
       SET tempo_atendimento = ?, tempo_espera_minutos = ?, status = 'atendido'
       WHERE client_id = ? AND queue_id = ? AND email_cliente = ?`,
      [tempoAtendimento, tempoEsperaMinutos, clientId, queueId, email]
    );
  }

  /**
   * Atualiza a média de tempo de espera da fila usando média incremental
   * @param {string} queueId - ID da fila
   * @param {number} tempoEsperaMinutos - Tempo de espera do cliente atendido
   */
  static async atualizarMediaFila(queueId, tempoEsperaMinutos) {
    try {
      // Buscar dados atuais da fila
      const [rows] = await pool.execute(
        `SELECT tempo_medio_espera, total_atendidos_tempo 
         FROM filas 
         WHERE id = ?`,
        [queueId]
      );
      
      if (rows.length === 0) {
        throw new Error('Fila não encontrada');
      }
      
      const { tempo_medio_espera: mediaAtual, total_atendidos_tempo: totalAtendidos } = rows[0];
      
      // Converter para números
      const mediaAtualNum = parseFloat(mediaAtual) || 0;
      const totalAtendidosNum = parseInt(totalAtendidos) || 0;
      
      // Aplicar fórmula da média incremental (média móvel)
      const novoTotal = totalAtendidosNum + 1;
      const novaMedia = totalAtendidosNum === 0 
        ? tempoEsperaMinutos  // Primeiro cliente
        : (mediaAtualNum * totalAtendidosNum + tempoEsperaMinutos) / novoTotal;
      
      // Atualizar fila com nova média
      await pool.execute(
        `UPDATE filas 
         SET tempo_medio_espera = ?, total_atendidos_tempo = ?, ultima_atualizacao_tempo = NOW()
         WHERE id = ?`,
        [novaMedia, novoTotal, queueId]
      );
      
      console.log(`📊 Média de espera da fila ${queueId}: ${mediaAtualNum.toFixed(2)} → ${novaMedia.toFixed(2)} min (${novoTotal} atendidos)`);
      
      return {
        mediaAnterior: mediaAtual,
        novaMedia: novaMedia,
        totalAtendidos: novoTotal
      };
      
    } catch (error) {
      console.error('❌ Erro ao atualizar média da fila:', error);
      throw error;
    }
  }

  /**
   * Obtém o tempo médio de espera de uma fila
   * @param {string} queueId - ID da fila
   * @returns {Object} - Dados do tempo médio
   */
  static async obterTempoMedioFila(queueId) {
    try {
      const [rows] = await pool.execute(
        `SELECT tempo_medio_espera, total_atendidos_tempo, ultima_atualizacao_tempo
         FROM filas 
         WHERE id = ?`,
        [queueId]
      );
      
      if (rows.length === 0) {
        return {
          tempoMedio: 0,
          totalAtendidos: 0,
          ultimaAtualizacao: null
        };
      }
      
      return {
        tempoMedio: rows[0].tempo_medio_espera || 0,
        totalAtendidos: rows[0].total_atendidos_tempo || 0,
        ultimaAtualizacao: rows[0].ultima_atualizacao_tempo
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter tempo médio da fila:', error);
      throw error;
    }
  }

  /**
   * Calcula tempo estimado para um cliente na fila
   * @param {string} queueId - ID da fila
   * @param {number} posicaoAtual - Posição atual do cliente
   * @param {number} atendentesAtivos - Número de atendentes ativos (padrão: 1)
   * @returns {Object} - Estimativa de tempo
   */
  static async calcularTempoEstimado(queueId, posicaoAtual, atendentesAtivos = 1) {
    try {
      const dadosFila = await this.obterTempoMedioFila(queueId);
      const { tempoMedio, totalAtendidos } = dadosFila;
      
      // Se não há dados históricos, usar tempo estimado padrão da fila
      if (totalAtendidos === 0) {
        const [rows] = await pool.execute(
          `SELECT tempo_estimado FROM filas WHERE id = ?`,
          [queueId]
        );
        
        const tempoEstimadoFila = rows.length > 0 ? rows[0].tempo_estimado : 5;
        const tempoEstimado = Math.max(0, (posicaoAtual - 1) * tempoEstimadoFila / atendentesAtivos);
        
        return {
          tempoEstimado: Math.round(tempoEstimado),
          baseadoEmHistorico: false,
          tempoMedioHistorico: 0,
          totalAtendidos: 0
        };
      }
      
      // Calcular tempo estimado baseado na média histórica
      const tempoEstimado = Math.max(0, (posicaoAtual - 1) * tempoMedio / atendentesAtivos);
      
      return {
        tempoEstimado: Math.round(tempoEstimado),
        baseadoEmHistorico: true,
        tempoMedioHistorico: tempoMedio,
        totalAtendidos: totalAtendidos
      };
      
    } catch (error) {
      console.error('❌ Erro ao calcular tempo estimado:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de tempo de espera de uma fila
   * @param {string} queueId - ID da fila
   * @returns {Object} - Estatísticas completas
   */
  static async obterEstatisticasTempo(queueId) {
    try {
      // Estatísticas da fila
      const dadosFila = await this.obterTempoMedioFila(queueId);
      
      // Estatísticas do histórico (últimos 30 dias)
      const [rows] = await pool.execute(
        `SELECT 
           AVG(tempo_espera_minutos) as media_historico,
           MIN(tempo_espera_minutos) as tempo_minimo,
           MAX(tempo_espera_minutos) as tempo_maximo,
           COUNT(*) as total_registros
         FROM historico_clientes_filas 
         WHERE queue_id = ? 
         AND tempo_espera_minutos IS NOT NULL 
         AND data_entrada >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        [queueId]
      );
      
      const stats = rows[0];
      
      return {
        fila: dadosFila,
        historico: {
          media: stats.media_historico || 0,
          minimo: stats.tempo_minimo || 0,
          maximo: stats.tempo_maximo || 0,
          totalRegistros: stats.total_registros || 0
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de tempo:', error);
      throw error;
    }
  }

  // Calcular tempo de atendimento individual (quanto tempo o cliente levou para ser atendido)
  static async calcularTempoAtendimentoIndividual(queueId, tempoEsperaMinutos) {
    try {
      // Simular variação realista no tempo de atendimento
      // Alguns clientes são mais rápidos, outros mais lentos
      const variacao = (Math.random() - 0.5) * 2; // -1 a +1 minutos de variação
      const tempoAtendimento = Math.max(1, tempoEsperaMinutos + variacao);
      
      console.log(`🎯 Tempo de atendimento simulado: ${tempoAtendimento.toFixed(1)} minutos (variação: ${variacao.toFixed(1)})`);
      
      return Math.round(tempoAtendimento * 10) / 10; // Arredondar para 1 casa decimal
    } catch (error) {
      console.error('❌ Erro ao calcular tempo de atendimento individual:', error);
      return tempoEsperaMinutos; // Fallback
    }
  }
  
  /**
   * Calcula o intervalo entre chamadas (tempo médio de atendimento por cliente)
   * Este é o tempo que o estabelecimento leva para atender cada pessoa
   * @param {string} clientId - ID do cliente atual
   * @param {string} queueId - ID da fila
   * @param {Date} tempoAtendimentoAtual - Horário em que este cliente foi chamado
   * @returns {number} - Intervalo em minutos
   */
  static async calcularIntervaloEntreChamadas(clientId, queueId, tempoAtendimentoAtual) {
    try {
      // Buscar o último cliente atendido antes deste
      // Usar diretamente o Date object, o MySQL vai converter corretamente
      const [rows] = await pool.execute(
        `SELECT tempo_atendimento 
         FROM historico_clientes_filas 
         WHERE queue_id = ? 
         AND tempo_atendimento IS NOT NULL 
         AND tempo_atendimento < ?
         ORDER BY tempo_atendimento DESC 
         LIMIT 1`,
        [queueId, tempoAtendimentoAtual]
      );
      
      console.log(`📋 Resultados encontrados: ${rows.length}`);
      if (rows.length > 0) {
        console.log(`   Último atendimento: ${rows[0].tempo_atendimento}`);
      }
      
      let intervaloMinutos = 0;
      
      if (rows.length > 0) {
        const tempoAtendimentoAnterior = rows[0].tempo_atendimento;
        
        // Parse ambas as datas no formato MySQL (horário local)
        let tempoAnteriorDate;
        if (typeof tempoAtendimentoAnterior === 'string' && tempoAtendimentoAnterior.includes(' ') && !tempoAtendimentoAnterior.includes('T')) {
          const [datePart, timePart] = tempoAtendimentoAnterior.split(' ');
          const [yearA, monthA, dayA] = datePart.split('-').map(Number);
          const [hourA, minuteA, secondA] = timePart.split(':').map(Number);
          tempoAnteriorDate = new Date(yearA, monthA - 1, dayA, hourA, minuteA, secondA);
        } else {
          tempoAnteriorDate = new Date(tempoAtendimentoAnterior);
        }
        
        // Calcular intervalo
        const intervaloMs = tempoAtendimentoAtual.getTime() - tempoAnteriorDate.getTime();
        intervaloMinutos = Math.max(0.1, (intervaloMs / 1000 / 60)); // Mínimo 0.1 min (6 segundos)
        
        console.log(`📊 Intervalo calculado: ${intervaloMinutos} min (anterior: ${tempoAtendimentoAnterior}, atual: ${tempoAtendimentoAtual.toISOString()})`);
      } else {
        // Primeiro cliente, usar tempo estimado padrão
        const [filaRows] = await pool.execute(
          `SELECT tempo_estimado FROM filas WHERE id = ?`,
          [queueId]
        );
        intervaloMinutos = filaRows.length > 0 ? filaRows[0].tempo_estimado : 5;
        console.log(`📊 Primeiro cliente, usando tempo estimado: ${intervaloMinutos} min`);
      }
      
      // Salvar o intervalo no histórico
      await pool.execute(
        `UPDATE historico_clientes_filas 
         SET tempo_atendimento_minutos = ? 
         WHERE client_id = ? AND queue_id = ?`,
        [intervaloMinutos, clientId, queueId]
      );
      
      // Atualizar média de intervalo na fila
      await this.atualizarMediaIntervalo(queueId, intervaloMinutos);
      
      return intervaloMinutos;
      
    } catch (error) {
      console.error('❌ Erro ao calcular intervalo entre chamadas:', error);
      return 5; // Fallback padrão
    }
  }
  
  /**
   * Atualiza a média de intervalo entre chamadas usando média incremental
   * @param {string} queueId - ID da fila
   * @param {number} intervaloMinutos - Intervalo do último atendimento
   */
  static async atualizarMediaIntervalo(queueId, intervaloMinutos) {
    try {
      // Buscar dados atuais
      const [rows] = await pool.execute(
        `SELECT tempo_medio_atendimento, total_atendimentos_calculados 
         FROM filas 
         WHERE id = ?`,
        [queueId]
      );
      
      if (rows.length === 0) return;
      
      const mediaAtualStr = rows[0].tempo_medio_atendimento;
      const totalAtendidosStr = rows[0].total_atendimentos_calculados;
      
      const mediaAtual = parseFloat(mediaAtualStr) || 0;
      const totalAtendidos = parseInt(totalAtendidosStr) || 0;
      
      let novaMedia;
      const novoTotal = totalAtendidos + 1;
      
      if (totalAtendidos === 0) {
        // Primeiro atendimento
        novaMedia = intervaloMinutos;
      } else {
        // Média incremental
        novaMedia = mediaAtual + (intervaloMinutos - mediaAtual) / novoTotal;
      }
      
      // Garantir que não seja negativo
      novaMedia = Math.max(0, novaMedia);
      
      await pool.execute(
        `UPDATE filas 
         SET tempo_medio_atendimento = ?, total_atendimentos_calculados = ? 
         WHERE id = ?`,
        [novaMedia.toFixed(2), novoTotal, queueId]
      );
      
      console.log(`📊 Média de intervalo da fila ${queueId}: ${mediaAtual.toFixed(2)} → ${novaMedia.toFixed(2)} min (${novoTotal} atendimentos)`);
      
    } catch (error) {
      console.error('❌ Erro ao atualizar média de intervalo:', error);
    }
  }
}

export default TempoEsperaService;
