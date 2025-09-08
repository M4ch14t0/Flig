# 📚 Exemplos de Uso - Assets Flig MVP

Este documento mostra exemplos práticos de como usar a nova estrutura de assets.

## 🎯 Exemplos por Categoria

### 1. **Logos**
```jsx
// Logo principal
<img src="/assets/logos/logo-flig.svg" alt="Flig" className="logo" />

// Logo do rodapé
<img src="/assets/logos/logo-footer.svg" alt="Flig" style={{ width: '80px' }} />

// Logo branco (para fundos escuros)
<img src="/assets/logos/logo-white.svg" alt="Flig" className="logo-white" />

// Logo escuro (para fundos claros)
<img src="/assets/logos/logo-dark.svg" alt="Flig" className="logo-dark" />
```

### 2. **Ícones**
```jsx
// Ícones de navegação
<img src="/assets/icons/arrow-left.svg" alt="Voltar" />
<img src="/assets/icons/arrow-right.svg" alt="Avançar" />
<img src="/assets/icons/settings.svg" alt="Configurações" />

// Ícones de ação
<img src="/assets/icons/send.svg" alt="Enviar" />
<img src="/assets/icons/edit.svg" alt="Editar" />
<img src="/assets/icons/delete.svg" alt="Excluir" />

// Ícones de status
<img src="/assets/icons/check.svg" alt="Sucesso" />
<img src="/assets/icons/error.svg" alt="Erro" />
<img src="/assets/icons/warning.svg" alt="Aviso" />
```

### 3. **Equipe**
```jsx
// Fotos da equipe
<div className="team-member">
  <img src="/assets/team/rafael.jpg" alt="Rafael Matos" />
  <h3>Rafael Matos</h3>
  <p>Desenvolvedor, Programador</p>
</div>

<div className="team-member">
  <img src="/assets/team/guilherme.jpg" alt="Guilherme Correia" />
  <h3>Guilherme Correia</h3>
  <p>Desenvolvedor, Analista de dados</p>
</div>
```

### 4. **Pagamento**
```jsx
// Métodos de pagamento
<div className="payment-methods">
  <img src="/assets/payment/visa.png" alt="Visa" />
  <img src="/assets/payment/mastercard.png" alt="Mastercard" />
  <img src="/assets/payment/elo.png" alt="Elo" />
  <img src="/assets/payment/amex.png" alt="American Express" />
  <img src="/assets/payment/hipercard.png" alt="Hipercard" />
  <img src="/assets/payment/pix.png" alt="PIX" />
</div>
```

### 5. **Ilustrações**
```jsx
// Ilustração principal
<div className="hero-section">
  <img src="/assets/illustrations/running-illustration.svg" alt="Solução para filas" />
  <h1>A solução para filas que você esperava!</h1>
</div>

// Estado vazio
<div className="empty-state">
  <img src="/assets/illustrations/empty-state.svg" alt="Nenhum item encontrado" />
  <p>Nenhum item encontrado</p>
</div>

// Sucesso
<div className="success-state">
  <img src="/assets/illustrations/success-illustration.svg" alt="Sucesso" />
  <p>Operação realizada com sucesso!</p>
</div>
```

### 6. **Avatares**
```jsx
// Avatar padrão
<img src="/assets/avatars/avatar-placeholder.png" alt="Avatar" />

// Avatar com fallback
<img 
  src={user.avatar || "/assets/avatars/avatar-placeholder.png"} 
  alt={user.name || "Usuário"} 
  className="user-avatar"
/>

// Avatar em CSS
.avatar {
  background-image: url('/assets/avatars/avatar-placeholder.png');
  background-size: cover;
  background-position: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
```

### 7. **Redes Sociais**
```jsx
// Links de redes sociais
<div className="social-links">
  <a href="https://instagram.com/flig" target="_blank" rel="noopener noreferrer">
    <img src="/assets/social/instagram.svg" alt="Instagram" />
  </a>
  <a href="https://linkedin.com/company/flig" target="_blank" rel="noopener noreferrer">
    <img src="/assets/social/linkedin.svg" alt="LinkedIn" />
  </a>
  <a href="https://tiktok.com/@flig" target="_blank" rel="noopener noreferrer">
    <img src="/assets/social/tiktok.svg" alt="TikTok" />
  </a>
</div>
```

