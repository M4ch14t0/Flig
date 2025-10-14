const mysql = require('mysql2/promise');

// Configuração da conexão Railway existente
const dbConfig = {
  host: 'shinkansen.proxy.rlwy.net',
  port: 34823,
  user: 'root',
  password: 'XTtZbdYBcTsBNRqekJDbhdUBVSeFPFho',
  database: 'flig_db',
  charset: 'utf8mb4'
};

async function addMissingTables() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao Railway MySQL existente...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao Railway MySQL existente!');

    // Verificar tabelas existentes
    console.log('📊 Verificando tabelas existentes...');
    const [tables] = await connection.execute('SHOW TABLES');
    const existingTables = tables.map(t => Object.values(t)[0]);
    console.log('📋 Tabelas existentes:', existingTables);

    // 1. Criar tabela planos se não existir
    if (!existingTables.includes('planos')) {
      console.log('📊 Criando tabela planos...');
      await connection.execute(`
        CREATE TABLE planos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          descricao TEXT,
          preco DECIMAL(10,2) NOT NULL,
          periodo VARCHAR(20) NOT NULL DEFAULT 'monthly',
          max_filas INT,
          max_clientes_por_fila INT,
          recursos JSON,
          ativo TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela planos criada');
    } else {
      console.log('✅ Tabela planos já existe');
    }

    // 2. Criar tabela assinaturas se não existir
    if (!existingTables.includes('assinaturas')) {
      console.log('📊 Criando tabela assinaturas...');
      await connection.execute(`
        CREATE TABLE assinaturas (
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
    } else {
      console.log('✅ Tabela assinaturas já existe');
    }

    // 3. Criar tabela pagamentos se não existir
    if (!existingTables.includes('pagamentos')) {
      console.log('📊 Criando tabela pagamentos...');
      await connection.execute(`
        CREATE TABLE pagamentos (
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
    } else {
      console.log('✅ Tabela pagamentos já existe');
    }

    // 4. Adicionar campos de tempo de espera à tabela filas se não existirem
    console.log('📊 Verificando campos de tempo de espera na tabela filas...');
    try {
      await connection.execute('ALTER TABLE filas ADD COLUMN tempo_medio_espera DECIMAL(8,2) DEFAULT 0.00');
      console.log('✅ Campo tempo_medio_espera adicionado');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo tempo_medio_espera já existe');
      } else {
        throw e;
      }
    }

    try {
      await connection.execute('ALTER TABLE filas ADD COLUMN total_atendidos_tempo INT DEFAULT 0');
      console.log('✅ Campo total_atendidos_tempo adicionado');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo total_atendidos_tempo já existe');
      } else {
        throw e;
      }
    }

    try {
      await connection.execute('ALTER TABLE filas ADD COLUMN ultima_atualizacao_tempo TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      console.log('✅ Campo ultima_atualizacao_tempo adicionado');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo ultima_atualizacao_tempo já existe');
      } else {
        throw e;
      }
    }

    // 5. Adicionar campos de chamada automática
    try {
      await connection.execute('ALTER TABLE filas ADD COLUMN chamada_automatica TINYINT(1) DEFAULT 0');
      console.log('✅ Campo chamada_automatica adicionado');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo chamada_automatica já existe');
      } else {
        throw e;
      }
    }

    try {
      await connection.execute('ALTER TABLE filas ADD COLUMN intervalo_chamada INT DEFAULT 5');
      console.log('✅ Campo intervalo_chamada adicionado');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo intervalo_chamada já existe');
      } else {
        throw e;
      }
    }

    try {
      await connection.execute('ALTER TABLE filas ADD COLUMN ultima_chamada TIMESTAMP NULL');
      console.log('✅ Campo ultima_chamada adicionado');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo ultima_chamada já existe');
      } else {
        throw e;
      }
    }

    try {
      await connection.execute('ALTER TABLE filas ADD COLUMN modo_chamada ENUM("manual","automatico","misto") DEFAULT "manual"');
      console.log('✅ Campo modo_chamada adicionado');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo modo_chamada já existe');
      } else {
        throw e;
      }
    }

    try {
      await connection.execute('ALTER TABLE filas ADD COLUMN tempo_medio_atendimento DECIMAL(10,2) DEFAULT 0.00');
      console.log('✅ Campo tempo_medio_atendimento adicionado');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo tempo_medio_atendimento já existe');
      } else {
        throw e;
      }
    }

    try {
      await connection.execute('ALTER TABLE filas ADD COLUMN total_atendimentos_calculados INT DEFAULT 0');
      console.log('✅ Campo total_atendimentos_calculados adicionado');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo total_atendimentos_calculados já existe');
      } else {
        throw e;
      }
    }

    // 6. Adicionar campos de plano aos estabelecimentos
    try {
      await connection.execute('ALTER TABLE estabelecimentos ADD COLUMN plano_ativo_id INT');
      console.log('✅ Campo plano_ativo_id adicionado aos estabelecimentos');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo plano_ativo_id já existe');
      } else {
        throw e;
      }
    }

    try {
      await connection.execute('ALTER TABLE estabelecimentos ADD COLUMN plano_vencimento DATE');
      console.log('✅ Campo plano_vencimento adicionado aos estabelecimentos');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Campo plano_vencimento já existe');
      } else {
        throw e;
      }
    }

    // 7. Inserir planos padrão se não existirem
    console.log('📊 Verificando planos padrão...');
    try {
      const [planos] = await connection.execute('SELECT COUNT(*) as total FROM planos');
      if (planos[0].total === 0) {
        console.log('📊 Inserindo planos padrão...');
        await connection.execute(`
          INSERT INTO planos (nome, descricao, preco, periodo, max_filas, max_clientes_por_fila, recursos) VALUES
          ('Gratuito', 'Plano básico para testes', 0.00, 'monthly', 1, 10, '{"relatorios": false, "api": false}'),
          ('Essencial', 'Plano para pequenos negócios', 29.90, 'monthly', 3, 50, '{"relatorios": true, "api": false}'),
          ('Profissional', 'Plano completo para empresas', 59.90, 'monthly', 999, 999, '{"relatorios": true, "api": true}')
        `);
        console.log('✅ Planos padrão inseridos');
      } else {
        console.log('✅ Planos já existem:', planos[0].total);
      }
    } catch (e) {
      console.log('⚠️ Erro ao verificar/inserir planos:', e.message);
    }

    // 8. Verificar tabelas finais
    console.log('📊 Verificando tabelas finais...');
    const [finalTables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas no banco:', finalTables.map(t => Object.values(t)[0]));

    // 9. Verificar dados finais
    console.log('📊 Verificando dados finais...');
    
    const [estabelecimentos] = await connection.execute('SELECT COUNT(*) as total FROM estabelecimentos');
    console.log('🏢 Estabelecimentos:', estabelecimentos[0].total);

    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    console.log('👥 Usuários:', usuarios[0].total);

    const [filas] = await connection.execute('SELECT COUNT(*) as total FROM filas');
    console.log('📋 Filas:', filas[0].total);

    const [planos] = await connection.execute('SELECT COUNT(*) as total FROM planos');
    console.log('💳 Planos:', planos[0].total);

    const [assinaturas] = await connection.execute('SELECT COUNT(*) as total FROM assinaturas');
    console.log('📝 Assinaturas:', assinaturas[0].total);

    const [pagamentos] = await connection.execute('SELECT COUNT(*) as total FROM pagamentos');
    console.log('💰 Pagamentos:', pagamentos[0].total);

    console.log('🎉 Configuração do banco Railway concluída com sucesso!');
    console.log('🚀 Agora você pode fazer o deploy do backend!');

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

addMissingTables();




