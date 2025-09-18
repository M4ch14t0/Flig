-- Script de Verificação da Database Flig
-- Este script verifica se todas as tabelas e estruturas estão corretas
-- 
-- @author Flig Team
-- @version 1.0.0

USE flig_db;

-- 1. VERIFICAR SE TODAS AS TABELAS EXISTEM
SELECT '=== VERIFICAÇÃO DE TABELAS ===' as verificacao;

SELECT 
    table_name as 'Tabela',
    CASE 
        WHEN table_name IN (
            'usuarios', 'estabelecimentos', 'filas', 'transacoes_pagamentos', 
            'historico_clientes_filas', 'notificacoes', 'user_devices', 
            'relatorios_diarios', 'configuracoes_sistema', 'logs_sistema'
        ) THEN '✅ OK'
        ELSE '❌ FALTANDO'
    END as 'Status'
FROM information_schema.tables 
WHERE table_schema = 'flig_db' 
ORDER BY table_name;

-- 2. VERIFICAR ESTRUTURA DAS TABELAS PRINCIPAIS
SELECT '=== ESTRUTURA DA TABELA USUARIOS ===' as verificacao;
DESCRIBE usuarios;

SELECT '=== ESTRUTURA DA TABELA ESTABELECIMENTOS ===' as verificacao;
DESCRIBE estabelecimentos;

SELECT '=== ESTRUTURA DA TABELA FILAS ===' as verificacao;
DESCRIBE filas;

SELECT '=== ESTRUTURA DA TABELA TRANSAÇÕES ===' as verificacao;
DESCRIBE transacoes_pagamentos;

SELECT '=== ESTRUTURA DA TABELA NOTIFICAÇÕES ===' as verificacao;
DESCRIBE notificacoes;

SELECT '=== ESTRUTURA DA TABELA USER_DEVICES ===' as verificacao;
DESCRIBE user_devices;

-- 3. VERIFICAR ÍNDICES
SELECT '=== VERIFICAÇÃO DE ÍNDICES ===' as verificacao;
SELECT 
    table_name as 'Tabela',
    index_name as 'Índice',
    column_name as 'Coluna'
FROM information_schema.statistics 
WHERE table_schema = 'flig_db' 
AND index_name != 'PRIMARY'
ORDER BY table_name, index_name;

-- 4. VERIFICAR FOREIGN KEYS
SELECT '=== VERIFICAÇÃO DE FOREIGN KEYS ===' as verificacao;
SELECT 
    table_name as 'Tabela',
    column_name as 'Coluna',
    referenced_table_name as 'Tabela Referenciada',
    referenced_column_name as 'Coluna Referenciada'
FROM information_schema.key_column_usage 
WHERE table_schema = 'flig_db' 
AND referenced_table_name IS NOT NULL
ORDER BY table_name;

-- 5. VERIFICAR VIEWS
SELECT '=== VERIFICAÇÃO DE VIEWS ===' as verificacao;
SELECT 
    table_name as 'View',
    view_definition as 'Definição'
FROM information_schema.views 
WHERE table_schema = 'flig_db';

-- 6. VERIFICAR TRIGGERS
SELECT '=== VERIFICAÇÃO DE TRIGGERS ===' as verificacao;
SELECT 
    trigger_name as 'Trigger',
    event_manipulation as 'Evento',
    event_object_table as 'Tabela',
    action_timing as 'Timing'
FROM information_schema.triggers 
WHERE trigger_schema = 'flig_db';

-- 7. VERIFICAR CONFIGURAÇÕES DO SISTEMA
SELECT '=== CONFIGURAÇÕES DO SISTEMA ===' as verificacao;
SELECT 
    chave as 'Chave',
    valor as 'Valor',
    descricao as 'Descrição',
    tipo as 'Tipo'
FROM configuracoes_sistema
ORDER BY chave;

-- 8. CONTAR REGISTROS EM CADA TABELA
SELECT '=== CONTAGEM DE REGISTROS ===' as verificacao;
SELECT 'usuarios' as tabela, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'estabelecimentos' as tabela, COUNT(*) as registros FROM estabelecimentos
UNION ALL
SELECT 'filas' as tabela, COUNT(*) as registros FROM filas
UNION ALL
SELECT 'transacoes_pagamentos' as tabela, COUNT(*) as registros FROM transacoes_pagamentos
UNION ALL
SELECT 'historico_clientes_filas' as tabela, COUNT(*) as registros FROM historico_clientes_filas
UNION ALL
SELECT 'notificacoes' as tabela, COUNT(*) as registros FROM notificacoes
UNION ALL
SELECT 'user_devices' as tabela, COUNT(*) as registros FROM user_devices
UNION ALL
SELECT 'relatorios_diarios' as tabela, COUNT(*) as registros FROM relatorios_diarios
UNION ALL
SELECT 'configuracoes_sistema' as tabela, COUNT(*) as registros FROM configuracoes_sistema
UNION ALL
SELECT 'logs_sistema' as tabela, COUNT(*) as registros FROM logs_sistema;

-- 9. VERIFICAÇÃO FINAL DE INTEGRIDADE
SELECT '=== VERIFICAÇÃO FINAL ===' as verificacao;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'flig_db') >= 10 
        THEN '✅ Database está completa'
        ELSE '❌ Database está incompleta'
    END as status_geral;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM configuracoes_sistema) >= 8 
        THEN '✅ Configurações estão completas'
        ELSE '❌ Configurações estão incompletas'
    END as status_configuracoes;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'flig_db') >= 2 
        THEN '✅ Views estão criadas'
        ELSE '❌ Views estão faltando'
    END as status_views;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'flig_db') >= 2 
        THEN '✅ Triggers estão criados'
        ELSE '❌ Triggers estão faltando'
    END as status_triggers;

-- 10. RESUMO EXECUTIVO
SELECT '=== RESUMO EXECUTIVO ===' as resumo;

SELECT 
    'Total de Tabelas' as item,
    COUNT(*) as valor
FROM information_schema.tables 
WHERE table_schema = 'flig_db'

UNION ALL

SELECT 
    'Total de Views' as item,
    COUNT(*) as valor
FROM information_schema.views 
WHERE table_schema = 'flig_db'

UNION ALL

SELECT 
    'Total de Triggers' as item,
    COUNT(*) as valor
FROM information_schema.triggers 
WHERE trigger_schema = 'flig_db'

UNION ALL

SELECT 
    'Total de Configurações' as item,
    COUNT(*) as valor
FROM configuracoes_sistema

UNION ALL

SELECT 
    'Total de Índices' as item,
    COUNT(*) as valor
FROM information_schema.statistics 
WHERE table_schema = 'flig_db' 
AND index_name != 'PRIMARY';

