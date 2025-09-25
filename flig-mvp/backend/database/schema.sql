-- Schema MySQL para Sistema Flig
-- Este arquivo contém todas as tabelas necessárias para o sistema de filas virtuais
-- 
-- IMPORTANTE: Este schema será movido para um VPS após período de testes
-- 
-- @author Flig Team
-- @version 1.0.0

-- Criação do banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS flig_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE flig_db;

-- Tabela de usuários (clientes)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone_usuario VARCHAR(20),
    email_usuario VARCHAR(255) UNIQUE NOT NULL,
    senha_usuario VARCHAR(255) NOT NULL,
    cep_usuario VARCHAR(10),
    endereco_usuario VARCHAR(500),
    numero_usuario VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cpf (cpf),
    INDEX idx_email (email_usuario),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de estabelecimentos
CREATE TABLE IF NOT EXISTS estabelecimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_empresa VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    cep_empresa VARCHAR(10),
    endereco_empresa VARCHAR(500),
    telefone_empresa VARCHAR(20),
    email_empresa VARCHAR(255),
    senha_empresa VARCHAR(255),
    descricao TEXT,
    categoria VARCHAR(100),
    horario_funcionamento VARCHAR(100),
    capacidade_maxima INT DEFAULT 100,
    status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cnpj (cnpj),
    INDEX idx_email (email_empresa),
    INDEX idx_status (status),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de filas (dados persistentes)
