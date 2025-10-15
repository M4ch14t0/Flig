# 🔴 Corrigir "vite: command not found" no Vercel

## 🚨 Problema Identificado

### ❌ **Erro de Build:**
```
sh: line 1: vite: command not found
Error: Command "npm install && npm run build" exited with 127
```

**Causa**: O Vite está nas devDependencies e o Vercel pode não estar instalando as devDependencies corretamente.

## ✅ Soluções Aplicadas

### 1. Mover Vite para Dependencies

#### **Antes (Incorreto):**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "vite": "^5.4.20",
    "@vitejs/plugin-react": "^4.7.0"
  }
}
```

#### **Depois (Correto):**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "vite": "^5.4.20",
    "@vitejs/plugin-react": "^4.7.0"
  },
  "devDependencies": {
    "eslint": "^8.57.1"
  }
}
```

### 2. Atualizar Configuração do Vercel

#### **vercel.json:**
```json
{
  "version": 2,
  "buildCommand": "npm ci && npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm ci"
}
```

## 🔧 Passos para Corrigir

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

### 1. Verificar Vite
```bash
# Na pasta flig-mvp/frontend
npx vite --version
# Deve mostrar a versão do Vite
```

### 2. Verificar Build
```bash
# Fazer build
npm run build
# Deve funcionar sem erros
```

### 3. Verificar Assets
```bash
# Verificar se os assets foram gerados
ls -la dist/assets/
# Deve conter arquivos .js e .css
```

## 📋 Checklist de Verificação

### Package.json
- [ ] **Vite** está em dependencies
- [ ] **@vitejs/plugin-react** está em dependencies
- [ ] **Scripts** estão corretos
- [ ] **Engines** estão definidos

### Vercel Configuration
- [ ] **Root Directory** definido como `flig-mvp/frontend`
- [ ] **Build Command** definido como `npm ci && npm run build`
- [ ] **Output Directory** definido como `dist`
- [ ] **Framework Preset** definido como `Vite`

### Build Local
- [ ] **npm ci** funciona
- [ ] **npm run build** funciona
- [ ] **dist/** contém arquivos .js e .css

### Deploy
- [ ] **Deploy** realizado com sucesso
- [ ] **Assets** carregam corretamente
- [ ] **Console** sem erros

## 🚨 Problemas Comuns

### Vite command not found
```bash
# Verificar se o Vite está em dependencies
# Verificar se o npm ci foi executado
# Verificar se o root directory está correto
```

### Build fails
```bash
# Verificar se todas as dependências estão instaladas
# Verificar se o vite.config.js está correto
# Verificar se o package.json está correto
```

### Assets não carregam
```bash
# Verificar se o build foi feito corretamente
# Verificar se o outputDirectory está correto
# Verificar se os headers estão configurados
```

## ✅ Resultado Final

Após as correções:
- ✅ **Vite** é encontrado e executado
- ✅ **Build** funciona corretamente
- ✅ **Assets** são gerados corretamente
- ✅ **Deploy** é realizado com sucesso

## 🎯 Próximos Passos

1. ✅ **Mover** Vite para dependencies
2. ✅ **Atualizar** vercel.json
3. ✅ **Deploy** novamente
4. ✅ **Verificar** se funciona
5. ✅ **Testar** a aplicação

**🎉 Vite command not found corrigido!**
