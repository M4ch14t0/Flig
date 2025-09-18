-- Script de Migração para Corrigir Database Flig
-- Este script aplica as correções necessárias no banco existente
-- 
-- CORREÇÕES:
-- 1. Renomear tabela transacoes_pagamento para transacoes_pagamentos
-- 2. Adicionar tabelas faltantes: notificacoes e user_devices
-- 3. Corrigir nome do banco de fligdb para flig_db
-- 
-- @author Flig Team
-- @version 1.0.1

-- Usar o banco correto
USE flig_db;

-- 1. RENOMEAR TABELA DE TRANSAÇÕES (se existir com nome antigo)
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'flig_db' 
    AND table_name = 'transacoes_pagamento'
);

SET @sql = IF(@table_exists > 0, 
    'RENAME TABLE transacoes_pagamento TO transacoes_pagamentos', 
    'SELECT "Tabela transacoes_pagamento não existe, pulando renomeação" as status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. CRIAR TABELA NOTIFICAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('cliente', 'estabelecimento') NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL,
    channels JSON NOT NULL, -- array de canais de envio
    status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_user_type (user_type),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CRIAR TABELA USER_DEVICES (se não existir)
CREATE TABLE IF NOT EXISTS user_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('cliente', 'estabelecimento') NOT NULL,
    device_token VARCHAR(500) NOT NULL,
    device_type ENUM('ios', 'android', 'web') NOT NULL,
    device_info JSON NULL,
    active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_device_token (device_token),
    INDEX idx_user_id (user_id),
    INDEX idx_user_type (user_type),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ADICIONAR CAMPOS FALTANTES NA TABELA ESTABELECIMENTOS
ALTER TABLE estabelecimentos 
ADD COLUMN IF NOT EXISTS email_empresa VARCHAR(255) UNIQUE NOT NULL DEFAULT 'temp@email.com' AFTER telefone_empresa,
ADD COLUMN IF NOT EXISTS senha_empresa VARCHAR(255) NOT NULL DEFAULT 'temp_password' AFTER email_empresa;

-- 5. ATUALIZAR CONFIGURAÇÕES DO SISTEMA
INSERT INTO configuracoes_sistema (chave, valor, descricao, tipo) VALUES
('notification_retry_attempts', '3', 'Número de tentativas para reenvio de notificações', 'number'),
('notification_retry_delay', '5000', 'Delay entre tentativas de reenvio em milissegundos', 'number')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- 6. RECRIAR VIEWS COM NOMES CORRETOS
DROP VIEW IF EXISTS view_estatisticas_filas;
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
LEFT JOIN transacoes_pagamentos t ON f.id = t.queue_id
GROUP BY f.id, f.nome, f.estabelecimento_id, e.nome_empresa, f.status, f.total_clientes_atendidos, f.receita_total, f.max_avancos, f.valor_avancos, f.tempo_estimado;

-- 7. RECRIAR TRIGGERS COM NOMES CORRETOS
DROP TRIGGER IF EXISTS tr_update_queue_stats_after_transaction;
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
DELIMITER ;

-- 8. ADICIONAR ÍNDICES FALTANTES
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_status ON notificacoes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON user_devices(user_id, active);

-- 9. ADICIONAR COMENTÁRIOS NAS NOVAS TABELAS
ALTER TABLE notificacoes COMMENT = 'Sistema de notificações para usuários';
ALTER TABLE user_devices COMMENT = 'Dispositivos registrados para push notifications';

-- 10. VERIFICAÇÃO FINAL
SELECT 'Migração concluída com sucesso!' as status;
SELECT table_name as 'Tabelas Existentes' FROM information_schema.tables 
WHERE table_schema = 'flig_db' 
ORDER BY table_name;

-- Verificar se todas as tabelas necessárias existem
SELECT 
    CASE 
        WHEN COUNT(*) = 10 THEN '✅ Todas as tabelas estão presentes'
        ELSE CONCAT('⚠️ Faltam ', (10 - COUNT(*)), ' tabelas')
    END as verificacao_tabelas
FROM information_schema.tables 
WHERE table_schema = 'flig_db' 
AND table_name IN (
    'usuarios', 'estabelecimentos', 'filas', 'transacoes_pagamentos', 
    'historico_clientes_filas', 'notificacoes', 'user_devices', 
    'relatorios_diarios', 'configuracoes_sistema', 'logs_sistema'
);