CREATE TABLE IF NOT EXISTS filas (
    id VARCHAR(36) PRIMARY KEY, -- UUID da fila
    nome VARCHAR(255) NOT NULL,
    estabelecimento_id INT NOT NULL,
    descricao TEXT,
    status ENUM('ativa', 'pausada', 'encerrada') DEFAULT 'ativa',
    max_avancos INT DEFAULT 8,
    valor_avancos DECIMAL(10,2) DEFAULT 2.00,
    tempo_estimado INT DEFAULT 5, -- minutos por posição
    total_clientes_atendidos INT DEFAULT 0,
    receita_total DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    INDEX idx_estabelecimento (estabelecimento_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de transações de pagamento
CREATE TABLE IF NOT EXISTS transacoes_pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    client_id VARCHAR(36) NOT NULL, -- UUID do cliente
    queue_id VARCHAR(36) NOT NULL, -- UUID da fila
    positions INT NOT NULL, -- número de posições avançadas
    amount DECIMAL(10,2) NOT NULL, -- valor pago
    payment_method ENUM('credit_card', 'debit_card', 'pix', 'boleto') DEFAULT 'credit_card',
    status ENUM('pending', 'approved', 'failed', 'confirmed') DEFAULT 'pending',
    error_message TEXT NULL,
    payment_data JSON NULL, -- dados do pagamento (criptografados)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (queue_id) REFERENCES filas(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_client_id (client_id),
    INDEX idx_queue_id (queue_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de histórico de clientes nas filas
CREATE TABLE IF NOT EXISTS historico_clientes_filas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(36) NOT NULL,
    queue_id VARCHAR(36) NOT NULL,
    nome_cliente VARCHAR(255) NOT NULL,
    telefone_cliente VARCHAR(20),
    email_cliente VARCHAR(255),
    posicao_inicial INT NOT NULL,
    posicao_final INT,
    tempo_espera INT, -- minutos
    valor_pago DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('aguardando', 'atendido', 'cancelado', 'abandonou') DEFAULT 'aguardando',
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_saida TIMESTAMP NULL,
    
    FOREIGN KEY (queue_id) REFERENCES filas(id) ON DELETE CASCADE,
    INDEX idx_client_id (client_id),
    INDEX idx_queue_id (queue_id),
    INDEX idx_status (status),
    INDEX idx_data_entrada (data_entrada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de relatórios diários
CREATE TABLE IF NOT EXISTS relatorios_diarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estabelecimento_id INT NOT NULL,
    queue_id VARCHAR(36) NOT NULL,
    data_relatorio DATE NOT NULL,
    total_clientes INT DEFAULT 0,
    clientes_atendidos INT DEFAULT 0,
    tempo_medio_espera DECIMAL(8,2) DEFAULT 0.00, -- minutos
    receita_total DECIMAL(12,2) DEFAULT 0.00,
    total_avancos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    FOREIGN KEY (queue_id) REFERENCES filas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_report (estabelecimento_id, queue_id, data_relatorio),
    INDEX idx_estabelecimento (estabelecimento_id),
    INDEX idx_queue_id (queue_id),
    INDEX idx_data_relatorio (data_relatorio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_chave (chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de logs do sistema
CREATE TABLE IF NOT EXISTS logs_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nivel ENUM('info', 'warning', 'error', 'debug') DEFAULT 'info',
    modulo VARCHAR(100) NOT NULL,
    acao VARCHAR(255) NOT NULL,
    descricao TEXT,
    dados_extras JSON NULL,
    ip_origem VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_nivel (nivel),
    INDEX idx_modulo (modulo),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserção de configurações padrão do sistema
INSERT INTO configuracoes_sistema (chave, valor, descricao, tipo) VALUES
('max_avancos_por_pagamento', '8', 'Número máximo de posições que podem ser avançadas por pagamento', 'number'),
('valor_base_avancos', '2.00', 'Valor base por posição avançada', 'number'),
('tempo_estimado_por_posicao', '5', 'Tempo estimado em minutos por posição na fila', 'number'),
('redis_connection_timeout', '5000', 'Timeout de conexão com Redis em milissegundos', 'number'),
('encryption_key_rotation_days', '90', 'Dias para rotação da chave de criptografia', 'number'),
('max_queue_size', '1000', 'Número máximo de clientes por fila', 'number'),
('auto_close_inactive_queues_hours', '24', 'Horas para fechar automaticamente filas inativas', 'number'),
('enable_payment_simulation', 'true', 'Habilitar simulação de pagamentos (apenas para testes)', 'boolean')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- Criação de views para relatórios
CREATE VIEW view_estatisticas_estabelecimentos AS
SELECT 
    e.id,
    e.nome_empresa,
    e.cnpj,
    e.status,
    COUNT(DISTINCT f.id) as total_filas,
    COUNT(DISTINCT CASE WHEN f.status = 'ativa' THEN f.id END) as filas_ativas,
    SUM(f.total_clientes_atendidos) as total_clientes_atendidos,
    SUM(f.receita_total) as receita_total,
    AVG(f.tempo_estimado) as tempo_medio_estimado
FROM estabelecimentos e
LEFT JOIN filas f ON e.id = f.estabelecimento_id
GROUP BY e.id, e.nome_empresa, e.cnpj, e.status;

CREATE VIEW view_estatisticas_filas AS
SELECT 
    f.id,
    f.nome,
    f.estabelecimento_id,
    e.nome_empresa,
    f.status,
    f.total_clientes_atendidos,
    f.receita_total,
    f.max_avancos,
    f.valor_avancos,
    f.tempo_estimado,
    COUNT(t.id) as total_transacoes,
    SUM(CASE WHEN t.status = 'approved' THEN t.amount ELSE 0 END) as receita_confirmada,
    AVG(CASE WHEN t.status = 'approved' THEN t.positions ELSE NULL END) as media_posicoes_avancadas
FROM filas f
LEFT JOIN estabelecimentos e ON f.estabelecimento_id = e.id
LEFT JOIN transacoes_pagamento t ON f.id = t.queue_id
GROUP BY f.id, f.nome, f.estabelecimento_id, e.nome_empresa, f.status, f.total_clientes_atendidos, f.receita_total, f.max_avancos, f.valor_avancos, f.tempo_estimado;

-- Triggers para atualização automática de estatísticas
DELIMITER //

CREATE TRIGGER tr_update_queue_stats_after_transaction
AFTER INSERT ON transacoes_pagamentos
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE filas 
        SET 
            receita_total = receita_total + NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.queue_id;
    END IF;
END//

CREATE TRIGGER tr_log_system_events
AFTER INSERT ON filas
FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (nivel, modulo, acao, descricao, dados_extras)
    VALUES ('info', 'filas', 'criacao', CONCAT('Nova fila criada: ', NEW.nome), JSON_OBJECT('queue_id', NEW.id, 'estabelecimento_id', NEW.estabelecimento_id));
END//

DELIMITER ;

-- Índices adicionais para performance
CREATE INDEX idx_filas_status_estabelecimento ON filas(status, estabelecimento_id);
CREATE INDEX idx_transacoes_status_queue ON transacoes_pagamentos(status, queue_id);
CREATE INDEX idx_historico_status_data ON historico_clientes_filas(status, data_entrada);

-- Comentários das tabelas
ALTER TABLE usuarios COMMENT = 'Tabela de usuários (clientes) do sistema Flig';
ALTER TABLE estabelecimentos COMMENT = 'Tabela de estabelecimentos cadastrados no sistema';
ALTER TABLE filas COMMENT = 'Tabela de filas virtuais criadas pelos estabelecimentos';
ALTER TABLE transacoes_pagamentos COMMENT = 'Histórico de transações de pagamento para avanço de posições';
ALTER TABLE historico_clientes_filas COMMENT = 'Histórico de clientes que passaram pelas filas';
ALTER TABLE relatorios_diarios COMMENT = 'Relatórios diários de performance das filas';
ALTER TABLE configuracoes_sistema COMMENT = 'Configurações globais do sistema';
ALTER TABLE logs_sistema COMMENT = 'Logs de eventos e erros do sistema';

-- Verificação de integridade
SELECT 'Schema criado com sucesso!' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'flig_db';
SELECT COUNT(*) as total_configs FROM configuracoes_sistema;

