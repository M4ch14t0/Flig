-- Adicionar colunas de descrição e imagem na tabela estabelecimentos
-- Para suportar descrição da empresa e upload de imagem

-- Adicionar coluna de descrição
ALTER TABLE estabelecimentos 
ADD COLUMN descricao_empresa TEXT NULL COMMENT 'Descrição da empresa';

-- Adicionar coluna de imagem
ALTER TABLE estabelecimentos 
ADD COLUMN imagem_empresa VARCHAR(500) NULL COMMENT 'Caminho da imagem da empresa';

-- Adicionar índices para melhor performance
CREATE INDEX idx_estabelecimentos_descricao ON estabelecimentos(descricao_empresa(100));
CREATE INDEX idx_estabelecimentos_imagem ON estabelecimentos(imagem_empresa);

-- Comentários para documentação
ALTER TABLE estabelecimentos 
MODIFY COLUMN descricao_empresa TEXT NULL COMMENT 'Descrição da empresa - campo de texto livre para informações sobre o estabelecimento';

ALTER TABLE estabelecimentos 
MODIFY COLUMN imagem_empresa VARCHAR(500) NULL COMMENT 'Caminho da imagem da empresa - armazena o caminho do arquivo de imagem no servidor';
