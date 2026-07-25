import "./DatasetCard.css";

const LICENSE_SHORT = {
  "cc-by-4.0": "CC BY 4.0",
  "cc-zero": "CC0 1.0",
  "odbl-1.0": "ODbL 1.0",
};

export default function DatasetCard({ dataset, onSelect }) {
  if (!dataset) return null;

  // Compatibilidade inteligente: aceita tanto o array novo (categories) quanto o texto antigo (category)
  const categoriesList =
    Array.isArray(dataset.categories) && dataset.categories.length > 0
      ? dataset.categories
      : [dataset.category || "Geral"];

  const licenseLabel = dataset.metadata?.licenca
    ? LICENSE_SHORT[dataset.metadata.licenca] || dataset.metadata.licenca
    : null;

  return (
    <div className="dataset-card">
      {/* Cabeçalho do Card: Categorias, Licença e Data */}
      <div className="card-header">
        <div className="card-tags-container">
          {categoriesList.map((cat, index) => (
            <span key={index} className="card-category-tag">
              {cat}
            </span>
          ))}
        </div>
        <div className="card-meta-right">
          {licenseLabel && (
            <span className="card-license-badge" title="Licença de reutilização">
              {licenseLabel}
            </span>
          )}
          {dataset.lastUpdated && (
            <span className="card-date">Atualizado: {dataset.lastUpdated}</span>
          )}
        </div>
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
