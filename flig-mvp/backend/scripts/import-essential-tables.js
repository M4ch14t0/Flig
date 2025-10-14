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

async function importEssentialTables() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao Railway MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao Railway MySQL!');

    // 1. Criar tabela estabelecimentos
    console.log('📊 Criando tabela estabelecimentos...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS estabelecimentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome_empresa VARCHAR(255) NOT NULL,
        cnpj VARCHAR(18) NOT NULL,
        cep_empresa VARCHAR(10),
        endereco_empresa VARCHAR(500),
        telefone_empresa VARCHAR(20),
        email_empresa VARCHAR(255) NOT NULL,
        senha_empresa VARCHAR(255) NOT NULL,
        descricao TEXT,
        categoria VARCHAR(100),
        horario_funcionamento VARCHAR(100),
        capacidade_maxima INT DEFAULT 100,
        status ENUM('ativo','inativo','suspenso') DEFAULT 'ativo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        reset_token VARCHAR(64),
        reset_expires DATETIME,
        plano_ativo_id INT,
        plano_vencimento DATE,
        UNIQUE KEY cnpj (cnpj),
        UNIQUE KEY email_empresa (email_empresa)
      )
    `);
    console.log('✅ Tabela estabelecimentos criada');

    // 2. Criar tabela usuarios
    console.log('📊 Criando tabela usuarios...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome_usuario VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) NOT NULL,
        data_nascimento DATE,
        telefone_usuario VARCHAR(20),
        email_usuario VARCHAR(255) NOT NULL,
        senha_usuario VARCHAR(255) NOT NULL,
        cep_usuario VARCHAR(10),
        endereco_usuario VARCHAR(500),
        bairro_usuario VARCHAR(100),
        cidade_usuario VARCHAR(100),
        uf_usuario VARCHAR(2),
        numero_usuario VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        reset_token VARCHAR(64),
        reset_expires DATETIME,
        UNIQUE KEY cpf (cpf),
        UNIQUE KEY email_usuario (email_usuario)
      )
    `);
    console.log('✅ Tabela usuarios criada');

    // 3. Criar tabela planos
    console.log('📊 Criando tabela planos...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS planos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        preco DECIMAL(10,2) NOT NULL,
        periodo VARCHAR(20) DEFAULT 'monthly',
        max_filas INT,
        max_clientes_por_fila INT,
        recursos JSON,
        ativo TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela planos criada');

    // 4. Criar tabela filas
    console.log('📊 Criando tabela filas...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS filas (
        id VARCHAR(36) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        estabelecimento_id INT NOT NULL,
        descricao TEXT,
        status ENUM('ativa','pausada','encerrada') DEFAULT 'ativa',
        max_avancos INT DEFAULT 8,
        valor_avancos DECIMAL(10,2) DEFAULT 2.00,
        tempo_estimado INT DEFAULT 5,
        total_clientes_atendidos INT DEFAULT 0,
        receita_total DECIMAL(12,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        tempo_medio_espera DECIMAL(8,2) DEFAULT 0.00,
        total_atendidos_tempo INT DEFAULT 0,
        ultima_atualizacao_tempo TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        chamada_automatica TINYINT(1) DEFAULT 0,
        intervalo_chamada INT DEFAULT 5,
        ultima_chamada TIMESTAMP NULL,
        modo_chamada ENUM('manual','automatico','misto') DEFAULT 'manual',
        tempo_medio_atendimento DECIMAL(10,2) DEFAULT 0.00,
        total_atendimentos_calculados INT DEFAULT 0,
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela filas criada');

    // 5. Criar tabela assinaturas
    console.log('📊 Criando tabela assinaturas...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assinaturas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estabelecimento_id INT NOT NULL,
        plano_id INT NOT NULL,
        status ENUM('active','inactive','cancelled','expired','pending') DEFAULT 'pending',
        data_inicio DATE NOT NULL,
        data_vencimento DATE NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        moeda VARCHAR(3) DEFAULT 'BRL',
        payment_id VARCHAR(255),
        subscription_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE,
        FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela assinaturas criada');

    // 6. Criar tabela historico_clientes_filas
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
        status ENUM('aguardando','chamado','atendido','cancelado','abandonou') DEFAULT 'aguardando',
        data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_saida TIMESTAMP NULL,
        tempo_entrada TIMESTAMP NULL,
        tempo_atendimento TIMESTAMP NULL,
        tempo_espera_minutos DECIMAL(8,2),
        tempo_atendimento_minutos DECIMAL(10,2),
        FOREIGN KEY (queue_id) REFERENCES filas(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela historico_clientes_filas criada');

    // 7. Criar tabela pagamentos
    console.log('📊 Criando tabela pagamentos...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pagamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assinatura_id INT NOT NULL,
        payment_id VARCHAR(255) NOT NULL,
        status ENUM('pending','approved','rejected','cancelled','refunded') DEFAULT 'pending',
        valor DECIMAL(10,2) NOT NULL,
        moeda VARCHAR(3) DEFAULT 'BRL',
        metodo_pagamento VARCHAR(50),
        data_pagamento TIMESTAMP NULL,
        data_vencimento TIMESTAMP NULL,
        webhook_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela pagamentos criada');

    // 8. Criar tabela transacoes_pagamentos
    console.log('📊 Criando tabela transacoes_pagamentos...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transacoes_pagamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(100) NOT NULL,
        client_id VARCHAR(36) NOT NULL,
        queue_id VARCHAR(36) NOT NULL,
        positions INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM('credit_card','debit_card','pix','boleto') DEFAULT 'credit_card',
        status ENUM('pending','approved','failed','confirmed','refunded') DEFAULT 'pending',
        error_message TEXT,
        payment_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY transaction_id (transaction_id),
        FOREIGN KEY (queue_id) REFERENCES filas(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela transacoes_pagamentos criada');

    // 9. Inserir planos padrão
    console.log('📊 Inserindo planos padrão...');
    await connection.execute(`
      INSERT IGNORE INTO planos (id, nome, descricao, preco, max_filas, max_clientes_por_fila, recursos) VALUES
      (1, 'Gratuito', 'Plano básico para testes', 0.00, 1, 10, '{"relatorios": false, "api": false}'),
      (2, 'Essencial', 'Plano para pequenos negócios', 29.90, 3, 50, '{"relatorios": true, "api": false}'),
      (3, 'Profissional', 'Plano completo para empresas', 59.90, 999, 999, '{"relatorios": true, "api": true}')
    `);
    console.log('✅ Planos padrão inseridos');

    // 10. Verificar tabelas criadas
    console.log('📊 Verificando tabelas criadas...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas no banco:', tables.map(t => Object.values(t)[0]));

    // 11. Verificar dados
    console.log('📊 Verificando dados...');
    
    const [estabelecimentos] = await connection.execute('SELECT COUNT(*) as total FROM estabelecimentos');
    console.log('🏢 Estabelecimentos:', estabelecimentos[0].total);

    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    console.log('👥 Usuários:', usuarios[0].total);

    const [filas] = await connection.execute('SELECT COUNT(*) as total FROM filas');
    console.log('📋 Filas:', filas[0].total);

    const [planos] = await connection.execute('SELECT COUNT(*) as total FROM planos');
    console.log('💳 Planos:', planos[0].total);

    console.log('🎉 Importação das tabelas essenciais concluída com sucesso!');
    console.log('🚀 Agora você pode fazer o deploy do backend!');

  } catch (error) {
    console.error('❌ Erro na importação:', error.message);
    console.error('❌ Código do erro:', error.code);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

importEssentialTables();
