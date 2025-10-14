// Estabelecimentos.jsx - Lista de estabelecimentos para clientes
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Home, MapPin, List, Filter } from 'lucide-react';
import Layout from '../../../components/Layout';
import { api } from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';
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
  const { theme } = useTheme();

  // Debug: verificar se o tema está sendo detectado
  useEffect(() => {
    console.log('Tema atual:', theme);
    console.log('Classes do body:', document.body.className);
    console.log('Classes do html:', document.documentElement.className);
  }, [theme]);

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
      const response = await api.get('/api/estabelecimentos');
      
      if (response.data && Array.isArray(response.data)) {
        const data = response.data;
        
        // Para cada estabelecimento, busca suas filas ativas
        const estabelecimentosComFilas = await Promise.all(
          data.map(async (estabelecimento) => {
            try {
              const filasResponse = await api.get(`/api/estabelecimentos/${estabelecimento.id}/filas`);
              const filasData = Array.isArray(filasResponse.data) ? filasResponse.data : [];
              
              // Calcula total de pessoas em filas ativas
              const totalPessoas = filasData
                .filter(fila => fila.status === 'ativa')
                .reduce((total, fila) => total + (fila.stats?.totalClients || 0), 0);
              
              return {
                ...estabelecimento,
                filas: filasData.filter(fila => fila.status === 'ativa').length,
                pessoas: totalPessoas,
                // Sistema de avaliações será implementado futuramente
              };
            } catch (error) {
              console.error(`Erro ao buscar filas do estabelecimento ${estabelecimento.id}:`, error);
              return {
                ...estabelecimento,
                filas: 0,
                pessoas: 0
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
        // Sistema de avaliações será implementado futuramente
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
    
    // Filtro por categoria
    const categoriaMatch = filtro && ['Restaurante', 'Barbearia', 'Saúde', 'Academia'].includes(filtro) 
      ? est.categoria === filtro 
      : true;
    
    // Filtro por status
    const statusMatch = filtro && ['ativo', 'inativo'].includes(filtro)
      ? est.status === filtro
      : true;
    
    return nomeMatch && categoriaMatch && statusMatch;
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
          <div className={styles.pageHeader}>
            <h2 className={styles.pageTitle}>Estabelecimentos</h2>
            {filtro && (
              <div className={styles.activeFilter}>
                <span>Filtro ativo: {filtro}</span>
                <button 
                  onClick={() => setFiltro(null)}
                  className={styles.removeFilter}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

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
              title="Filtrar estabelecimentos"
            >
              <Filter size={20} />
            </button>
            {showFilters && (
              <div className={styles.filtersPopup}>
                <div className={styles.filtersHeader}>
                  <h3>Filtrar</h3>
                  <button 
                    className={styles.clearFilters}
                    onClick={() => {
                      setFiltro(null);
                      setPaginaAtual(1);
                    }}
                  >
                    Limpar
                  </button>
                </div>
                
                <div className={styles.filterSection}>
                  <p><strong>Categoria:</strong></p>
                  <div className={styles.filterOptions}>
                    <label>
                      <input 
                        type="radio" 
                        name="categoria"
                        onChange={() => {
                          handleFiltro(filtro === 'Restaurante' ? null : 'Restaurante');
                          setPaginaAtual(1);
                        }}
                        checked={filtro === 'Restaurante'}
                      /> 
                      <span>🍽️ Restaurantes</span>
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
                      /> 
                      <span>💇 Barbearias</span>
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
                      /> 
                      <span>🏥 Clínicas/Saúde</span>
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
                      /> 
                      <span>💪 Academias</span>
                    </label>
                  </div>
                </div>

                <div className={styles.filterSection}>
                  <p><strong>Status:</strong></p>
                  <div className={styles.filterOptions}>
                    <label>
                      <input 
                        type="radio" 
                        name="status"
                        onChange={() => {
                          handleFiltro(filtro === 'ativo' ? null : 'ativo');
                          setPaginaAtual(1);
                        }}
                        checked={filtro === 'ativo'}
                      /> 
                      <span>✅ Apenas Ativos</span>
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="status"
                        onChange={() => {
                          handleFiltro(filtro === 'inativo' ? null : 'inativo');
                          setPaginaAtual(1);
                        }}
                        checked={filtro === 'inativo'}
                      /> 
                      <span>❌ Apenas Inativos</span>
                    </label>
                  </div>
                </div>
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
                      <small>Estabelecimento ativo</small>
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
