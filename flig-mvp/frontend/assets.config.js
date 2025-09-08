/**
 * Configuração de Assets - Flig MVP
 * 
 * Este arquivo contém configurações para otimização e organização de assets
 */

export const ASSETS_CONFIG = {
  // Caminhos base para assets
  paths: {
    icons: '/assets/icons',
    logos: '/assets/logos',
    team: '/assets/team',
    payment: '/assets/payment',
    illustrations: '/assets/illustrations',
    avatars: '/assets/avatars',
    social: '/assets/social',
  },

  // Tamanhos padrão para diferentes tipos de imagem
  sizes: {
    icons: {
      small: 16,
      medium: 24,
      large: 32,
    },
    logos: {
      small: 80,
      medium: 120,
      large: 200,
    },
    team: {
      standard: 300,
    },
    payment: {
      standard: 60,
    },
    illustrations: {
      small: 200,
      medium: 400,
      large: 600,
    },
    avatars: {
      standard: 100,
    },
    social: {
      standard: 24,
    },
  },

  // Formatos suportados
  formats: {
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    webp: 'image/webp',
  },

  // Configurações de otimização
  optimization: {
    quality: 85,
    progressive: true,
    interlaced: true,
  },

  // Lazy loading
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px',
  },
};

/**
 * Função para gerar URL de asset
 * @param {string} category - Categoria do asset (icons, logos, etc.)
 * @param {string} filename - Nome do arquivo
 * @param {string} size - Tamanho (opcional)
 * @returns {string} URL completa do asset
 */
export function getAssetUrl(category, filename, size = null) {
  const basePath = ASSETS_CONFIG.paths[category];
  if (!basePath) {
    console.warn(`Categoria de asset não encontrada: ${category}`);
    return '';
  }

  if (size && ASSETS_CONFIG.sizes[category]?.[size]) {
    const sizeValue = ASSETS_CONFIG.sizes[category][size];
    const [name, ext] = filename.split('.');
    return `${basePath}/${name}-${sizeValue}.${ext}`;
  }

  return `${basePath}/${filename}`;
}

/**
 * Função para verificar se um asset existe
 * @param {string} url - URL do asset
 * @returns {Promise<boolean>} True se o asset existe
 */
export async function assetExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Função para carregar asset com fallback
 * @param {string} primaryUrl - URL principal
 * @param {string} fallbackUrl - URL de fallback
 * @returns {Promise<string>} URL do asset carregado
 */
export async function loadAssetWithFallback(primaryUrl, fallbackUrl) {
  const exists = await assetExists(primaryUrl);
  return exists ? primaryUrl : fallbackUrl;
}

// Exemplos de uso:
// const logoUrl = getAssetUrl('logos', 'logo-flig.svg');
// const iconUrl = getAssetUrl('icons', 'settings.svg', 'medium');
// const teamPhoto = getAssetUrl('team', 'rafael.jpg');
