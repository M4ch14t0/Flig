# 🔧 Configuração de Variáveis de Ambiente no Vercel

## 🚨 PROBLEMA IDENTIFICADO

O frontend está tentando se conectar com `http://localhost:5000` porque a variável de ambiente `VITE_API_URL` não está configurada no Vercel.

### Código problemático:
```javascript
// Em src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## 🔧 SOLUÇÃO: Configurar Variáveis no Vercel

### Passo 1: Acessar o Dashboard do Vercel
1. Vá para [https://vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto **"flig-frontend"**

### Passo 2: Acessar as Variáveis de Ambiente
1. Clique na aba **"Settings"**
2. Clique em **"Environment Variables"** no menu lateral

### Passo 3: Adicionar a Variável
Adicione a seguinte variável de ambiente:

```
VITE_API_URL=https://flig-production.up.railway.app
```

**Importante:** 
- ✅ **Environment**: Production (ou All)
- ✅ **Value**: `https://flig-production.up.railway.app`

### Passo 4: Redeploy
1. Após adicionar a variável, vá para a aba **"Deployments"**
2. Clique em **"Redeploy"** no último deployment
3. Aguarde o deploy ser concluído

## 🧪 Teste Após Configuração

### 1. Verificar se a variável foi aplicada
Abra o console do navegador na aplicação e execute:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

Deve mostrar: `https://flig-production.up.railway.app`

### 2. Verificar requisições
1. Abra o DevTools (F12)
2. Vá para a aba **Network**
3. Faça login na aplicação
4. Verifique se as requisições vão para `flig-production.up.railway.app`

### 3. Testar pagamento
1. Tente fazer um pagamento
2. Verifique se não há mais erros de conexão
3. Verifique se o botão do Mercado Pago carrega

## 🔍 Como Verificar se Funcionou

### 1. Console do Navegador
- ❌ **Antes**: `API_BASE_URL: http://localhost:5000`
- ✅ **Depois**: `API_BASE_URL: https://flig-production.up.railway.app`

### 2. Network Tab
- ❌ **Antes**: Requisições para `localhost:5000` (falham)
- ✅ **Depois**: Requisições para `flig-production.up.railway.app` (sucesso)

### 3. Funcionalidade
- ✅ Login funcionando
- ✅ Criação de preferência funcionando
- ✅ Botão do Mercado Pago carregando
- ✅ Pagamento funcionando

## 🚨 Problemas Comuns

### 1. Variável não aplicada
- **Sintoma**: Ainda mostra localhost no console
- **Solução**: Verificar se a variável foi salva e o projeto foi redeployado

### 2. URL incorreta
- **Sintoma**: Erro 404 ou conexão recusada
- **Solução**: Verificar se a URL do Railway está correta

### 3. CORS ainda bloqueando
- **Sintoma**: Erro de CORS mesmo com URL correta
- **Solução**: Verificar se o backend está configurado para aceitar o domínio do Vercel

## 📋 Checklist Final

- [ ] VITE_API_URL configurada no Vercel
- [ ] Valor: https://flig-production.up.railway.app
- [ ] Environment: Production (ou All)
- [ ] Projeto redeployado após configuração
- [ ] Console mostra URL correta
- [ ] Network tab mostra requisições para Railway
- [ ] Login funcionando
- [ ] Pagamento funcionando

## 🎯 Resultado Esperado

Após configurar a variável:
- ✅ Frontend se conecta com Railway
- ✅ Login funciona
- ✅ Criação de preferência funciona
- ✅ Pagamento funciona completamente
- ✅ Sem erros de conexão

## 📞 Suporte

Se os problemas persistirem após configurar a variável:
1. Verifique se a URL está correta
2. Confirme se o projeto foi redeployado
3. Verifique os logs do Vercel
4. Teste com o arquivo `test-mercadopago-sdk.html`
