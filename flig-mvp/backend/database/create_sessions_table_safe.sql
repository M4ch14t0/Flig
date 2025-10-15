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

-- Verificar e adicionar campo de status aos usuários se não existir
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_NAME = 'usuarios' 
   AND COLUMN_NAME = 'status' 
   AND TABLE_SCHEMA = DATABASE()) = 0,
  'ALTER TABLE usuarios ADD COLUMN status ENUM(\'active\', \'inactive\', \'suspended\') DEFAULT \'active\'',
  'SELECT "Column status already exists in usuarios" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar campo de status aos estabelecimentos se não existir
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_NAME = 'estabelecimentos' 
   AND COLUMN_NAME = 'status' 
   AND TABLE_SCHEMA = DATABASE()) = 0,
  'ALTER TABLE estabelecimentos ADD COLUMN status ENUM(\'active\', \'inactive\', \'suspended\') DEFAULT \'active\'',
  'SELECT "Column status already exists in estabelecimentos" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios(status);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_status ON estabelecimentos(status);

