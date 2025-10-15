# 🔴 Corrigir Vercel com Root Directory

## 🚨 Problema Identificado

### ❌ **Erro de Build:**
```
sh: line 1: cd: flig-mvp/frontend: No such file or directory
Error: Command "cd flig-mvp/frontend && npm install && npm run build" exited with 1
```

**Causa**: O Vercel está configurado com root directory como `flig-mvp/frontend`, mas o comando de build ainda está tentando navegar para essa pasta.

## ✅ Solução Aplicada

### 1. Configuração do Vercel (vercel.json)

#### **Antes (Incorreto):**
```json
{
  "buildCommand": "cd flig-mvp/frontend && npm install && npm run build",
  "outputDirectory": "flig-mvp/frontend/dist"
}
```

#### **Depois (Correto):**
```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist"
}
```

### 2. Configuração no Vercel Dashboard

#### **Settings → General:**
- ✅ **Root Directory**: `flig-mvp/frontend`
- ✅ **Build Command**: `npm install && npm run build`
- ✅ **Output Directory**: `dist`
- ✅ **Framework Preset**: `Vite`

## 🔧 Passos para Corrigir

### 1. Configurar no Vercel Dashboard

#### **Settings → General:**
1. **Root Directory**: `flig-mvp/frontend`
2. **Build Command**: `npm install && npm run build`
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
npm install

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

### 1. Verificar Build Command
```bash
# Na pasta flig-mvp/frontend
npm install && npm run build
# Deve funcionar sem erros
```

### 2. Verificar Output Directory
```bash
# Verificar se o dist foi criado
ls -la dist/
# Deve conter index.html e pasta assets
```

### 3. Verificar Assets
```bash
# Verificar se os assets foram gerados
ls -la dist/assets/
# Deve conter arquivos .js e .css
```

## 📋 Checklist de Verificação

### Configuração Vercel Dashboard
- [ ] **Root Directory** definido como `flig-mvp/frontend`
- [ ] **Build Command** definido como `npm install && npm run build`
- [ ] **Output Directory** definido como `dist`
- [ ] **Framework Preset** definido como `Vite`

### Build Local
- [ ] **cd flig-mvp/frontend** funciona
- [ ] **npm install** funciona
- [ ] **npm run build** funciona
- [ ] **dist/** contém arquivos .js e .css

### Deploy
- [ ] **Deploy** realizado com sucesso
- [ ] **Assets** carregam corretamente
- [ ] **Console** sem erros

## 🚨 Problemas Comuns

### Root directory incorreto
```bash
# Verificar se o root directory está correto
# Deve ser: flig-mvp/frontend
# Não deve ser: flig-mvp ou raiz do projeto
```

### Build command incorreto
```bash
# Com root directory configurado, o comando deve ser:
npm install && npm run build
# Não deve ser: cd flig-mvp/frontend && npm install && npm run build
```

### Output directory incorreto
```bash
# Com root directory configurado, o output deve ser:
dist
# Não deve ser: flig-mvp/frontend/dist
```

## ✅ Resultado Final

Após as correções:
- ✅ **Root Directory** configurado corretamente
- ✅ **Build Command** funciona sem erros
- ✅ **Output Directory** aponta para o local correto
- ✅ **Deploy** é realizado com sucesso

## 🎯 Próximos Passos

1. ✅ **Configurar** root directory no Vercel
2. ✅ **Atualizar** build command
3. ✅ **Deploy** novamente
4. ✅ **Verificar** se funciona
5. ✅ **Testar** a aplicação

**🎉 Vercel root directory corrigido!**
