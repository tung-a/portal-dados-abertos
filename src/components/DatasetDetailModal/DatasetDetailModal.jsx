import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./DatasetDetailModal.css";

export default function DatasetDetailModal({ dataset, onClose }) {
  // =========================================================================
  // 1. TODOS OS HOOKS DECLARADOS NO TOPO (SEM CONDICIONAIS ANTES DELES)
  // =========================================================================
  const [fileSearchTerm, setFileSearchTerm] = useState("");
  const [selectedFileFormat, setSelectedFileFormat] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!dataset) return;

    const resetInternalState = () => {
      setFileSearchTerm("");
      setSelectedFileFormat("");
      setIsCopied(false);
    };

    const timeoutId = window.setTimeout(resetInternalState, 0);
    return () => window.clearTimeout(timeoutId);
  }, [dataset]);

  // =========================================================================
  // 2. VERIFICAÇÃO CONDICIONAL SEGURA
  // =========================================================================
  if (!dataset) return null;

  const meta = dataset.metadata || {};
  const isZenodoMeta =
    meta.tamanho !== undefined ||
    meta.doi !== undefined ||
    meta.integridade !== undefined;

  // Normalização da lista de arquivos
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

  const categoriesList = Array.isArray(dataset.categories)
    ? dataset.categories
    : [dataset.category || "Geral"];

  const hasValidPreview =
    Array.isArray(dataset.preview) &&
    dataset.preview.length > 0 &&
    typeof dataset.preview[0] === "object" &&
    dataset.preview[0] !== null;

  // =========================================================================
  // 3. LÓGICA DE FILTRAGEM E PESQUISA INTERNA DE ARQUIVOS
  // =========================================================================
  // Extrai todas as extensões únicas presentes nos arquivos deste card (ex: [CSV, SHP, ZIP])
  const availableFileFormats = [
    ...new Set(filesList.map((f) => f.name.split(".").pop().toUpperCase())),
  ];

  // Filtra os arquivos com base na digitação e no botão de formato clicado
  const filteredFiles = filesList.filter((file) => {
    const matchesName = file.name
      .toLowerCase()
      .includes(fileSearchTerm.toLowerCase());
    const fileExt = file.name.split(".").pop().toUpperCase();
    const matchesFormat = selectedFileFormat
      ? fileExt === selectedFileFormat
      : true;
    return matchesName && matchesFormat;
  });

  // =========================================================================
  // 4. AÇÕES DO USUÁRIO (DOWNLOAD EM LOTE & COMPARTILHAMENTO)
  // =========================================================================
  const handleDownloadAll = () => {
    filteredFiles.forEach((file, index) => {
      setTimeout(() => {
        window.open(file.downloadUrl, "_blank");
      }, index * 400);
    });
  };

  const handleShareDirectLink = () => {
    const directUrl = `${window.location.origin}${window.location.pathname}?id=${dataset.id}`;
    navigator.clipboard.writeText(directUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000); // Volta ao texto original após 3 segundos
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-dialog">
        {/* Cabeçalho com Categorias, Título e Botão de Compartilhar */}
        <div className="modal-header">
          <div className="header-info-col">
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

          <div className="header-actions-col">
            <button
              onClick={handleShareDirectLink}
              className={`btn-share-link ${isCopied ? "copied" : ""}`}
              title="Copiar link direto para este dataset"
            >
              {isCopied ? "✅ Link Copiado!" : "🔗 Compartilhar Link"}
            </button>
            <button
              onClick={onClose}
              className="modal-close"
              aria-label="Fechar modal"
            >
              ✕
            </button>
          </div>
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

          {/* ========================================================= */}
          {/* SEÇÃO DE ARQUIVOS COM PESQUISA E FILTRO INTERNO           */}
          {/* ========================================================= */}
          <div className="modal-section">
            <div className="section-header-row">
              <div>
                <h3 className="section-title">
                  Arquivos Disponíveis ({filesList.length})
                </h3>
                <span className="section-subtitle">
                  Filtre por formato ou busque pelo nome para baixar
                </span>
              </div>
            </div>

            {/* Barra de Busca Interna e Pílulas de Extensão */}
            {filesList.length > 1 && (
              <div className="internal-file-controls">
                {/* 1. Input de Pesquisa Expandido (Ocupa a primeira linha inteira) */}
                <div className="file-search-wrapper">
                  <input
                    type="text"
                    value={fileSearchTerm}
                    onChange={(e) => setFileSearchTerm(e.target.value)}
                    placeholder="Buscar arquivo específico por nome..."
                    className="file-search-input"
                  />
                  {fileSearchTerm && (
                    <button
                      onClick={() => setFileSearchTerm("")}
                      className="file-search-clear"
                      title="Limpar busca"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* 2. Filtros Rápidos por Extensão (Organizados na segunda linha) */}
                <div className="file-format-pills">
                  <span className="format-pill-label">
                    Filtrar por formato:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFileFormat("")}
                    className={`format-pill ${selectedFileFormat === "" ? "active" : ""}`}
                  >
                    Todos ({filesList.length})
                  </button>
                  {availableFileFormats.map((fmt) => {
                    const count = filesList.filter(
                      (f) => f.name.split(".").pop().toUpperCase() === fmt,
                    ).length;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() =>
                          setSelectedFileFormat(
                            fmt === selectedFileFormat ? "" : fmt,
                          )
                        }
                        className={`format-pill ${selectedFileFormat === fmt ? "active" : ""}`}
                      >
                        {fmt} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lista de Arquivos Filtrada */}
            <div className="files-list-container">
              {filteredFiles.length === 0 ? (
                <div className="empty-files-message">
                  Nenhum arquivo encontrado para{" "}
                  <strong>"{fileSearchTerm || selectedFileFormat}"</strong>.
                  <button
                    onClick={() => {
                      setFileSearchTerm("");
                      setSelectedFileFormat("");
                    }}
                    className="btn-reset-file-filter"
                  >
                    Limpar filtros de arquivo
                  </button>
                </div>
              ) : (
                filteredFiles.map((file, idx) => (
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
                ))
              )}
            </div>
          </div>

          {/* Metadados Técnicos e de Repositório */}
          <div className="metadata-box">
            <h3 className="metadata-box-title">
              {isZenodoMeta
                ? "Metadados de Repositório (CERN / Zenodo)"
                : "Metadados Técnicos"}
            </h3>

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
          </div>

          {/* Visualização Preliminar (Tabela de Amostra) */}
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
            {filteredFiles.length > 1 ? (
              <button onClick={handleDownloadAll} className="btn-download-all">
                ⬇ Baixar Arquivos Listados ({filteredFiles.length})
              </button>
            ) : filteredFiles.length === 1 ? (
              <a
                href={filteredFiles[0].downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-download-all"
              >
                ⬇ Baixar Arquivo Único
              </a>
            ) : (
              <button disabled className="btn-download-all disabled">
                Nenhum arquivo para baixar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
