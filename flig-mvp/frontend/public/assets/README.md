# 📁 Estrutura de Assets - Flig MVP

Este diretório contém todos os assets estáticos do projeto Flig MVP, organizados por categoria para facilitar a manutenção e localização.

## 🗂️ Estrutura de Pastas

```
public/assets/
├── icons/           # Ícones gerais da aplicação
├── logos/           # Logotipos e marcas
├── team/            # Fotos da equipe
├── payment/         # Ícones de métodos de pagamento
├── illustrations/   # Ilustrações e imagens decorativas
├── avatars/         # Avatares de usuários
└── social/          # Ícones de redes sociais
```

## 📋 Organização por Categoria

### 🎯 **icons/**
Ícones gerais utilizados na aplicação:
- `send.svg` - Ícone de enviar
- `arrow-left.svg` - Seta para esquerda
- `arrow-right.svg` - Seta para direita
- `settings.svg` - Configurações
- `user.svg` - Usuário
- `help.svg` - Ajuda

### 🏷️ **logos/**
Logotipos e marcas:
- `logo-flig.svg` - Logo principal da Flig
- `logo-footer.svg` - Logo para rodapé
- `logo-white.svg` - Logo em versão branca
- `logo-dark.svg` - Logo em versão escura

### 👥 **team/**
Fotos da equipe de desenvolvimento:
- `rafael.jpg` - Rafael Matos (Desenvolvedor, Programador)
- `guilherme.jpg` - Guilherme Correia (Desenvolvedor, Analista de dados)
- `gabriela.jpg` - Gabriela Almeida (Desenvolvedora, Designer)
- `nicolas.jpg` - Nicolas Rocha (Desenvolvedor, Financeiro)

### 💳 **payment/**
Ícones de métodos de pagamento:
- `mastercard.png` - Mastercard
- `visa.png` - Visa
- `elo.png` - Elo
- `amex.png` - American Express
- `hipercard.png` - Hipercard
- `pix.png` - PIX

### 🎨 **illustrations/**
Ilustrações e imagens decorativas:
- `running-illustration.svg` - Ilustração de corrida
- `queue-illustration.svg` - Ilustração de fila
- `success-illustration.svg` - Ilustração de sucesso
- `error-illustration.svg` - Ilustração de erro

### 👤 **avatars/**
Avatares padrão para usuários:
- `avatar-placeholder.png` - Avatar padrão
- `avatar-male.png` - Avatar masculino
- `avatar-female.png` - Avatar feminino
- `avatar-neutral.png` - Avatar neutro

### 📱 **social/**
Ícones de redes sociais:
- `instagram.svg` - Instagram
- `linkedin.svg` - LinkedIn
- `tiktok.svg` - TikTok
- `facebook.svg` - Facebook
- `twitter.svg` - Twitter

## 🔗 Como Usar

### No HTML/JSX:
```jsx
// Logo principal
<img src="/assets/logos/logo-flig.svg" alt="Flig" />

// Ícone de usuário
<img src="/assets/icons/user.svg" alt="Usuário" />

// Foto da equipe
<img src="/assets/team/rafael.jpg" alt="Rafael Matos" />

// Método de pagamento
<img src="/assets/payment/visa.png" alt="Visa" />
```

### No CSS:
```css
.logo {
  background-image: url('/assets/logos/logo-flig.svg');
}

.avatar {
  background-image: url('/assets/avatars/avatar-placeholder.png');
}
```

## 📏 Especificações Técnicas

### Formatos Suportados:
- **SVG**: Para ícones e logos (escaláveis)
- **PNG**: Para imagens com transparência
- **JPG**: Para fotos e imagens complexas
- **WebP**: Para otimização (quando suportado)

### Tamanhos Recomendados:
- **Ícones**: 16x16, 24x24, 32x32px
- **Logos**: 80x80, 120x120, 200x200px
- **Fotos da equipe**: 300x300px
- **Ilustrações**: 400x400px ou maiores

## 🚀 Otimização

### Boas Práticas:
1. **SVG**: Use para ícones e logos simples
2. **PNG**: Use para imagens com transparência
3. **JPG**: Use para fotos e imagens complexas
4. **WebP**: Use para otimização de performance
5. **Lazy Loading**: Implemente para imagens grandes
6. **Alt Text**: Sempre inclua texto alternativo

### Ferramentas Recomendadas:
- **SVG**: Figma, Adobe Illustrator
- **PNG/JPG**: Photoshop, GIMP
- **Otimização**: TinyPNG, ImageOptim
- **Conversão**: Squoosh.app

## 📝 Convenções de Nomenclatura

### Padrão:
- **Minúsculas**: `logo-flig.svg`
- **Hífens**: `arrow-left.svg`
- **Descritivo**: `avatar-placeholder.png`
- **Versão**: `logo-white.svg`, `logo-dark.svg`

### Exemplos:
```
✅ Correto:
- logo-flig.svg
- arrow-left.svg
- avatar-placeholder.png
- mastercard.png

❌ Incorreto:
- LogoFlig.svg
- arrow_left.svg
- Avatar Placeholder.png
- MasterCard.png
```

## 🔄 Atualizações

### Quando adicionar novos assets:
1. Coloque na pasta apropriada
2. Use nomenclatura consistente
3. Otimize o arquivo
4. Atualize este README
5. Teste em diferentes dispositivos

### Quando remover assets:
1. Verifique se não está sendo usado
2. Remova o arquivo
3. Atualize este README
4. Teste a aplicação

---

**Última atualização**: 19/12/2024  
**Versão**: 1.0.0
