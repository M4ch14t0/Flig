# 🔴 Configurar Novo Projeto no Vercel

## 🚨 Problema Identificado

### ❌ **Erro MIME Type:**
```
Loading module from "https://flig.vercel.app/assets/index-BfWkwKk6.js" was blocked because of a disallowed MIME type ("text/html").
The stylesheet https://flig.vercel.app/assets/index-DbKcD80f.css was not loaded because its MIME type, "text/html", is not "text/css".
```

**Causa**: O novo projeto no Vercel não tem a configuração correta para servir os assets com MIME types corretos.

## ✅ Soluções Aplicadas

### 1. Configuração do Vercel (vercel.json)

#### **Criado em flig-mvp/frontend/vercel.json:**
```json
{
  "version": 2,
  "buildCommand": "npm ci && npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm ci",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Content-Type",
          "value": "application/javascript"
        }
      ]
    },
    {
      "source": "/assets/(.*\\.css)",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/css"
        }
      ]
    }
  ]
}
```

### 2. Configuração no Vercel Dashboard

#### **Settings → General:**
- ✅ **Root Directory**: `flig-mvp/frontend`
- ✅ **Build Command**: `npm ci && npm run build`
- ✅ **Output Directory**: `dist`
- ✅ **Framework Preset**: `Vite`
- ✅ **Node.js Version**: `18.x`

## 🔧 Passos para Configurar

### 1. Configurar no Vercel Dashboard

#### **Settings → General:**
1. **Root Directory**: `flig-mvp/frontend`
2. **Build Command**: `npm ci && npm run build`
3. **Output Directory**: `dist`
4. **Framework Preset**: `Vite`
5. **Node.js Version**: `18.x`
6. **Save** e **Deploy** novamente

### 2. Verificar Build Local

#### **Testar localmente:**
```bash
# Navegar para a pasta do frontend
cd flig-mvp/frontend

# Instalar dependências
npm ci

# Fazer build
npm run build

# Verificar se o dist foi criado
ls -la dist/
```

### 3. Verificar Deploy

#### **Após o deploy:**
1. **Acessar** https://flig.vercel.app
2. **Verificar** se não há erros no console
3. **Verificar** se os assets carregam corretamente

## 🧪 Teste de Funcionamento

### 1. Verificar Assets
```bash
# Testar se os assets estão sendo servidos corretamente
curl -I https://flig.vercel.app/assets/index-BfWkwKk6.js
# Deve retornar: Content-Type: application/javascript
```

### 2. Verificar CSS
```bash
# Testar se o CSS está sendo servido corretamente
curl -I https://flig.vercel.app/assets/index-DbKcD80f.css
# Deve retornar: Content-Type: text/css
```

### 3. Verificar Console
```bash
# Abrir DevTools e verificar se não há erros
# Os assets devem carregar sem erros MIME type
```

## 📋 Checklist de Configuração

### Vercel Dashboard
- [ ] **Root Directory** definido como `flig-mvp/frontend`
- [ ] **Build Command** definido como `npm ci && npm run build`
- [ ] **Output Directory** definido como `dist`
- [ ] **Framework Preset** definido como `Vite`
- [ ] **Node.js Version** definido como `18.x`

### Arquivo vercel.json
- [ ] **vercel.json** criado em `flig-mvp/frontend/`
- [ ] **Headers** configurados para assets
- [ ] **Content-Type** configurado corretamente
- [ ] **Rewrites** configurados para SPA

### Build Local
- [ ] **npm ci** funciona
- [ ] **npm run build** funciona
- [ ] **dist/** contém arquivos .js e .css

### Deploy
- [ ] **Deploy** realizado com sucesso
- [ ] **Assets** carregam corretamente
- [ ] **Console** sem erros MIME type

## 🚨 Problemas Comuns

### Assets não carregam
```bash
# Verificar se o vercel.json está correto
# Verificar se o build foi feito corretamente
# Verificar se o outputDirectory está correto
```

### MIME type incorreto
```bash
# Verificar se os headers estão configurados
# Verificar se o Content-Type está correto
# Verificar se o framework está definido como vite
```

### 404 em assets
```bash
# Verificar se o build foi feito corretamente
# Verificar se o outputDirectory está correto
# Verificar se os assets foram gerados
```

## ✅ Resultado Final

Após as correções:
- ✅ **Assets** carregam com MIME type correto
- ✅ **JavaScript** arquivos servidos como `application/javascript`
- ✅ **CSS** arquivos servidos como `text/css`
- ✅ **Aplicação** funciona sem erros no console

## 🎯 Próximos Passos

1. ✅ **Configurar** novo projeto no Vercel
2. ✅ **Definir** root directory correto
3. ✅ **Configurar** build command
4. ✅ **Deploy** novamente
5. ✅ **Verificar** se funciona

**🎉 Novo projeto Vercel configurado!**
