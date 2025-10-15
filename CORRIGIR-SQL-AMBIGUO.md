# 🔴 Corrigir Erro SQL Ambíguo - Column 'status' ambiguous

## 🚨 Problema Identificado

### ❌ **Erro SQL:**
```
Error: Column 'status' in field list is ambiguous
```

**Causa**: A query está fazendo JOIN entre `historico_clientes_filas` e `filas`, e ambas as tabelas têm uma coluna `status`, causando ambiguidade.

## ✅ Solução Aplicada

### 1. Query Corrigida

#### **Antes (Incorreto):**
```sql
SELECT COUNT(*) as total_records, 
       COUNT(CASE WHEN status IN ('atendido', 'chamado') THEN 1 END) as atendidos,
       COUNT(CASE WHEN status = 'abandonou' THEN 1 END) as abandonos,
       COUNT(CASE WHEN status = 'chamado' THEN 1 END) as chamados,
       COUNT(CASE WHEN status = 'atendido' THEN 1 END) as finalizados
FROM historico_clientes_filas hcf
JOIN filas f ON hcf.queue_id = f.id
WHERE f.estabelecimento_id = ?
```

#### **Depois (Correto):**
```sql
SELECT COUNT(*) as total_records, 
       COUNT(CASE WHEN hcf.status IN ('atendido', 'chamado') THEN 1 END) as atendidos,
       COUNT(CASE WHEN hcf.status = 'abandonou' THEN 1 END) as abandonos,
       COUNT(CASE WHEN hcf.status = 'chamado' THEN 1 END) as chamados,
       COUNT(CASE WHEN hcf.status = 'atendido' THEN 1 END) as finalizados
FROM historico_clientes_filas hcf
JOIN filas f ON hcf.queue_id = f.id
WHERE f.estabelecimento_id = ?
```

### 2. Especificação de Tabela

#### **Mudanças:**
- ✅ **hcf.status** em vez de **status**
- ✅ **Especificação** clara da tabela
- ✅ **Eliminação** da ambiguidade

## 🔧 Arquivo Corrigido

### **flig-mvp/backend/models/Establishment.js**

#### **Linha 436-439:**
```javascript
COUNT(CASE WHEN hcf.status IN ('atendido', 'chamado') THEN 1 END) as atendidos,
COUNT(CASE WHEN hcf.status = 'abandonou' THEN 1 END) as abandonos,
COUNT(CASE WHEN hcf.status = 'chamado' THEN 1 END) as chamados,
COUNT(CASE WHEN hcf.status = 'atendido' THEN 1 END) as finalizados
```

## 🧪 Teste de Funcionamento

### 1. Verificar Logs
```bash
# Deve aparecer:
✅ Dados do histórico encontrados: { total_records: X, atendidos: Y, ... }
```

### 2. Verificar Dashboard
```bash
# Dashboard deve carregar sem erros
# Estatísticas devem aparecer corretamente
```

### 3. Verificar API
```bash
# GET /api/establishments/stats deve funcionar
# Sem erros de SQL ambiguous
```

## 📋 Checklist de Verificação

### SQL Query
- [ ] **hcf.status** especificado em todas as referências
- [ ] **f.status** especificado quando necessário
- [ ] **JOIN** funcionando corretamente
- [ ] **WHERE** clause funcionando

### Backend
- [ ] **Erro SQL** não aparece mais
- [ ] **Estatísticas** carregam corretamente
- [ ] **Dashboard** funciona sem erros
- [ ] **Logs** mostram dados corretos

### Frontend
- [ ] **Dashboard** carrega sem erros
- [ ] **Gráficos** funcionam
- [ ] **Estatísticas** aparecem
- [ ] **Console** sem erros

## 🚨 Problemas Comuns

### SQL ambiguous
```sql
# Sempre especificar a tabela:
hcf.status  # ✅ Correto
status       # ❌ Ambíguo
```

### JOIN com múltiplas tabelas
```sql
# Especificar tabela para todas as colunas:
f.status     # Para tabela filas
hcf.status   # Para tabela historico_clientes_filas
```

### Referências de colunas
```sql
# Usar alias da tabela:
hcf.client_id
f.estabelecimento_id
```

## ✅ Resultado Final

Após as correções:
- ✅ **SQL** funciona sem erros
- ✅ **Estatísticas** carregam corretamente
- ✅ **Dashboard** funciona perfeitamente
- ✅ **Ambiguidade** eliminada

## 🎯 Próximos Passos

1. ✅ **Deploy** da correção
2. ✅ **Testar** dashboard
3. ✅ **Verificar** estatísticas
4. ✅ **Confirmar** funcionamento

**🎉 SQL ambiguous corrigido!**
