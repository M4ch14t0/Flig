# 🗄️ **DATABASE FLIG - DOCUMENTAÇÃO COMPLETA**

## 📋 **VISÃO GERAL**

A database do sistema Flig foi projetada para suportar todas as funcionalidades de filas virtuais, incluindo:
- ✅ Gestão de usuários e estabelecimentos
- ✅ Sistema de filas em tempo real
- ✅ Processamento de pagamentos
- ✅ Sistema de notificações
- ✅ Relatórios e analytics
- ✅ Logs e auditoria

## 🏗️ **ESTRUTURA DA DATABASE**

### **Tabelas Principais**

| Tabela | Descrição | Registros Esperados |
|--------|-----------|-------------------|
| `usuarios` | Clientes do sistema | 1.000+ |
| `estabelecimentos` | Empresas cadastradas | 100+ |
| `filas` | Filas virtuais ativas | 50+ |
| `transacoes_pagamentos` | Histórico de pagamentos | 10.000+ |
| `historico_clientes_filas` | Log de clientes nas filas | 50.000+ |

### **Tabelas de Suporte**

| Tabela | Descrição | Registros Esperados |
|--------|-----------|-------------------|
| `notificacoes` | Sistema de notificações | 100.000+ |
| `user_devices` | Dispositivos para push | 5.000+ |
| `relatorios_diarios` | Relatórios de performance | 1.000+ |
| `configuracoes_sistema` | Configurações globais | 10 |
| `logs_sistema` | Logs de auditoria | 1.000.000+ |

## 🚀 **SETUP RÁPIDO**

### **Opção 1: Script Automatizado (Recomendado)**

```bash
cd /home/matoso/Documents/Flig/flig-mvp/backend/database
./setup_database.sh
```

### **Opção 2: Manual**

```bash
# 1. Conectar ao MySQL
mysql -u root -p

# 2. Executar schema
SOURCE schema_corrigido.sql;

# 3. Executar seed
SOURCE seed.sql;

# 4. Verificar
SOURCE verify_database.sql;
```

## 📊 **DIAGRAMA DE RELACIONAMENTOS**

```
usuarios (1) ←→ (N) historico_clientes_filas
estabelecimentos (1) ←→ (N) filas
filas (1) ←→ (N) transacoes_pagamentos
filas (1) ←→ (N) historico_clientes_filas
usuarios (1) ←→ (N) notificacoes
estabelecimentos (1) ←→ (N) notificacoes
usuarios (1) ←→ (N) user_devices
estabelecimentos (1) ←→ (N) user_devices
```

## 🔧 **CONFIGURAÇÕES DO SISTEMA**

A tabela `configuracoes_sistema` contém:

| Chave | Valor Padrão | Descrição |
|-------|--------------|-----------|
| `max_avancos_por_pagamento` | 8 | Máximo de posições por pagamento |
| `valor_base_avancos` | 2.00 | Valor por posição avançada |
| `tempo_estimado_por_posicao` | 5 | Tempo estimado por posição (min) |
| `max_queue_size` | 1000 | Máximo de clientes por fila |
| `enable_payment_simulation` | true | Simulação de pagamentos |

## 📈 **VIEWS PARA RELATÓRIOS**

### **view_estatisticas_estabelecimentos**
```sql
SELECT * FROM view_estatisticas_estabelecimentos;
```
- Total de filas por estabelecimento
- Filas ativas
- Clientes atendidos
- Receita total

### **view_estatisticas_filas**
```sql
SELECT * FROM view_estatisticas_filas;
```
- Estatísticas detalhadas por fila
- Transações e receita
- Média de posições avançadas

## ⚡ **TRIGGERS AUTOMÁTICOS**

### **tr_update_queue_stats_after_transaction**
- Atualiza estatísticas da fila após pagamento aprovado
- Incrementa receita total automaticamente

