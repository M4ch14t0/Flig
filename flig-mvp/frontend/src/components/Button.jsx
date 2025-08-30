import React from 'react';

/**
 * Componente Button - Botão Reutilizável
 * 
 * Funcionalidade:
 * - Botão personalizado com estilos padrão da aplicação
 * - Suporta customização via props de estilo
 * - Mantém consistência visual em toda a aplicação
 * - Suporta todas as props padrão de um elemento button HTML
 * 
 * @param {React.ReactNode} children - Conteúdo interno do botão (texto, ícones, etc.)
 * @param {Function} onClick - Função executada quando o botão é clicado
 * @param {string} type - Tipo do botão ('button', 'submit', 'reset') - padrão: 'button'
 * @param {Object} style - Objeto de estilos CSS inline para customização
 * @param {string} className - Classes CSS adicionais para customização
 * @param {...any} props - Todas as outras props HTML padrão de button
 * @returns {JSX.Element} - Elemento button estilizado
 */
export default function Button({ 
  children, // Conteúdo do botão
  onClick, // Função de clique
  type = 'button', // Tipo do botão (padrão: button)
  style = {}, // Estilos customizados (padrão: objeto vazio)
  className = '', // Classes CSS adicionais (padrão: string vazia)
  ...props // Todas as outras props (id, disabled, etc.)
}) {
  return (
    <button
      type={type} // Tipo do botão (button, submit, reset)
      onClick={onClick} // Função executada no clique
      className={`flig-btn ${className}`} // Classe base + classes customizadas
      style={{
        // Estilos padrão do botão Flig
        background: '#152E60', // Cor de fundo azul secundário
        color: '#fff', // Cor do texto branco
        border: 'none', // Remove borda padrão
        borderRadius: 8, // Bordas arredondadas (8px)
        padding: '10px 20px', // Espaçamento interno (vertical horizontal)
        fontWeight: 600, // Peso da fonte semi-bold
        fontSize: 16, // Tamanho da fonte (16px)
        cursor: 'pointer', // Cursor de mão ao passar o mouse
        transition: 'background 0.2s', // Transição suave na cor de fundo
        
        // Estilos customizados sobrescrevem os padrões
        ...style,
      }}
      // Todas as outras props HTML são passadas para o elemento button
      {...props}
    >
      {/* Renderiza o conteúdo interno do botão */}
      {children}
    </button>
  );
}
