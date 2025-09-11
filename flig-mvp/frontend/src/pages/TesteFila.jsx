import React, { useState, useEffect } from 'react';
import { Users, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// URL base da API
const API_BASE_URL = 'http://localhost:5000/api';

function TesteFila() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [resultado, setResultado] = useState(null);

  // ID da fila de teste
  const queueId = '550e8400-e29b-41d4-a716-446655440001';

  // Busca usuários do banco
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/usuarios`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }
      
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Adiciona usuários na fila de teste
  const adicionarUsuariosFila = async () => {
    try {
      setAdicionando(true);
      setResultado(null);
      
      const response = await fetch(`${API_BASE_URL}/teste/adicionar-usuarios-fila`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queueId })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar usuários na fila');
      }

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error('Erro ao adicionar usuários:', error);
      alert('Erro ao adicionar usuários na fila');
    } finally {
      setAdicionando(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#2c3e50',
        marginBottom: '30px'
      }}>
        🧪 Teste do Sistema Flig
      </h1>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ color: '#495057', marginBottom: '15px' }}>
          Informações do Teste
        </h2>
        <p><strong>Fila ID:</strong> {queueId}</p>
        <p><strong>Estabelecimento:</strong> Estabelecimento Teste Flig</p>
        <p><strong>Funcionalidades:</strong> Entrada na fila, avanço de posições, pagamentos</p>
      </div>

      <div style={{
        backgroundColor: '#e8f5e8',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #c3e6c3'
      }}>
        <h3 style={{ color: '#155724', marginBottom: '15px' }}>
          Usuários Disponíveis para Teste
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p>Carregando usuários...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {usuarios.map((usuario, index) => (
              <div key={usuario.id} style={{
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #d4edda',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Users size={16} color="#28a745" />
                <div>
                  <strong>{usuario.nome_usuario}</strong>
                  <br />
                  <small style={{ color: '#6c757d' }}>
                    {usuario.telefone_usuario} • {usuario.email_usuario}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={adicionarUsuariosFila}
          disabled={adicionando || loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: adicionando || loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto',
            opacity: adicionando || loading ? 0.6 : 1
          }}
        >
          {adicionando ? (
            <>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Adicionando...
            </>
          ) : (
            <>
              <Play size={20} />
              Adicionar Usuários na Fila de Teste
            </>
          )}
        </button>
      </div>

      {resultado && (
        <div style={{
          backgroundColor: resultado.success ? '#d4edda' : '#f8d7da',
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${resultado.success ? '#c3e6c3' : '#f5c6cb'}`,
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            color: resultado.success ? '#155724' : '#721c24',
            marginBottom: '15px'
          }}>
            {resultado.success ? '✅ Sucesso!' : '❌ Erro!'}
          </h3>
          <p style={{ 
            color: resultado.success ? '#155724' : '#721c24',
            marginBottom: '15px'
          }}>
            {resultado.message}
          </p>
          
          {resultado.resultados && (
            <div>
              <h4 style={{ marginBottom: '10px' }}>Detalhes:</h4>
              {resultado.resultados.map((result, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '5px',
                  padding: '5px',
                  backgroundColor: 'white',
                  borderRadius: '4px'
                }}>
                  {result.sucesso ? (
                    <CheckCircle size={16} color="#28a745" />
                  ) : (
                    <XCircle size={16} color="#dc3545" />
                  )}
                  <span>
                    <strong>{result.usuario}</strong>
                    {result.sucesso ? (
                      <span style={{ color: '#28a745' }}> - Posição {result.posicao}</span>
                    ) : (
                      <span style={{ color: '#dc3545' }}> - {result.erro}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{
        backgroundColor: '#fff3cd',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h3 style={{ color: '#856404', marginBottom: '15px' }}>
          📋 Próximos Passos para Teste
        </h3>
        <ol style={{ color: '#856404', lineHeight: '1.6' }}>
          <li>Clique em "Adicionar Usuários na Fila de Teste" para popular a fila</li>
          <li>Acesse a página de estabelecimentos como cliente</li>
          <li>Entre na fila do "Estabelecimento Teste Flig"</li>
          <li>Teste o avanço de posições com pagamento</li>
          <li>Acesse o dashboard do estabelecimento para ver os clientes na fila</li>
          <li>Teste todas as funcionalidades do sistema</li>
        </ol>
      </div>
    </div>
  );
}

export default TesteFila;