## 🎨 Exemplos com CSS

### 1. **Background Images**
```css
/* Logo como background */
.logo {
  background-image: url('/assets/logos/logo-flig.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 120px;
  height: 40px;
}

/* Avatar como background */
.avatar {
  background-image: url('/assets/avatars/avatar-placeholder.png');
  background-size: cover;
  background-position: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

/* Ilustração como background */
.hero {
  background-image: url('/assets/illustrations/running-illustration.svg');
  background-size: 400px 400px;
  background-repeat: no-repeat;
  background-position: right center;
}
```

### 2. **Responsive Images**
```css
/* Imagens responsivas */
.responsive-image {
  width: 100%;
  height: auto;
  max-width: 100%;
}

/* Diferentes tamanhos para diferentes telas */
@media (max-width: 768px) {
  .logo {
    width: 80px;
    height: 26px;
  }
}

@media (min-width: 1200px) {
  .logo {
    width: 160px;
    height: 53px;
  }
}
```

## 🔧 Exemplos com JavaScript

### 1. **Carregamento Dinâmico**
```javascript
// Carregar imagem dinamicamente
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Usar
loadImage('/assets/logos/logo-flig.svg')
  .then(img => {
    document.body.appendChild(img);
  })
  .catch(err => {
    console.error('Erro ao carregar imagem:', err);
  });
```

### 2. **Lazy Loading**
```javascript
// Lazy loading simples
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));
```

### 3. **Fallback de Imagens**
```javascript
// Fallback para imagens que não carregam
function handleImageError(img) {
  img.src = '/assets/avatars/avatar-placeholder.png';
  img.alt = 'Imagem não disponível';
}

// Usar
<img 
  src="/assets/team/rafael.jpg" 
  alt="Rafael Matos"
  onError={handleImageError}
/>
```

## 📱 Exemplos Responsivos

### 1. **Picture Element**
```html
<picture>
  <source media="(min-width: 1200px)" srcset="/assets/illustrations/running-illustration-large.svg">
  <source media="(min-width: 768px)" srcset="/assets/illustrations/running-illustration-medium.svg">
  <img src="/assets/illustrations/running-illustration-small.svg" alt="Solução para filas">
</picture>
```

### 2. **Srcset**
```html
<img 
  src="/assets/logos/logo-flig.svg"
  srcset="/assets/logos/logo-flig-80.svg 80w,
          /assets/logos/logo-flig-120.svg 120w,
          /assets/logos/logo-flig-200.svg 200w"
  sizes="(max-width: 768px) 80px,
         (max-width: 1200px) 120px,
         200px"
  alt="Flig"
/>
```

## 🚀 Exemplos de Otimização

### 1. **Preload de Imagens Críticas**
```html
<link rel="preload" as="image" href="/assets/logos/logo-flig.svg">
<link rel="preload" as="image" href="/assets/illustrations/running-illustration.svg">
```

### 2. **WebP com Fallback**
```html
<picture>
  <source srcset="/assets/team/rafael.webp" type="image/webp">
  <img src="/assets/team/rafael.jpg" alt="Rafael Matos">
</picture>
```

### 3. **Lazy Loading com Intersection Observer**
```javascript
const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
}, {
  rootMargin: '50px'
});

lazyImages.forEach(img => imageObserver.observe(img));
```

## 📝 Boas Práticas

1. **Sempre incluir alt text**
2. **Usar formatos apropriados (SVG para ícones, JPG para fotos)**
3. **Otimizar tamanhos de arquivo**
4. **Implementar lazy loading para imagens grandes**
5. **Usar fallbacks para imagens que podem falhar**
6. **Testar em diferentes dispositivos e conexões**
