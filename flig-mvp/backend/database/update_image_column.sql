-- Alterar coluna de imagem para LONGBLOB
ALTER TABLE estabelecimentos 
MODIFY COLUMN imagem_empresa LONGBLOB NULL COMMENT 'Imagem da empresa em formato binário';
