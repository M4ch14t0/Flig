import { useState, useEffect } from 'react';

export function useCep(cep) {
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔍 useCep - CEP recebido:', cep);
    
    if (!cep || cep.length !== 8) {
      console.log('❌ useCep - CEP inválido ou vazio');
      setEndereco('');
      setBairro('');
      setCidade('');
      setUf('');
      setError(null);
      return;
    }

    console.log('🚀 useCep - Iniciando busca do CEP:', cep);
    setLoading(true);
    setError(null);

    // Usar JSONP para contornar CORS
    const script = document.createElement('script');
    const callbackName = `handleCepResponse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    script.src = `https://viacep.com.br/ws/${cep}/json/?callback=${callbackName}`;
    console.log('📡 useCep - Fazendo requisição para:', script.src);
    
    window[callbackName] = (data) => {
      console.log('📥 useCep - Resposta recebida:', data);
      try {
        if (data.erro) {
          console.log('❌ useCep - CEP não encontrado');
          setError('CEP não encontrado');
        } else {
          console.log('✅ useCep - CEP encontrado:', {
            logradouro: data.logradouro,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf
          });
          
          // Definir valores com logs detalhados
          const enderecoValue = data.logradouro || '';
          const bairroValue = data.bairro || '';
          const cidadeValue = data.localidade || '';
          const ufValue = data.uf || '';
          
          console.log('🔧 useCep - Definindo valores:', {
            endereco: enderecoValue,
            bairro: bairroValue,
            cidade: cidadeValue,
            uf: ufValue
          });
          
          setEndereco(enderecoValue);
          setBairro(bairroValue);
          setCidade(cidadeValue);
          setUf(ufValue);
          setError(null);
        }
      } catch (err) {
        console.error('❌ useCep - Erro ao processar resposta:', err);
        setError('Erro ao buscar CEP');
      } finally {
        setLoading(false);
        document.head.removeChild(script);
        delete window[callbackName];
      }
    };
    
    script.onerror = () => {
      console.error('❌ useCep - Erro na requisição');
      setError('Erro ao buscar CEP');
      setLoading(false);
      document.head.removeChild(script);
      delete window[callbackName];
    };
    
    document.head.appendChild(script);
  }, [cep]);

  return { endereco, bairro, cidade, uf, loading, error };
}
