# 🚂 GUIA DE CONFIGURAÇÃO DAS VARIÁVEIS DO RAILWAY

## ❌ PROBLEMA IDENTIFICADO

O pagamento está falhando porque as **URLs de retorno** estão incorretas. O sistema está usando URLs do localhost em vez das URLs de produção.

## 🔧 SOLUÇÃO

### 1. Acesse o Painel do Railway
- Vá para: https://railway.app
- Faça login na sua conta
- Selecione o projeto `flig-production`

### 2. Configure as Variáveis de Ambiente
Vá em **Settings > Variables** e adicione/configure:

```env
# URLs de Produção
FRONTEND_URL=https://flig.vercel.app
BACKEND_URL=https://flig-production.up.railway.app

# CORS
CORS_ORIGIN=https://flig.vercel.app

# Mercado Pago Webhook Secret
MERCADOPAGO_WEBHOOK_SECRET=seu-secret-aqui

# Outras variáveis importantes
NODE_ENV=production
```

### 3. Variáveis Obrigatórias para Pagamento

```env
# URLs de Retorno (CRÍTICO)
FRONTEND_URL=https://flig.vercel.app
BACKEND_URL=https://flig-production.up.railway.app

# Webhook do Mercado Pago
MERCADOPAGO_WEBHOOK_SECRET=seu-secret-aqui

# CORS para o Frontend
CORS_ORIGIN=https://flig.vercel.app
```

### 4. Reinicie o Serviço
Após configurar as variáveis:
1. Vá em **Deployments**
2. Clique em **Redeploy** ou **Restart**

## 🔍 VERIFICAÇÃO

Após configurar, teste:

1. **Criar uma preferência de pagamento**
2. **Verificar se as URLs de retorno estão corretas**
3. **Testar o fluxo completo de pagamento**

## 📊 STATUS ATUAL

- ✅ Backend funcionando
- ✅ Autenticação funcionando  
- ✅ CORS configurado
- ❌ **FRONTEND_URL não configurada**
- ❌ **BACKEND_URL não configurada**
- ❌ **MERCADOPAGO_WEBHOOK_SECRET não configurada**

## 🎯 RESULTADO ESPERADO

Após configurar as variáveis, as URLs de retorno devem ser:
- Success: `https://flig.vercel.app/cliente/minhas-filas`
- Failure: `https://flig.vercel.app/cliente/minhas-filas`
- Pending: `https://flig.vercel.app/cliente/minhas-filas`

E o webhook deve apontar para:
- `https://flig-production.up.railway.app/api/payments/webhooks/mercadopago`
