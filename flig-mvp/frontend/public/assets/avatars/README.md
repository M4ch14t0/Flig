# 👤 Avatares - Flig MVP

Esta pasta contém avatares padrão para usuários da aplicação.

## 📋 Avatares Disponíveis

### Padrão:
- `avatar-placeholder.png` - Avatar padrão (neutro)
- `avatar-male.png` - Avatar masculino
- `avatar-female.png` - Avatar feminino
- `avatar-neutral.png` - Avatar neutro

### Variações:
- `avatar-placeholder-2.png` - Avatar alternativo
- `avatar-placeholder-3.png` - Avatar alternativo
- `avatar-placeholder-4.png` - Avatar alternativo

## 🎨 Especificações

- **Formato**: PNG (com transparência)
- **Tamanho**: 100x100px (quadrado)
- **Estilo**: Simples, profissional
- **Cores**: Neutras, consistentes
- **Fundo**: Transparente

## 📝 Exemplo de Uso

```jsx
// Avatar padrão
<img src="/assets/avatars/avatar-placeholder.png" alt="Avatar" />

// Avatar com fallback
<img 
  src={user.avatar || "/assets/avatars/avatar-placeholder.png"} 
  alt={user.name || "Usuário"} 
/>

// Avatar em CSS
.avatar {
  background-image: url('/assets/avatars/avatar-placeholder.png');
  background-size: cover;
  background-position: center;
}
```

## 🎯 Diretrizes de Design

### Estilo:
- **Simples**: Design limpo e minimalista
- **Neutro**: Não específico de gênero
- **Profissional**: Adequado para ambiente corporativo
- **Consistente**: Seguir o design system

### Cores:
- **Primária**: #007bff (azul Flig)
- **Secundária**: #6c757d (cinza)
- **Neutro**: #f8f9fa (cinza claro)
- **Texto**: #212529 (preto)

## 🔄 Implementação

### Upload de Avatar:
1. Usuário faz upload da foto
2. Sistema redimensiona para 100x100px
3. Salva no servidor
4. Fallback para avatar padrão se erro

### Geração de Avatar:
1. Usar iniciais do nome
2. Gerar cor baseada no nome
3. Criar avatar programaticamente
4. Fallback para avatar padrão
