import "./DatasetCard.css";

export default function DatasetCard({ dataset, onSelect }) {
  if (!dataset) return null;

  // Compatibilidade inteligente: aceita tanto o array novo (categories) quanto o texto antigo (category)
  const categoriesList =
    Array.isArray(dataset.categories) && dataset.categories.length > 0
      ? dataset.categories
      : [dataset.category || "Geral"];

  return (
    <div className="dataset-card">
      {/* Cabeçalho do Card: Categorias e Data */}
      <div className="card-header">
        <div className="card-tags-container">
          {categoriesList.map((cat, index) => (
            <span key={index} className="card-category-tag">
              {cat}
            </span>
          ))}
        </div>
        {dataset.lastUpdated && (
          <span className="card-date">Atualizado: {dataset.lastUpdated}</span>
        )}
      </div>

      {/* Corpo do Card: Título e Descrição */}
      <div className="card-body">
        <h3 className="card-title">{dataset.title || "Dataset sem título"}</h3>
        <p className="card-description">
          {dataset.description ||
            "Nenhuma descrição disponível para este conjunto de dados."}
        </p>
      </div>

      {/* Rodapé do Card: Formatos e Botão de Ação */}
      <div className="card-footer">
        <div className="card-formats">
          {Array.isArray(dataset.formats) &&
            dataset.formats.map((fmt) => (
              <span key={fmt} className="format-badge">
                {fmt}
              </span>
            ))}
        </div>

        <button onClick={() => onSelect(dataset)} className="btn-explore">
          <span>Explorar dados</span>
          <span className="arrow-icon">→</span>
        </button>
      </div>
    </div>
  );
}
