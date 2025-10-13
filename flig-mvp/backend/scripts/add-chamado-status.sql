-- Adicionar status 'chamado' ao enum da tabela historico_clientes_filas
ALTER TABLE historico_clientes_filas 
MODIFY COLUMN status ENUM('aguardando', 'chamado', 'atendido', 'cancelado', 'abandonou') DEFAULT 'aguardando';

