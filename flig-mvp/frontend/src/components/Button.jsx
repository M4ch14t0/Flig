import React from 'react';

export default function Button({ children, onClick, type = 'button', style = {}, className = '', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flig-btn ${className}`}
      style={{
        background: '#152E60',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '10px 20px',
        fontWeight: 600,
        fontSize: 16,
        cursor: 'pointer',
        transition: 'background 0.2s',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
} 