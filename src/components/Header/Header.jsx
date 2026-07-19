import "./Header.css";

export default function Header({ searchTerm, setSearchTerm }) {
  return (
    <header className="portal-header">
      <div className="header-content-wrapper">
        {/* 1. Títulos e Contexto Institucional */}
        <div className="header-branding">
          <span className="header-subtitle-top">
            Observatório de Justiça Climática de São Vicente
          </span>
          <h1 className="header-title">Portal de Dados Abertos</h1>
        </div>

        {/* 2. Texto Introdutório Enriquecido */}
        <div className="header-intro-text">
          <p className="intro-main-paragraph">
            O Portal de Dados Abertos atua como uma infraestrutura digital que
            transforma conjuntos de dados complexos sobre o território de São
            Vicente em informação acessível e útil, promovendo os princípios de
            Governo Aberto — transparência, participação cidadã, colaboração e
            apoio à tomada de decisão.
          </p>
          <p className="intro-callout">
            Acesse, explore e baixe dados públicos e científicos sobre
            vulnerabilidade social, riscos ambientais e infraestrutura urbana
            para pesquisa, jornalismo, desenvolvimento de soluções e
            fortalecimento do controle social:
          </p>
        </div>

        {/* 3. Grid Temático (Os 4 Eixos de Dados) */}
        <div className="header-themes-grid">
          <div className="theme-card">
            <span className="theme-icon">📊</span>
            <div className="theme-info">
              <h3 className="theme-title">Bases Territoriais</h3>
              <p className="theme-desc">
                População, renda, densidade e setores censitários (IBGE 2022).
              </p>
            </div>
          </div>

          <div className="theme-card">
            <span className="theme-icon">⚠️</span>
            <div className="theme-info">
              <h3 className="theme-title">Riscos Climáticos</h3>
              <p className="theme-desc">
                Áreas de inundação, deslizamentos, favelas e zonas contaminadas.
              </p>
            </div>
          </div>

          <div className="theme-card">
            <span className="theme-icon">🏥</span>
            <div className="theme-info">
              <h3 className="theme-title">Serviços Públicos</h3>
              <p className="theme-desc">
                Localização e cobertura territorial de escolas e unidades de
                saúde.
              </p>
            </div>
          </div>

          <div className="theme-card">
            <span className="theme-icon">🌱</span>
            <div className="theme-info">
              <h3 className="theme-title">Ciência Cidadã</h3>
              <p className="theme-desc">
                Dados da estação meteorológica e observações escolares do clima.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Barra de Busca (Posicionada no fim, logo abaixo dos textos) */}
        <div className="header-search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar dados por palavra-chave (ex: Inundação, IBGE, Saúde, Escolas)..."
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="search-clear-btn"
                aria-label="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
