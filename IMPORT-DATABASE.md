# 🗄️ Importar Database Atual - Flig2.sql

## 📊 Sua Database Atual

O arquivo `Flig2.sql` contém sua database atual com:
- ✅ **3 estabelecimentos** ativos
- ✅ **6 filas** (ativas e encerradas)
- ✅ **16 usuários** cadastrados
- ✅ **153 clientes** no histórico
- ✅ **32 transações** de pagamento
- ✅ **4 planos** disponíveis
- ✅ **10 configurações** do sistema

## 🚂 Importar no Railwaym

### 1. Conectar ao Banco
1. No Railway → **Database** → **MySQL**
2. Clique em **Connect**
3. Use as credenciais fornecidas

### 2. Executar SQL
```sql
-- 1. Usar database existente
USE railway;

-- 2. Executar o arquivo Flig2.sql
-- O arquivo já contém:
-- - Estrutura completa das tabelas
-- - Dados de exemplo
-- - Configurações do sistema
-- - Usuários e estabelecimentos
```

### 3. Importar Arquivo
1. **Copie** todo o conteúdo do arquivo `database/Flig2.sql`
2. **Cole** no terminal MySQL do Railway
3. **Execute** o script completo

### 4. Verificar Importação
```sql
-- Verificar tabelas
SHOW TABLES;

-- Verificar dados
SELECT COUNT(*) FROM estabelecimentos;
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM filas;
SELECT COUNT(*) FROM historico_clientes_filas;
```

## 🔧 Configuração das Variáveis

### Backend (Railway)
```bash
DATABASE_URL=mysql://root:ALDIsAoqBNoMJjtuMsoLpjgFOhZbeGfI@maglev.proxy.rlwy.net:48887/railway
REDIS_URL=redis://user:pass@host:port
JWT_SECRET=sua-chave-secreta-aqui
CORS_ORIGIN=https://seu-frontend.vercel.app
NODE_ENV=production
```

## 📋 Checklist de Importação

### Database
- [ ] Banco MySQL criado no Railway
- [ ] Arquivo `Flig2.sql` executado
- [ ] Todas as tabelas criadas
- [ ] Dados importados com sucesso
- [ ] Conexão testada

### Dados Importados
- [ ] **Estabelecimentos**: 3 registros
- [ ] **Usuários**: 16 registros
- [ ] **Filas**: 6 registros
- [ ] **Histórico**: 153 registros
- [ ] **Transações**: 32 registros
- [ ] **Planos**: 4 registros
- [ ] **Configurações**: 10 registros

## 🧪 Teste de Funcionamento

### 1. Testar Conexão
```bash
# No Railway logs, deve aparecer:
✅ Banco de dados conectado
✅ Redis conectado
✅ Servidor rodando na porta 3000
```

### 2. Testar Endpoints
```bash
# Health check
curl https://seu-backend.railway.app/api/health

# Testar login
curl -X POST https://seu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rafaelmo10@outlook.com.br","password":"sua-senha","userType":"cliente"}'
```

### 3. Verificar Dados
- ✅ Login com usuários existentes
- ✅ Filas carregando corretamente
- ✅ Histórico de clientes funcionando
- ✅ Transações de pagamento visíveis

## 🚨 Problemas Comuns

### Erro de Importação
```sql
-- Verificar se o banco existe
SHOW DATABASES;

-- Verificar se as tabelas foram criadas
SHOW TABLES;
```

### Dados não aparecem
```sql
-- Verificar se os dados foram importados
SELECT COUNT(*) FROM estabelecimentos;
SELECT COUNT(*) FROM usuarios;
```

### Conexão falha
```bash
# Verificar variáveis de ambiente
# Verificar se DATABASE_URL está correta
# Verificar logs do Railway
```

## ✅ Resultado Final

Após a importação, você terá:
- ✅ **Database completa** com todos os dados
- ✅ **Backend funcionando** com dados reais
- ✅ **Usuários existentes** podem fazer login
- ✅ **Filas ativas** funcionando
- ✅ **Histórico preservado** de clientes
- ✅ **Transações** de pagamento mantidas

## 🎯 Próximos Passos

1. ✅ Importar database
2. ✅ Configurar variáveis
3. ✅ Testar conexão
4. ✅ Fazer deploy do frontend
5. ✅ Testar aplicação completa

**🎉 Database importada com sucesso!**
