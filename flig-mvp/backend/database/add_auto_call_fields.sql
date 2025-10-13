-- Adicionar campos de chamada automática à tabela filas
ALTER TABLE filas 
ADD COLUMN chamada_automatica BOOLEAN DEFAULT FALSE,
ADD COLUMN intervalo_chamada INT DEFAULT 5,
ADD COLUMN ultima_chamada TIMESTAMP NULL,
ADD COLUMN modo_chamada ENUM('manual', 'automatico') DEFAULT 'manual',
ADD COLUMN tempo_medio_atendimento DECIMAL(8,2) DEFAULT 0.00,
ADD COLUMN total_atendimentos_calculados INT DEFAULT 0;