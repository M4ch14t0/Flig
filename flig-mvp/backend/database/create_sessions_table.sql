-- Tabela para gerenciar sessões ativas
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_type ENUM('cliente', 'estabelecimento') NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  device_info TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_active (is_active)
);

-- Adicionar campo de status aos usuários
ALTER TABLE usuarios ADD COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active';
ALTER TABLE estabelecimentos ADD COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active';

-- Índices para performance
CREATE INDEX idx_usuarios_status ON usuarios(status);
CREATE INDEX idx_estabelecimentos_status ON estabelecimentos(status);

