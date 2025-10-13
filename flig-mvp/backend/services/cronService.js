const AutoCallService = require('./autoCallService');

class CronService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Inicia o serviço de cron para chamadas automáticas
   * @param {number} intervaloMinutos - Intervalo em minutos (padrão: 1 minuto)
   */
  iniciar(intervaloMinutos = 1) {
    if (this.isRunning) {
      console.log('⚠️ Serviço de cron já está rodando');
      return;
    }

    console.log(`🕐 Iniciando serviço de cron para chamadas automáticas (intervalo: ${intervaloMinutos} min)`);
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      try {
        console.log('🤖 Verificando chamadas automáticas...');
        const resultado = await AutoCallService.executarTodasChamadas();
        
        if (resultado.sucessos > 0) {
          console.log(`✅ ${resultado.sucessos} chamadas automáticas executadas com sucesso`);
        }
      } catch (error) {
        console.error('❌ Erro no serviço de cron:', error);
      }
    }, intervaloMinutos * 60 * 1000); // Converter para milissegundos

    console.log('✅ Serviço de cron iniciado');
  }

  /**
   * Para o serviço de cron
   */
  parar() {
    if (!this.isRunning) {
      console.log('⚠️ Serviço de cron não está rodando');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('🛑 Serviço de cron parado');
  }

  /**
   * Verifica se o serviço está rodando
   * @returns {boolean}
   */
  estaRodando() {
    return this.isRunning;
  }

  /**
   * Executa uma verificação manual (para testes)
   */
  async executarVerificacaoManual() {
    try {
      console.log('🔍 Executando verificação manual de chamadas automáticas...');
      const resultado = await AutoCallService.executarTodasChamadas();
      
      console.log(`📊 Resultado da verificação manual:`);
      console.log(`   Total de filas: ${resultado.totalFilas}`);
      console.log(`   Sucessos: ${resultado.sucessos}`);
      console.log(`   Falhas: ${resultado.falhas}`);
      
      return resultado;
    } catch (error) {
      console.error('❌ Erro na verificação manual:', error);
      throw error;
    }
  }
}

// Instância singleton
const cronService = new CronService();

module.exports = cronService;
