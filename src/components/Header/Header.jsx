import "./Header.css";
import logo from "../../assets/logos/coop_clima[RGB]_fundo_branco.jpg";

const THEMES = [
  {
    icon: "🌊",
    title: "Vulnerabilidade Climática",
    desc: "Inundação, erosão costeira, deslizamentos e projeções de eventos extremos para o litoral de São Vicente.",
  },
  {
    icon: "⚠️",
    title: "Risco Socioambiental",
    desc: "Áreas de risco geotécnico, populações expostas e assentamentos irregulares sobrepostos a zonas de perigo.",
  },
  {
    icon: "🏘️",
    title: "Território e Infraestrutura",
    desc: "Saneamento, habitação, mobilidade, equipamentos públicos e limites administrativos municipais.",
  },
  {
    icon: "📊",
    title: "Dados Socioeconômicos",
    desc: "Setores censitários IBGE, saúde, educação, renda e índices de vulnerabilidade social por unidade territorial.",
  },
];

export default function Header({ searchTerm, setSearchTerm }) {
  return (
    <header className="portal-header">
      <div className="header-content-wrapper">
        {/* Identidade institucional */}
        <div className="header-branding-row">
          <img
            src={logo}
            alt="Logo Coop Clima São Vicente"
            className="header-logo"
          />
          <div className="header-branding-text">
            <span className="header-subtitle-top">
              Observatório de Justiça Climática de São Vicente
            </span>
            <h1 className="header-title">Portal de Dados Abertos</h1>
          </div>
        </div>

        {/* Texto orientado ao público técnico — responde as 5 perguntas */}
        <div className="header-intro-text">
          <p className="intro-main-paragraph">
            Catálogo de datasets geoespaciais, tabulares e estatísticos sobre o
            território de São Vicente — município costeiro no Litoral Sul de São
            Paulo com alta exposição a inundações, erosão e eventos climáticos
            extremos sobrepostos a zonas de vulnerabilidade social.
          </p>
          <p className="intro-callout">
            Todos os datasets incluem proveniência documentada, DOI registrado
            no CERN&nbsp;Zenodo e licença aberta (CC-BY, CC0 ou ODbL).
            Download direto, sem cadastro, com metadados W3C&nbsp;DWBP:
          </p>
        </div>

        {/* Grid de 4 eixos temáticos — O que estou vendo? */}
        <div className="header-themes-grid" role="list" aria-label="Eixos temáticos do catálogo">
          {THEMES.map((theme) => (
            <div key={theme.title} className="theme-card" role="listitem">
              <span className="theme-icon" aria-hidden="true">{theme.icon}</span>
              <div className="theme-info">
                <p className="theme-title">{theme.title}</p>
                <p className="theme-desc">{theme.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de busca */}
        <div className="header-search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por palavra-chave (ex: Inundação, IBGE, Setor Censitário, Shapefile)..."
              className="search-input"
              aria-label="Buscar datasets"
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
