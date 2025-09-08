# 🔄 Migração de Assets - Flig MVP

Este documento mostra como migrar os caminhos de imagens existentes para a nova estrutura organizada.

## 📋 Caminhos Atuais vs Novos

### Antes (Caminhos Antigos):
```jsx
// Logos
<img src="/logo-flig.svg" alt="Flig" />
<img src="/logo-footer.svg" alt="Flig" />

// Equipe
<img src="/equipe/rafael.jpg" alt="Rafael Matos" />
<img src="/equipe/guilherme.jpg" alt="Guilherme Correia" />

// Pagamento
<img src="/img/mastercard.png" alt="Mastercard" />
<img src="/img/visa.png" alt="Visa" />

// Ícones
<img src="/icons/send.svg" alt="Enviar" />

// Redes Sociais
<img src="/social/instagram.svg" alt="Instagram" />

// Ilustrações
<img src="/running-illustration.svg" alt="Corrida" />

// Avatares
<img src="/avatar-placeholder.png" alt="Avatar" />
```

### Depois (Caminhos Novos):
```jsx
// Logos
<img src="/assets/logos/logo-flig.svg" alt="Flig" />
<img src="/assets/logos/logo-footer.svg" alt="Flig" />

// Equipe
<img src="/assets/team/rafael.jpg" alt="Rafael Matos" />
<img src="/assets/team/guilherme.jpg" alt="Guilherme Correia" />

// Pagamento
<img src="/assets/payment/mastercard.png" alt="Mastercard" />
<img src="/assets/payment/visa.png" alt="Visa" />

// Ícones
<img src="/assets/icons/send.svg" alt="Enviar" />

// Redes Sociais
<img src="/assets/social/instagram.svg" alt="Instagram" />

// Ilustrações
<img src="/assets/illustrations/running-illustration.svg" alt="Corrida" />

// Avatares
<img src="/assets/avatars/avatar-placeholder.png" alt="Avatar" />
```

## 🔧 Arquivos que Precisam ser Atualizados

### 1. **Webpage.jsx**
```jsx
// Antes
<img src="/running-illustration.svg" alt="Ícone de corrida" />
<img src="/equipe/rafael.jpg" alt="Rafael Matos" />
<img src="/logo-footer.svg" alt="Logo Flig" />

// Depois
<img src="/assets/illustrations/running-illustration.svg" alt="Ícone de corrida" />
<img src="/assets/team/rafael.jpg" alt="Rafael Matos" />
<img src="/assets/logos/logo-footer.svg" alt="Logo Flig" />
```

### 2. **Layout.jsx**
```jsx
// Antes
<img src="/logo-flig.svg" alt="Flig" />
<img src="/logo-footer.svg" alt="Logo Flig" />

// Depois
<img src="/assets/logos/logo-flig.svg" alt="Flig" />
<img src="/assets/logos/logo-footer.svg" alt="Logo Flig" />
```

### 3. **Páginas de Autenticação**
```jsx
// Antes
<img src="/logo-flig.svg" alt="Logo FLIG" />

// Depois
<img src="/assets/logos/logo-flig.svg" alt="Logo FLIG" />
```

### 4. **PagamentoE.jsx**
```jsx
// Antes
<img src="/img/mastercard.png" alt="mastercard" />
<img src="/img/elo.png" alt="elo" />
<img src="/img/visa.png" alt="visa" />

// Depois
<img src="/assets/payment/mastercard.png" alt="mastercard" />
<img src="/assets/payment/elo.png" alt="elo" />
<img src="/assets/payment/visa.png" alt="visa" />
```

### 5. **ContaE.jsx e ContaU.jsx**
```jsx
// Antes
<img src="/avatar-placeholder.png" alt="Avatar" />

// Depois
<img src="/assets/avatars/avatar-placeholder.png" alt="Avatar" />
```

## 🚀 Passos para Migração

### 1. **Mover Arquivos**
```bash
# Mover logos
mv public/logo-flig.svg public/assets/logos/
mv public/logo-footer.svg public/assets/logos/

# Mover equipe
mv public/equipe/* public/assets/team/

# Mover pagamento
mv public/img/* public/assets/payment/

# Mover ícones
mv public/icons/* public/assets/icons/

# Mover redes sociais
mv public/social/* public/assets/social/

# Mover ilustrações
mv public/running-illustration.svg public/assets/illustrations/

# Mover avatares
mv public/avatar-placeholder.png public/assets/avatars/
```

### 2. **Atualizar Código**
- Substituir todos os caminhos antigos pelos novos
- Testar em desenvolvimento
- Verificar se todas as imagens carregam

### 3. **Testar**
- Verificar todas as páginas
- Testar em diferentes dispositivos
- Verificar performance

## 📝 Script de Migração Automática

```bash
#!/bin/bash
# Script para migração automática de assets

echo "🔄 Iniciando migração de assets..."

# Criar estrutura de pastas
mkdir -p public/assets/{icons,logos,team,payment,illustrations,avatars,social}

# Mover arquivos
echo "📁 Movendo logos..."
mv public/logo-flig.svg public/assets/logos/ 2>/dev/null || echo "Logo principal não encontrado"
mv public/logo-footer.svg public/assets/logos/ 2>/dev/null || echo "Logo footer não encontrado"

echo "👥 Movendo fotos da equipe..."
mv public/equipe/* public/assets/team/ 2>/dev/null || echo "Pasta equipe não encontrada"

echo "💳 Movendo ícones de pagamento..."
mv public/img/* public/assets/payment/ 2>/dev/null || echo "Pasta img não encontrada"

echo "🎯 Movendo ícones..."
mv public/icons/* public/assets/icons/ 2>/dev/null || echo "Pasta icons não encontrada"

echo "📱 Movendo redes sociais..."
mv public/social/* public/assets/social/ 2>/dev/null || echo "Pasta social não encontrada"

echo "🎨 Movendo ilustrações..."
mv public/running-illustration.svg public/assets/illustrations/ 2>/dev/null || echo "Ilustração não encontrada"

echo "👤 Movendo avatares..."
mv public/avatar-placeholder.png public/assets/avatars/ 2>/dev/null || echo "Avatar não encontrado"

echo "✅ Migração concluída!"
echo "📝 Lembre-se de atualizar os caminhos no código"
```

## ⚠️ Importante

1. **Backup**: Faça backup antes de mover arquivos
2. **Teste**: Teste cada mudança
3. **Verificação**: Verifique se todos os caminhos foram atualizados
4. **Performance**: Monitore a performance após a migração

## 🎯 Benefícios da Nova Estrutura

- ✅ **Organização**: Assets organizados por categoria
- ✅ **Manutenção**: Fácil de encontrar e gerenciar
- ✅ **Escalabilidade**: Estrutura preparada para crescimento
- ✅ **Performance**: Otimização de carregamento
- ✅ **Documentação**: READMEs explicativos em cada pasta
