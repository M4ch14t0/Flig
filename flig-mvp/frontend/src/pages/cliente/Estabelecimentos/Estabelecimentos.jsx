// Estabelecimentos.jsx - Lista de estabelecimentos para clientes
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Home, MapPin, List } from 'lucide-react';
import Layout from '../../../components/Layout';
import { api } from '../../../services/api';
import styles from './Estabelecimentos.module.css';

function Estabelecimentos() {
  const [pesquisa, setPesquisa] = useState('');
  const [filtro, setFiltro] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itemsPorPagina = 8;
  
  // Estados para dados reais
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const sidebarLinks = [
    {
      to: '/cliente/home',
      label: 'Home',
      icon: <Home size={16} />
    },
    {
      to: '/cliente/estabelecimentos',
      label: 'Estabelecimentos',
      icon: <MapPin size={16} />,
      active: true
    },
    {
      to: '/cliente/minhas-filas',
      label: 'Minhas Filas',
      icon: <List size={16} />
    }
  ];

  // Função para buscar estabelecimentos da API
  const fetchEstabelecimentos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Busca estabelecimentos usando a nova API
      const response = await api.get('/estabelecimentos');
      
      if (response.data && Array.isArray(response.data)) {
        const data = response.data;
        
        // Para cada estabelecimento, busca suas filas ativas
        const estabelecimentosComFilas = await Promise.all(
          data.map(async (estabelecimento) => {
            try {
              const filasResponse = await api.get(`/estabelecimentos/${estabelecimento.id}/filas`);
              const filasData = Array.isArray(filasResponse.data) ? filasResponse.data : [];
              
              // Calcula total de pessoas em filas ativas
              const totalPessoas = filasData
                .filter(fila => fila.status === 'ativa')
                .reduce((total, fila) => total + (fila.stats?.totalClients || 0), 0);
              
              return {
                ...estabelecimento,
                filas: filasData.filter(fila => fila.status === 'ativa').length,
                pessoas: totalPessoas,
                nota: 4.5 + Math.random() * 0.5, // Simula nota (em produção viria de avaliações reais)
                avaliacoes: Math.floor(Math.random() * 200) + 50 // Simula avaliações
              };
            } catch (error) {
              console.error(`Erro ao buscar filas do estabelecimento ${estabelecimento.id}:`, error);
              return {
                ...estabelecimento,
                filas: 0,
                pessoas: 0,
                nota: 4.5,
                avaliacoes: 0
              };
            }
          })
        );
        
        setEstabelecimentos(estabelecimentosComFilas);
      } else {
        throw new Error('Erro ao buscar estabelecimentos');
      }
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      setError('Erro ao carregar estabelecimentos. Tente novamente.');
      
      // Fallback para dados mockados em caso de erro
      const estabelecimentosMock = Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        nome_empresa: `Estabelecimento ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
        categoria: ['Restaurante', 'Barbearia', 'Clínica', 'Academia'][i],
        nota: 4.5 + Math.random() * 0.5,
        avaliacoes: Math.floor(Math.random() * 200) + 50,
        filas: Math.floor(Math.random() * 3) + 1,
        pessoas: Math.floor(Math.random() * 50) + 10,
      }));
      setEstabelecimentos(estabelecimentosMock);
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados quando o componente monta
  useEffect(() => {
    fetchEstabelecimentos();
  }, []);

  // Função para aplicar filtros
  const handleFiltro = (tipo) => setFiltro(tipo);

  // Filtra estabelecimentos baseado na pesquisa e filtros
  const filtrados = estabelecimentos.filter((est) => {
    const nomeMatch = est.nome_empresa.toLowerCase().includes(pesquisa.toLowerCase());
    const categoriaMatch = filtro ? est.categoria === filtro : true;
    return nomeMatch && categoriaMatch;
  });

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);

  // Pega apenas os resultados da página atual
  const resultadosPagina = filtrados.slice(
    (paginaAtual - 1) * itemsPorPagina,
    paginaAtual * itemsPorPagina
  );

  // Navega para detalhes do estabelecimento
  const handleClickEstab = (estabelecimento) => {
    navigate(`/cliente/estabelecimentos/${estabelecimento.id}`, { state: { estabelecimento } });
  };

  // Muda de página
  const mudarPagina = (num) => {
    if (num < 1 || num > totalPaginas) return;
    setPaginaAtual(num);
  };

  return (
    <Layout
      sidebarLinks={sidebarLinks}
      userType="cliente"
      showFooter={false}
    >
      <div className={styles.container}>
          <h2 className={styles.pageTitle}>Estabelecimentos</h2>

          {/* Barra de busca e filtros */}
          <div className={styles.searchFilterWrapper}>
            <input
              type="text"
              placeholder="Pesquisar..."
              value={pesquisa}
              onChange={(e) => {
                setPesquisa(e.target.value);
                setPaginaAtual(1);
              }}
              className={styles.search}
            />
            <button
              className={styles.filtersIcon}
              onClick={() => setShowFilters(!showFilters)}
            >
              %
            </button>
            {showFilters && (
              <div className={styles.filtersPopup}>
                <h3>Filtrar</h3>
                <p><strong>Avaliações:</strong></p>
                {[4, 3, 2, 1].map((n) => (
                  <label key={n}>
                    <input
                      type="checkbox"
                      onChange={() => {
                        handleFiltro(filtro === n ? null : n);
                        setPaginaAtual(1);
                      }}
                      checked={filtro === n}
                    />{' '}
                    {'⭐'.repeat(n)} e acima
                  </label>
                ))}
                <p><strong>Categoria:</strong></p>
                <label>
                  <input 
                    type="radio" 
                    name="categoria"
                    onChange={() => {
                      handleFiltro(filtro === 'Restaurante' ? null : 'Restaurante');
                      setPaginaAtual(1);
                    }}
                    checked={filtro === 'Restaurante'}
                  /> Restaurantes
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="categoria"
                    onChange={() => {
                      handleFiltro(filtro === 'Barbearia' ? null : 'Barbearia');
                      setPaginaAtual(1);
                    }}
                    checked={filtro === 'Barbearia'}
                  /> Barbearias
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="categoria"
                    onChange={() => {
                      handleFiltro(filtro === 'Saúde' ? null : 'Saúde');
                      setPaginaAtual(1);
                    }}
                    checked={filtro === 'Saúde'}
                  /> Clínicas/Saúde
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="categoria"
                    onChange={() => {
                      handleFiltro(filtro === 'Academia' ? null : 'Academia');
                      setPaginaAtual(1);
                    }}
                    checked={filtro === 'Academia'}
                  /> Academias
                </label>
              </div>
            )}
          </div>

          {/* Grid de estabelecimentos */}
          <div className={styles.grid}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <Loader2 className={styles.loader} size={32} />
                <p>Carregando estabelecimentos...</p>
              </div>
            ) : error ? (
              <div className={styles.errorContainer}>
                <p>{error}</p>
                <button onClick={fetchEstabelecimentos} className={styles.retryButton}>
                  Tentar Novamente
                </button>
              </div>
            ) : resultadosPagina.length === 0 ? (
              <p>Nenhum estabelecimento encontrado.</p>
            ) : (
              resultadosPagina.map((est) => (
                <div
                  key={est.id}
                  className={styles.card}
                  onClick={() => handleClickEstab(est)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' ? handleClickEstab(est) : null}
                >
                  <div className={styles.cardImage}>
                    <div className={styles.categoryBadge}>{est.categoria}</div>
                  </div>
                  <div className={styles.cardDetails}>
                    <div className={styles.cardLeft}>
                      <h4>{est.nome_empresa}</h4>
                      <small>⭐ {Number(est.nota || 0).toFixed(1)} ({est.avaliacoes} avaliações)</small>
                      <p className={styles.address}>{est.endereco_empresa}</p>
                    </div>
                    <div className={styles.cardRight}>
                      <p>{est.filas} Filas Disponíveis</p>
                      <p>{est.pessoas} Pessoas em Fila</p>
                      <p className={styles.status}>
                        Status: <span className={est.status === 'ativo' ? styles.active : styles.inactive}>
                          {est.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Paginação */}
          <div className={styles.pagination}>
            <button
              disabled={paginaAtual === 1}
              onClick={() => mudarPagina(paginaAtual - 1)}
              className={styles.pageButton}
            >
              ‹
            </button>

            {[...Array(totalPaginas)].map((_, i) => {
              const numero = i + 1;
              if (
                numero === 1 ||
                numero === totalPaginas ||
                (numero >= paginaAtual - 2 && numero <= paginaAtual + 2)
              ) {
                return (
                  <button
                    key={numero}
                    onClick={() => mudarPagina(numero)}
                    className={`${styles.pageButton} ${paginaAtual === numero ? styles.activePage : ''}`}
                  >
                    {numero}
                  </button>
                );
              } else if (
                numero === 2 && paginaAtual > 4 ||
                numero === totalPaginas - 1 && paginaAtual < totalPaginas - 3
              ) {
                return <span key={`ellipsis-${numero}`}>...</span>;
              }
              return null;
            })}

            <button
              disabled={paginaAtual === totalPaginas}
              onClick={() => mudarPagina(paginaAtual + 1)}
              className={styles.pageButton}
            >
              ›
            </button>
          </div>
      </div>
    </Layout>
  );
}

export default Estabelecimentos;
