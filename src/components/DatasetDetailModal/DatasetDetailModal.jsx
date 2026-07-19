import { createPortal } from "react-dom";
import "./DatasetDetailModal.css";

export default function DatasetDetailModal({ dataset, onClose }) {
  if (!dataset) return null;

  const meta = dataset.metadata || {};

  const isZenodoMeta =
    meta.tamanho !== undefined ||
    meta.doi !== undefined ||
    meta.integridade !== undefined;

  // Normaliza os arquivos para aceitar múltiplos downloads ou fallback para arquivo único
  const filesList =
    Array.isArray(dataset.files) && dataset.files.length > 0
      ? dataset.files
      : [
          {
            name: dataset.fileName || "arquivo.zip",
            size: meta.tamanho || "N/A",
            downloadUrl: dataset.downloadUrl || "#",
            checksum: meta.integridade || "N/A",
          },
        ];

  // Normaliza as categorias para permitir múltiplas etiquetas no cabeçalho
  const categoriesList = Array.isArray(dataset.categories)
    ? dataset.categories
    : [dataset.category || "Geral"];

  // Validação segura da tabela de amostra
  const hasValidPreview =
    Array.isArray(dataset.preview) &&
    dataset.preview.length > 0 &&
    typeof dataset.preview[0] === "object" &&
    dataset.preview[0] !== null;

  // Baixa todos os arquivos em sequência com um intervalo seguro de 400ms
  const handleDownloadAll = () => {
    filesList.forEach((file, index) => {
      setTimeout(() => {
        window.open(file.downloadUrl, "_blank");
      }, index * 400);
    });
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-dialog">
        {/* Cabeçalho com Múltiplas Categorias */}
        <div className="modal-header">
          <div>
            <div className="modal-tags-container">
              {categoriesList.map((cat, index) => (
                <span key={index} className="modal-category-tag">
                  {cat}
                </span>
              ))}
            </div>
            <h2 className="modal-title">{dataset.title || "Sem título"}</h2>
            <p className="modal-source-text">
              Fonte: {dataset.source || "Não informada"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="modal-body">
          <div className="modal-section">
            <h3 className="section-title">Sobre este conjunto de dados</h3>
            <p className="section-description">
              {dataset.description ||
                "Nenhuma descrição detalhada fornecida para este conjunto de dados."}
            </p>
          </div>

          {/* Lista de Múltiplos Arquivos para Download Individual */}
          <div className="modal-section">
            <div className="section-header-row">
              <h3 className="section-title">
                Arquivos Disponíveis ({filesList.length})
              </h3>
              <span className="section-subtitle">
                Clique em um arquivo para baixar individualmente
              </span>
            </div>

            <div className="files-list-container">
              {filesList.map((file, idx) => (
                <div key={idx} className="file-item-row">
                  <div className="file-info-col">
                    <span className="file-icon">📄</span>
                    <div>
                      <span className="file-name" title={file.name}>
                        {file.name}
                      </span>
                      <span className="file-meta">
                        {file.size} • {file.checksum}
                      </span>
                    </div>
                  </div>
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-file-download"
                  >
                    ⬇ Baixar
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Metadados Técnicos e de Repositório */}
          <div className="metadata-box">
            <h3 className="metadata-box-title">
              {isZenodoMeta
                ? "Metadados de Repositório (CERN / Zenodo)"
                : "Metadados Técnicos"}
            </h3>

            {isZenodoMeta ? (
              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="metadata-label">Total de Arquivos</span>
                  <span className="metadata-value">
                    {filesList.length} arquivo(s)
                  </span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Tipo de Acesso</span>
                  <span className="metadata-value text-emerald">
                    {meta.acesso || "Aberto"}
                  </span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Integridade (MD5)</span>
                  <span
                    className="metadata-value font-mono truncate"
                    title={meta.integridade}
                  >
                    {meta.integridade || "Verificado"}
                  </span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Identificador DOI</span>
                  <span
                    className="metadata-value font-mono truncate"
                    title={meta.doi}
                  >
                    {meta.doi || "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="metadata-label">Registros</span>
                  <span className="metadata-value">{meta.rows || "N/A"}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Colunas/Atributos</span>
                  <span className="metadata-value">
                    {meta.columns || "N/A"}
                  </span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Codificação</span>
                  <span className="metadata-value">
                    {meta.encoding || "UTF-8"}
                  </span>
                </div>
                {meta.crs && (
                  <div className="metadata-item">
                    <span className="metadata-label">Sistema (CRS)</span>
                    <span className="metadata-value">{meta.crs}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Visualização Preliminar (Amostra / Status do Arquivo) */}
          {hasValidPreview && (
            <div className="modal-section">
              <h3 className="section-title">
                Visualização Preliminar (Amostra / Status do Arquivo)
              </h3>
              <div className="table-container">
                <table className="preview-table">
                  <thead>
                    <tr className="preview-table-header">
                      {Object.keys(dataset.preview[0]).map((key) => (
                        <th key={key} className="preview-th">
                          {key.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.preview.map((row, index) => (
                      <tr key={index} className="preview-tr">
                        {typeof row === "object" && row !== null ? (
                          Object.values(row).map((val, i) => (
                            <td key={i} className="preview-td">
                              {String(val || "")}
                            </td>
                          ))
                        ) : (
                          <td className="preview-td">{String(row)}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <span className="preview-disclaimer">
                * Exibindo informações preliminares para conferência antes do
                download.
              </span>
            </div>
          )}
        </div>

        {/* Rodapé e Ações de Download em Lote */}
        <div className="modal-footer">
          <div className="footer-formats">
            <span className="formats-label">Formatos disponíveis:</span>
            <div className="formats-list">
              {Array.isArray(dataset.formats) &&
                dataset.formats.map((fmt) => (
                  <span key={fmt} className="format-tag">
                    {fmt}
                  </span>
                ))}
            </div>
          </div>

          <div className="footer-actions">
            {filesList.length > 1 ? (
              <button onClick={handleDownloadAll} className="btn-download-all">
                ⬇ Baixar Todos os Arquivos ({filesList.length})
              </button>
            ) : (
              <a
                href={filesList[0].downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-download-all"
              >
                ⬇ Baixar Arquivo Único
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
