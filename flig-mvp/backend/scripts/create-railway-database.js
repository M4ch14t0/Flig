const mysql = require('mysql2/promise');

// Configuração da conexão Railway
const dbConfig = {
  host: 'ballast.proxy.rlwy.net',
  port: 44946,
  user: 'root',
  password: 'XCqoKSCLQrvnDtQTmRnNyAOXrSsIieAz',
  database: 'railway',
  charset: 'utf8mb4'
};

async function createRailwayDatabase() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao Railway MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao Railway MySQL!');

    // Verificar tabelas existentes
    console.log('📊 Verificando tabelas existentes...');
    const [tables] = await connection.execute('SHOW TABLES');
    const existingTables = tables.map(t => Object.values(t)[0]);
    console.log('📋 Tabelas existentes:', existingTables);

    // 1. Criar tabela estabelecimentos se não existir
    if (!existingTables.includes('estabelecimentos')) {
      console.log('📊 Criando tabela estabelecimentos...');
      await connection.execute(`
        CREATE TABLE estabelecimentos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome_empresa VARCHAR(255) NOT NULL,
          email_empresa VARCHAR(255) UNIQUE NOT NULL,
          senha_empresa VARCHAR(255) NOT NULL,
          cnpj VARCHAR(18) UNIQUE NOT NULL,
          telefone VARCHAR(20),
          endereco TEXT,
          cidade VARCHAR(100),
          estado VARCHAR(2),
          cep VARCHAR(10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela estabelecimentos criada');
    }

    // 2. Criar tabela usuarios se não existir
    if (!existingTables.includes('usuarios')) {
      console.log('📊 Criando tabela usuarios...');
      await connection.execute(`
        CREATE TABLE usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome_usuario VARCHAR(255) NOT NULL,
          email_usuario VARCHAR(255) UNIQUE NOT NULL,
          senha_usuario VARCHAR(255) NOT NULL,
          telefone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela usuarios criada');
    }

    // 3. Criar tabela filas se não existir
    if (!existingTables.includes('filas')) {
      console.log('📊 Criando tabela filas...');
      await connection.execute(`
        CREATE TABLE filas (
          id VARCHAR(36) PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          descricao TEXT,
          estabelecimento_id INT NOT NULL,
          status ENUM('ativa', 'inativa', 'pausada') DEFAULT 'ativa',
          tempo_estimado INT DEFAULT 5,
          max_avancos INT DEFAULT 3,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Tabela filas criada');
    }

    // 4. Adicionar campos de tempo de espera à tabela filas
    console.log('📊 Adicionando campos de tempo de espera...');
    try {
      await connection.execute(`
        ALTER TABLE filas 
        ADD COLUMN tempo_medio_espera DECIMAL(8,2) DEFAULT 0.00,
        ADD COLUMN total_atendidos_tempo INT DEFAULT 0,
        ADD COLUMN ultima_atualizacao_tempo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Campos de tempo de espera adicionados');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Campos de tempo de espera já existem');
      } else {
        throw error;
      }
    }

    // 5. Criar tabela de histórico de clientes
    console.log('📊 Criando tabela historico_clientes_filas...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS historico_clientes_filas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id VARCHAR(36) NOT NULL,
        queue_id VARCHAR(36) NOT NULL,
        nome_cliente VARCHAR(255) NOT NULL,
        telefone_cliente VARCHAR(20),
        email_cliente VARCHAR(255),
        posicao_inicial INT NOT NULL,
        posicao_final INT,
        tempo_espera INT,
        valor_pago DECIMAL(10,2) DEFAULT 0.00,
        status ENUM('aguardando', 'chamado', 'atendido', 'cancelado', 'abandonou') DEFAULT 'aguardando',
        data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_saida TIMESTAMP NULL,
        tempo_entrada TIMESTAMP NULL,
        tempo_atendimento TIMESTAMP NULL,
        tempo_espera_minutos DECIMAL(8,2),
        tempo_atendimento_minutos DECIMAL(10,2),
        INDEX idx_queue_client (queue_id, client_id),
        INDEX idx_status (status),
        INDEX idx_data_entrada (data_entrada),
        INDEX idx_tempo_entrada (tempo_entrada),
        INDEX idx_tempo_atendimento (tempo_atendimento),
        INDEX idx_tempo_espera_minutos (tempo_espera_minutos)
      )
    `);
    console.log('✅ Tabela historico_clientes_filas criada');

    // 6. Adicionar campos de chamada automática
    console.log('📊 Adicionando campos de chamada automática...');
    try {
      await connection.execute(`
        ALTER TABLE filas 
        ADD COLUMN chamada_automatica BOOLEAN DEFAULT FALSE,
        ADD COLUMN intervalo_chamada INT DEFAULT 5,
        ADD COLUMN ultima_chamada TIMESTAMP NULL,
        ADD COLUMN modo_chamada ENUM('manual', 'automatico') DEFAULT 'manual',
        ADD COLUMN tempo_medio_atendimento DECIMAL(8,2) DEFAULT 0.00,
        ADD COLUMN total_atendimentos_calculados INT DEFAULT 0
      `);
      console.log('✅ Campos de chamada automática adicionados');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Campos de chamada automática já existem');
      } else {
        throw error;
      }
    }

    // 7. Criar tabela de planos
    console.log('📊 Criando tabela planos...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS planos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        preco DECIMAL(10,2) NOT NULL,
        duracao_meses INT NOT NULL,
        recursos TEXT,
        max_filas INT DEFAULT 1,
        max_clientes_por_fila INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela planos criada');

    // 8. Criar tabela de assinaturas
    console.log('📊 Criando tabela assinaturas...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assinaturas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estabelecimento_id INT NOT NULL,
        plano_id INT NOT NULL,
        status ENUM('ativa', 'cancelada', 'expirada', 'pendente') DEFAULT 'pendente',
        data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_fim TIMESTAMP NULL,
        valor_total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE,
        FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE CASCADE,
        INDEX idx_estabelecimento (estabelecimento_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Tabela assinaturas criada');

    // 9. Criar tabela de pagamentos
    console.log('📊 Criando tabela pagamentos...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pagamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assinatura_id INT NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        status ENUM('pendente', 'aprovado', 'rejeitado', 'cancelado') DEFAULT 'pendente',
        metodo_pagamento VARCHAR(50),
        transaction_id VARCHAR(255),
        data_pagamento TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id) ON DELETE CASCADE,
        INDEX idx_assinatura (assinatura_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Tabela pagamentos criada');

    // 10. Adicionar campos de plano aos estabelecimentos
    console.log('📊 Adicionando campos de plano aos estabelecimentos...');
    try {
      await connection.execute(`
        ALTER TABLE estabelecimentos 
        ADD COLUMN plano_ativo_id INT DEFAULT NULL,
        ADD COLUMN plano_vencimento TIMESTAMP NULL,
        ADD FOREIGN KEY (plano_ativo_id) REFERENCES assinaturas(id) ON DELETE SET NULL
      `);
      console.log('✅ Campos de plano adicionados aos estabelecimentos');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Campos de plano já existem');
      } else {
        throw error;
      }
    }

    // 11. Inserir planos padrão
    console.log('📊 Inserindo planos padrão...');
    try {
      await connection.execute(`
        INSERT INTO planos (nome, descricao, preco, duracao_meses, recursos, max_filas, max_clientes_por_fila) VALUES
        ('Gratuito', 'Plano básico para testes', 0.00, 1, '1 fila, até 10 clientes', 1, 10),
        ('Essencial', 'Plano para pequenos negócios', 29.90, 1, '3 filas, até 50 clientes por fila, relatórios básicos', 3, 50),
        ('Profissional', 'Plano completo para empresas', 59.90, 1, 'Filas ilimitadas, clientes ilimitados, relatórios avançados, API', 999, 999)
      `);
      console.log('✅ Planos padrão inseridos');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠️ Planos padrão já existem');
      } else {
        throw error;
      }
    }

    // 12. Verificar tabelas criadas
    console.log('📊 Verificando tabelas criadas...');
    const [finalTables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas no banco:', finalTables.map(t => Object.values(t)[0]));

    // 13. Verificar estrutura da tabela filas
    console.log('📊 Verificando estrutura da tabela filas...');
    const [filasStructure] = await connection.execute('DESCRIBE filas');
    console.log('📋 Campos da tabela filas:', filasStructure.map(f => f.Field));

    console.log('🎉 Configuração completa do banco Railway concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
    console.error('❌ Código do erro:', error.code);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

createRailwayDatabase();




