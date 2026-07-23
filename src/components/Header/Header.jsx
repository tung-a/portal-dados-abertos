import "./Header.css";
import logo from "../../assets/logos/coop_clima[RGB]_fundo_branco.jpg";

export default function Header({ searchTerm, setSearchTerm }) {
  return (
    <header className="portal-header">
      <div className="header-content-wrapper">
        {/* 1. Títulos e Contexto Institucional */}
        <div className="header-branding">
          <div className="header-branding-row">
            <img
              src={logo}
              alt="Logo Coop Clima São Vicente"
              className="header-logo"
            />
            <div className="header-branding">
              <span className="header-subtitle-top">
                Observatório de Justiça Climática de São Vicente
              </span>
              <h1 className="header-title">Portal de Dados Abertos</h1>
            </div>
          </div>
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

        {/* 4. Barra de Busca (Posicionada no fim, logo abaixo dos textos) */}
        <div className="header-search-container">
          <div className="search-input-wrapper">
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
