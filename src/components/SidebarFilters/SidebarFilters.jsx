import "./SidebarFilters.css";

export default function SidebarFilters({
  selectedCategory,
  setSelectedCategory,
  selectedFormat,
  setSelectedFormat,
  categories,
  formats,
}) {
  return (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <h2 className="filters-title">Filtros</h2>
        {(selectedCategory || selectedFormat) && (
          <button
            onClick={() => {
              setSelectedCategory("");
              setSelectedFormat("");
            }}
            className="filters-reset"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="filters-group">
        <h3>Temas</h3>
        <ul className="filters-list">
          <li>
            <button
              onClick={() => setSelectedCategory("")}
              className={`filter-button ${selectedCategory === "" ? "is-active" : ""}`}
            >
              Todos os temas
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => setSelectedCategory(cat)}
                className={`filter-button ${selectedCategory === cat ? "is-active" : ""}`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="filters-group">
        <h3>Formato de Arquivo</h3>
        <div className="filter-chip-row">
          {formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(selectedFormat === fmt ? "" : fmt)}
              className={`filter-chip ${selectedFormat === fmt ? "is-active" : ""}`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
