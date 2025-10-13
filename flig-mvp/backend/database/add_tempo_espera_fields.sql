-- Adicionar campos de tempo de espera à tabela filas
ALTER TABLE filas 
ADD COLUMN tempo_medio_espera DECIMAL(8,2) DEFAULT 0.00,
ADD COLUMN total_atendidos_tempo INT DEFAULT 0,
ADD COLUMN ultima_atualizacao_tempo TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Criar tabela para histórico de clientes nas filas
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
);