-- Seed de dados de teste para Sistema Flig
-- Este arquivo insere dados simplificados para testes
-- 
-- IMPORTANTE: Este seed será usado apenas durante desenvolvimento e testes
-- 
-- @author Flig Team
-- @version 2.0.0

USE fligdb;

-- Limpa dados existentes (cuidado em produção!)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE logs_sistema;
TRUNCATE TABLE relatorios_diarios;
TRUNCATE TABLE historico_clientes_filas;
TRUNCATE TABLE transacoes_pagamento;
TRUNCATE TABLE filas;
TRUNCATE TABLE estabelecimentos;
TRUNCATE TABLE usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- Inserção de usuários de teste (clientes)
INSERT INTO usuarios (nome_usuario, cpf, telefone_usuario, email_usuario, senha_usuario, cep_usuario, endereco_usuario, numero_usuario) VALUES
('João Silva Santos', '12345678901', '(11) 99999-1111', 'joao.silva@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', '01234-567', 'Rua das Flores, 123', '123'),
('Maria Oliveira Costa', '23456789012', '(11) 99999-2222', 'maria.oliveira@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', '02345-678', 'Avenida Paulista, 456', '456'),
('Pedro Santos Lima', '34567890123', '(11) 99999-3333', 'pedro.santos@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', '03456-789', 'Rua Augusta, 789', '789'),
('Ana Paula Ferreira', '45678901234', '(11) 99999-4444', 'ana.ferreira@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', '04567-890', 'Alameda Santos, 321', '321'),
('Carlos Eduardo Souza', '56789012345', '(11) 99999-5555', 'carlos.souza@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', '05678-901', 'Rua Oscar Freire, 654', '654'),
('Fernanda Rodrigues', '67890123456', '(11) 99999-6666', 'fernanda.rodrigues@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', '06789-012', 'Avenida Faria Lima, 987', '987'),
('Roberto Almeida', '78901234567', '(11) 99999-7777', 'roberto.almeida@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', '07890-123', 'Rua Haddock Lobo, 147', '147'),
('Juliana Mendes', '89012345678', '(11) 99999-8888', 'juliana.mendes@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', '08901-234', 'Alameda Campinas, 258', '258');

-- Inserção de estabelecimento de teste
INSERT INTO estabelecimentos (nome_empresa, cnpj, cep_empresa, endereco_empresa, telefone_empresa, email_empresa, senha_empresa, descricao, categoria, horario_funcionamento, capacidade_maxima) VALUES
('Estabelecimento Teste Flig', '12.345.678/0001-90', '01234-567', 'Rua das Flores, 123, Centro, São Paulo - SP', '(11) 3333-1111', 'teste@flig.com.br', '$2a$12$wxvHA3V5bgBkRLNsNxSGF.dRkILLYR5thx36U/G.LZDzZsDnrnwLO', 'Estabelecimento de teste para demonstração do sistema Flig. Aqui você pode testar todas as funcionalidades de filas virtuais.', 'Teste', 'Seg-Dom: 24h', 100);

-- Inserção de fila de teste
INSERT INTO filas (id, nome, estabelecimento_id, descricao, status, max_avancos, valor_avancos, tempo_estimado, total_clientes_atendidos, receita_total) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Fila de Teste Flig', 1, 'Fila de demonstração para testar todas as funcionalidades do sistema. Aqui você pode testar entrada, avanço de posições e pagamentos.', 'ativa', 8, 2.00, 5, 0, 0.00);

-- Dados de teste serão inseridos via API para testar o sistema completo
-- Os usuários serão adicionados à fila através das APIs do sistema

-- Informações para teste:
-- Estabelecimento ID: 1
-- Fila ID: 550e8400-e29b-41d4-a716-446655440001
-- Usuários disponíveis: 8 usuários (IDs 1-8)
-- 
-- Para testar:
-- 1. Acesse a página de estabelecimentos como cliente
-- 2. Entre na fila do "Estabelecimento Teste Flig"
-- 3. Teste o avanço de posições com pagamento
-- 4. Acesse o dashboard do estabelecimento para ver os clientes na fila