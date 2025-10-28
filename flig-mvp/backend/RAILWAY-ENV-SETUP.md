# 🔧 Configuração de Variáveis de Ambiente no Railway

## 🚨 PROBLEMA IDENTIFICADO

O erro de pagamento persiste porque o backend está usando URLs de localhost como fallback quando as variáveis de ambiente não estão configuradas no Railway.

### Código problemático:
```javascript
// Em mercadopago.js
back_urls: {
  success: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/cliente/minhas-filas`,
  failure: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/cliente/minhas-filas`,
  pending: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/cliente/minhas-filas`
},
notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhooks/mercadopago`
```

## 🔧 SOLUÇÃO: Configurar Variáveis no Railway

### Passo 1: Acessar o Dashboard do Railway
1. Vá para [https://railway.app](https://railway.app)
2. Faça login na sua conta
3. Selecione o projeto **"flig-production"**

### Passo 2: Acessar as Variáveis
1. Clique na aba **"Variables"** no menu lateral
2. Ou clique no serviço do backend e depois em **"Variables"**

### Passo 3: Adicionar as Variáveis
Adicione as seguintes variáveis de ambiente:

```
FRONTEND_URL=https://flig-frontend.vercel.app
BACKEND_URL=https://flig-production.up.railway.app
```

### Passo 4: Verificar Outras Variáveis Importantes
Certifique-se de que também estão configuradas:

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-7b82f4ea-52b3-4ce2-b132-c0898d967004
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui
CORS_ORIGIN=https://flig-frontend.vercel.app
```

### Passo 5: Reiniciar o Serviço
1. Após adicionar as variáveis, clique em **"Deploy"** ou **"Redeploy"**
2. Aguarde o deploy ser concluído

## 🧪 Teste Após Configuração

### 1. Verificar se as variáveis foram aplicadas
```bash
cd flig-mvp/backend
node check-railway-env.js
```

### 2. Testar criação de preferência
```bash
cd flig-mvp/backend
node test-env-variables.js
```

### 3. Verificar URLs de retorno
As URLs de retorno devem mostrar:
- ✅ `https://flig-frontend.vercel.app/cliente/minhas-filas` (não localhost)
- ✅ `https://flig-production.up.railway.app/api/payments/webhooks/mercadopago` (não localhost)

## 🔍 Como Verificar se Funcionou

### 1. Console do Navegador
- ❌ **Antes**: Erros de redirecionamento para localhost
- ✅ **Depois**: Redirecionamento correto para Vercel

### 2. Fluxo de Pagamento
1. Usuário clica em pagar
2. É redirecionado para Mercado Pago
3. Faz o pagamento
4. **É redirecionado de volta para Vercel** (não localhost)

### 3. Webhook
- O webhook deve receber notificações corretamente
- URLs de notificação devem apontar para Railway (não localhost)

## 🚨 Problemas Comuns

### 1. Variáveis não aplicadas
- **Sintoma**: URLs ainda contêm localhost
- **Solução**: Verificar se as variáveis foram salvas e o serviço foi reiniciado

### 2. URLs incorretas
- **Sintoma**: Redirecionamento para domínio errado
- **Solução**: Verificar se as URLs estão corretas (com https://)

### 3. Webhook não funciona
- **Sintoma**: Pagamento aprovado mas não processado
- **Solução**: Verificar se BACKEND_URL está correto

## 📋 Checklist Final

- [ ] FRONTEND_URL configurada no Railway
- [ ] BACKEND_URL configurada no Railway
- [ ] Serviço reiniciado após configuração
- [ ] Teste de criação de preferência executado
- [ ] URLs de retorno verificadas (sem localhost)
- [ ] Teste de pagamento completo realizado
- [ ] Redirecionamento funcionando corretamente

## 🎯 Resultado Esperado

Após configurar as variáveis:
- ✅ URLs de retorno apontam para Vercel
- ✅ Webhook aponta para Railway
- ✅ Pagamento funciona completamente
- ✅ Usuário é redirecionado corretamente após pagamento
- ✅ Sem erros de localhost no console

## 📞 Suporte

Se os problemas persistirem após configurar as variáveis:
1. Verifique se as URLs estão corretas
2. Confirme se o serviço foi reiniciado
3. Execute os scripts de teste
4. Verifique os logs do Railway
