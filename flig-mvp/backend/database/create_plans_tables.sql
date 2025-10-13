-- Criar tabela de planos
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
);

-- Criar tabela de assinaturas
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
);

-- Criar tabela de pagamentos
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
);

-- Adicionar campos de plano à tabela estabelecimentos
ALTER TABLE estabelecimentos 
ADD COLUMN plano_ativo_id INT DEFAULT NULL,
ADD COLUMN plano_vencimento TIMESTAMP NULL,
ADD FOREIGN KEY (plano_ativo_id) REFERENCES assinaturas(id) ON DELETE SET NULL;

-- Inserir planos padrão
INSERT INTO planos (nome, descricao, preco, duracao_meses, recursos, max_filas, max_clientes_por_fila) VALUES
('Gratuito', 'Plano básico para testes', 0.00, 1, '1 fila, até 10 clientes', 1, 10),
('Essencial', 'Plano para pequenos negócios', 29.90, 1, '3 filas, até 50 clientes por fila, relatórios básicos', 3, 50),
('Profissional', 'Plano completo para empresas', 59.90, 1, 'Filas ilimitadas, clientes ilimitados, relatórios avançados, API', 999, 999);