### **tr_log_system_events**
- Registra logs automáticos de criação de filas
- Facilita auditoria e debugging

## 🔍 **ÍNDICES DE PERFORMANCE**

### **Índices Principais**
```sql
-- Usuários
idx_cpf, idx_email, idx_created_at

-- Estabelecimentos  
idx_cnpj, idx_email, idx_status, idx_categoria

-- Filas
idx_estabelecimento, idx_status, idx_created_at

-- Transações
idx_transaction_id, idx_client_id, idx_queue_id, idx_status

-- Notificações
idx_user_id, idx_user_type, idx_status
```

## 🧪 **DADOS DE TESTE**

O arquivo `seed.sql` inclui:

### **Usuários de Teste (8 clientes)**
- Nomes: João Silva, Maria Oliveira, Pedro Santos, etc.
- Emails: joao.silva@email.com, maria.oliveira@email.com, etc.
- Senhas: Todas com hash bcrypt (senha: 123456)

### **Estabelecimento de Teste**
- Nome: "Estabelecimento Teste Flig"
- Email: teste@flig.com.br
- CNPJ: 12.345.678/0001-90

### **Fila de Teste**
- ID: 550e8400-e29b-41d4-a716-446655440001
- Nome: "Fila de Teste Flig"
- Status: ativa

## 🔒 **SEGURANÇA**

### **Campos Criptografados**
- `senha_usuario` - Hash bcrypt
- `senha_empresa` - Hash bcrypt  
- `payment_data` - JSON criptografado

### **Validações**
- CPF único por usuário
- CNPJ único por estabelecimento
- Email único por usuário/estabelecimento

## 📊 **MONITORAMENTO**

### **Queries de Monitoramento**

```sql
-- Filas mais ativas
SELECT f.nome, COUNT(hcf.id) as total_clientes
FROM filas f
LEFT JOIN historico_clientes_filas hcf ON f.id = hcf.queue_id
WHERE f.status = 'ativa'
GROUP BY f.id
ORDER BY total_clientes DESC;

-- Receita por estabelecimento
SELECT e.nome_empresa, SUM(f.receita_total) as receita
FROM estabelecimentos e
LEFT JOIN filas f ON e.id = f.estabelecimento_id
GROUP BY e.id
ORDER BY receita DESC;

-- Transações por status
SELECT status, COUNT(*) as total
FROM transacoes_pagamentos
GROUP BY status;
```

## 🚨 **RESOLUÇÃO DE PROBLEMAS**

### **Problema: Tabela não existe**
```bash
# Verificar se todas as tabelas existem
mysql -u root -p flig_db -e "SHOW TABLES;"
```

### **Problema: Erro de foreign key**
```bash
# Verificar constraints
mysql -u root -p flig_db -e "SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_NAME IS NOT NULL;"
```

### **Problema: Performance lenta**
```bash
# Verificar índices
mysql -u root -p flig_db -e "SHOW INDEX FROM usuarios;"
```

## 📝 **MANUTENÇÃO**

### **Backup Diário**
```bash
mysqldump -u root -p flig_db > backup_$(date +%Y%m%d).sql
```

### **Limpeza de Logs Antigos**
```sql
DELETE FROM logs_sistema 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### **Otimização de Tabelas**
```sql
OPTIMIZE TABLE usuarios, estabelecimentos, filas, transacoes_pagamentos;
```

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ **Configurar Redis** para cache e filas em tempo real
2. ✅ **Implementar backup automático**
3. ✅ **Configurar monitoramento de performance**
4. ✅ **Implementar particionamento** para tabelas grandes
5. ✅ **Configurar replicação** para alta disponibilidade

---

## 📞 **SUPORTE**

Para dúvidas sobre a database:
- 📧 Email: dev@flig.com.br
- 📚 Documentação: [Wiki do Projeto]
- 🐛 Issues: [GitHub Issues]

**Database Flig - Sistema de Filas Virtuais** 🚀

