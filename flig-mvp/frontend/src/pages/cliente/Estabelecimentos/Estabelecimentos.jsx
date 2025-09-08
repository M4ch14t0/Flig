// Estabelecimentos.jsx - Lista de estabelecimentos para clientes
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, User, Settings, LogOut } from 'lucide-react';
import styles from './Estabelecimentos.module.css';

// Dados mockados para demonstração
const estabelecimentosMock = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  nome: `Estabelecimento ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
  nota: 4.8,
  avaliacoes: 209,
  filas: 3,
  pessoas: 72,
}));

function Estabelecimentos() {
  const [pesquisa, setPesquisa] = useState('');
  const [filtro, setFiltro] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itemsPorPagina = 8;

  const navigate = useNavigate();

  // Função para aplicar filtros
  const handleFiltro = (tipo) => setFiltro(tipo);

  // Filtra estabelecimentos baseado na pesquisa e filtros
  const filtrados = estabelecimentosMock.filter((est) => {
    const nomeMatch = est.nome.toLowerCase().includes(pesquisa.toLowerCase());
    const filtroMatch = filtro ? est.nota >= filtro : true;
    return nomeMatch && filtroMatch;
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
    <div className={styles.wrapper}>
      {/* Header - Topo da página */}
      <header className={styles.header}>
        <div className={styles.logo}>Flig</div>
        <div className={styles.headerRight}>
          <Link to="/faq" className={styles.helpIcon}><HelpCircle size={20} /></Link>
          <div className={styles.userIconWrapper}>
            <button className={styles.userIcon}><User size={20} /></button>
            <div className={styles.userPopup}>
              <p><User size={16} /> <u>Perfil</u></p>
              <p><Settings size={16} /> <u>Configurações</u></p>
              <p><LogOut size={16} /> <u>Sair</u></p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className={styles.content}>
        {/* Sidebar - Menu lateral */}
        <aside className={styles.sidebar}>
          <nav className={styles.menu}>
            <Link to="/cliente/home" className={styles.homeActive}>🏠 Home</Link>
            <Link to="/cliente/estabelecimentos" className={styles.estabActive}>📍 Estabelecimentos</Link>
            <Link to="/cliente/minhas-filas" className={styles.filasActive}>👥 Minhas Filas</Link>
          </nav>
        </aside>

        {/* Área principal */}
        <main className={styles.main}>
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
                <p><strong>Estabelecimento:</strong></p>
                <label><input type="checkbox" /> Clínicas</label>
                <label><input type="checkbox" /> Casa de Shows</label>
                <label><input type="checkbox" /> Restaurantes</label>
              </div>
            )}
          </div>

          {/* Grid de estabelecimentos */}
          <div className={styles.grid}>
            {resultadosPagina.length === 0 ? (
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
                  <div className={styles.cardImage}></div>
                  <div className={styles.cardDetails}>
                    <div className={styles.cardLeft}>
                      <h4>{est.nome}</h4>
                      <small>⭐ {est.nota} ({est.avaliacoes} avaliações)</small>
                    </div>
                    <div className={styles.cardRight}>
                      <p>{est.filas} Filas Disponíveis</p>
                      <p>{est.pessoas} Pessoas em Fila</p>
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
        </main>
      </div>
    </div>
  );
}

export default Estabelecimentos;
