import "./Header.css";

export default function Header({ searchTerm, setSearchTerm }) {
  return (
    <header className="header">
      <div className="header__inner">
        <span className="header__eyebrow">
          Observatório de Justiça Climática de São Vicente
        </span>
        <h1 className="header__title">Portal de Dados Abertos</h1>
        <p className="header__description">
          Acesse, explore e baixe dados públicos e científicos sobre
          vulnerabilidade social, riscos ambientais e infraestrutura urbana para
          pesquisa e desenvolvimento.
        </p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar dados por palavra-chave (ex: Inundação, IBGE, Saúde)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="search-clear-button"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
