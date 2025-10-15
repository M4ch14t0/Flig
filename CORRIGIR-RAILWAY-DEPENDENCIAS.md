# 🔧 Corrigir Dependências no Railway

## ❌ Problema
```
Error: Cannot find module 'express'
```

## 🎯 Solução

### 1. Verificar Configuração do Railway

No painel do Railway, vá para **Settings** do seu projeto backend:

1. **Root Directory**: Deve estar como `flig-mvp/backend`
2. **Build Command**: Deve estar como `npm install`
3. **Start Command**: Deve estar como `npm start`

### 2. Forçar Reinstalação das Dependências

No Railway, vá para **Deployments** e clique em **Redeploy** para forçar uma nova instalação.

### 3. Verificar Variáveis de Ambiente

Certifique-se de que estas variáveis estão configuradas:

```bash
NODE_ENV=production
```

### 4. Alternativa: Usar Script de Setup

Se o problema persistir, adicione um script de setup no `package.json`:

```json
{
  "scripts": {
    "postinstall": "npm install --production",
    "setup": "npm install && npm audit fix"
  }
}
```

### 5. Verificar Logs de Build

No Railway, vá para **Deployments** → **View Logs** e verifique se:

1. `npm install` está sendo executado
2. Todas as dependências estão sendo instaladas
3. Não há erros de permissão

### 6. Solução Alternativa: Railway.json

Crie um arquivo `railway.json` na pasta `flig-mvp/backend/`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install --production"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 7. Verificar Estrutura de Arquivos

Certifique-se de que o Railway está acessando a pasta correta:

```
flig-mvp/
├── backend/
│   ├── package.json ✅
│   ├── server.js ✅
│   ├── app.js ✅
│   └── node_modules/ ✅ (deve ser criado)
```

### 8. Comando de Debug

Se ainda não funcionar, adicione este script no `package.json`:

```json
{
  "scripts": {
    "debug": "node -e \"console.log('Node version:', process.version); console.log('Dependencies:', Object.keys(require('./package.json').dependencies))\""
  }
}
```

## 🚀 Próximos Passos

1. **Redeploy** no Railway
2. **Verificar logs** de build
3. **Testar** se o backend está funcionando
4. **Verificar** se todas as rotas estão acessíveis

## 📋 Checklist

- [ ] Root Directory: `flig-mvp/backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] NODE_ENV: `production`
- [ ] Dependências instaladas
- [ ] Backend funcionando
- [ ] Rotas acessíveis

## 🔍 Debug

Para verificar se as dependências estão instaladas:

```bash
# No Railway, vá para Deployments → View Logs
# Procure por:
# - "npm install" executando
# - "node_modules" sendo criado
# - "express" sendo instalado
```

Se o problema persistir, pode ser necessário:
1. **Deletar** o projeto no Railway
2. **Recriar** com as configurações corretas
3. **Importar** o código novamente
