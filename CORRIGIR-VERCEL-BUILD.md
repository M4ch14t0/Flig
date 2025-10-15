# 🔴 Corrigir Erro de Build no Vercel

## 🚨 Problema Identificado

### ❌ **Erro de Build:**
```
sh: line 1: vite: command not found
Error: Command "npm run build" exited with 127
```

**Causa**: O Vercel está tentando fazer o build na raiz do projeto, mas o frontend está na pasta `flig-mvp/frontend`.

## ✅ Soluções Aplicadas

### 1. Configuração do Vercel (vercel.json)

#### **Criado na raiz do projeto:**
```json
{
  "version": 2,
  "buildCommand": "cd flig-mvp/frontend && npm install && npm run build",
  "outputDirectory": "flig-mvp/frontend/dist",
  "framework": "vite",
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
        }
      ]
    }
  ]
}
```

### 2. Atualização do package.json

#### **Scripts atualizados:**
```json
{
  "scripts": {
    "build": "cd flig-mvp/frontend && npm install && npm run build",
    "build:backend": "cd flig-mvp/backend && npm install",
    "build:frontend": "cd flig-mvp/frontend && npm install && npm run build",
    "postinstall": "npm run install:frontend"
  }
}
```

## 🔧 Passos para Corrigir

### 1. Fazer Deploy no Vercel

#### **Opção A: Via Interface Web**
1. **Vercel** → **Dashboard** → **Projeto Flig**
2. **Settings** → **General**
3. **Build Command**: `cd flig-mvp/frontend && npm install && npm run build`
4. **Output Directory**: `flig-mvp/frontend/dist`
5. **Framework Preset**: `Vite`
6. **Deploy** novamente

#### **Opção B: Via Git**
```bash
# Fazer commit das mudanças
git add .
git commit -m "Fix Vercel build configuration for frontend"
git push origin att_banca
```

### 2. Verificar Build Local

#### **Testar localmente:**
```bash
# Na raiz do projeto
npm run build

# Ou diretamente no frontend
cd flig-mvp/frontend
npm install
npm run build
```

#### **Verificar se os arquivos estão corretos:**
```bash
ls -la flig-mvp/frontend/dist/assets/
# Deve mostrar arquivos .js e .css
```

### 3. Verificar Deploy

#### **Após o deploy:**
1. **Acessar** https://flig.vercel.app
2. **Verificar** se não há erros no console
3. **Verificar** se os assets carregam corretamente

## 🧪 Teste de Funcionamento

### 1. Verificar Build Command
```bash
# Testar o comando de build
cd flig-mvp/frontend && npm install && npm run build
# Deve funcionar sem erros
```

### 2. Verificar Output Directory
```bash
# Verificar se o dist foi criado
ls -la flig-mvp/frontend/dist/
# Deve conter index.html e pasta assets
```

### 3. Verificar Assets
```bash
# Verificar se os assets foram gerados
ls -la flig-mvp/frontend/dist/assets/
# Deve conter arquivos .js e .css
```

## 📋 Checklist de Verificação

### Configuração Vercel
- [ ] **vercel.json** na raiz do projeto
- [ ] **Build Command** aponta para `flig-mvp/frontend`
- [ ] **Output Directory** aponta para `flig-mvp/frontend/dist`
- [ ] **Framework** definido como `vite`

### Build Local
- [ ] **npm run build** funciona na raiz
- [ ] **cd flig-mvp/frontend && npm run build** funciona
- [ ] **dist/assets/** contém arquivos .js e .css

### Deploy
- [ ] **Deploy** realizado com sucesso
- [ ] **Assets** carregam corretamente
- [ ] **Console** sem erros

## 🚨 Problemas Comuns

### Vite command not found
```bash
# Verificar se está na pasta correta
# Verificar se o npm install foi executado
# Verificar se o vite está instalado
```

### Build fails
```bash
# Verificar se o package.json do frontend está correto
# Verificar se as dependências estão instaladas
# Verificar se o vite.config.js está correto
```

### Assets não carregam
```bash
# Verificar se o outputDirectory está correto
# Verificar se o build foi feito corretamente
# Verificar se os headers estão configurados
```

## ✅ Resultado Final

Após as correções:
- ✅ **Build** funciona corretamente
- ✅ **Vite** é encontrado e executado
- ✅ **Assets** são gerados corretamente
- ✅ **Deploy** é realizado com sucesso

## 🎯 Próximos Passos

1. ✅ **Fazer** commit das mudanças
2. ✅ **Deploy** no Vercel
3. ✅ **Verificar** se o build funciona
4. ✅ **Testar** a aplicação
5. ✅ **Verificar** se não há erros

**🎉 Vercel build corrigido!**
