import "./DatasetDetailModal.css";

export default function DatasetDetailModal({ dataset, onClose }) {
  if (!dataset) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div>
            <span className="modal-category">{dataset.category}</span>
            <h2 className="modal-title">{dataset.title}</h2>
            <p className="modal-source">Fonte: {dataset.source}</p>
          </div>
          <button
            onClick={onClose}
            className="modal-close"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-content">
          <section className="modal-section">
            <h3>Sobre este conjunto de dados</h3>
            <p>{dataset.description}</p>
          </section>

          <section className="modal-section">
            <div className="metadata-card">
              <h3>Metadados Técnicos</h3>
              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="metadata-label">Registros</span>
                  <span className="metadata-value">
                    {dataset.metadata.rows}
                  </span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Colunas/Atributos</span>
                  <span className="metadata-value">
                    {dataset.metadata.columns}
                  </span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Codificação</span>
                  <span className="metadata-value">
                    {dataset.metadata.encoding}
                  </span>
                </div>
                {dataset.metadata.crs && (
                  <div className="metadata-item">
                    <span className="metadata-label">
                      Sistema de Referência (CRS)
                    </span>
                    <span className="metadata-value">
                      {dataset.metadata.crs}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="modal-section">
            <h3>Visualização Preliminar (Amostra dos Dados)</h3>
            <div className="preview-table-wrap">
              <table className="preview-table">
                <thead>
                  <tr>
                    {Object.keys(dataset.preview[0] || {}).map((key) => (
                      <th key={key}>{key.replace("_", " ")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.preview.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((val, i) => (
                        <td key={i}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <span className="preview-caption">
              * Exibindo apenas as primeiras linhas como demonstração.
            </span>
          </section>
        </div>

        <div className="modal-footer">
          <div>
            <span className="metadata-label">Formatos disponíveis:</span>
            <div className="modal-formats">
              {dataset.formats.map((fmt) => (
                <span key={fmt} className="modal-format">
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <a
              href={dataset.downloadUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-download-link"
            >
              <span>⬇ Baixar Conjunto de Dados</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
