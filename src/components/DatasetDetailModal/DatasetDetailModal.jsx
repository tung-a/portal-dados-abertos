import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./DatasetDetailModal.css";

const LICENSE_INFO = {
  "cc-by-4.0": {
    label: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/deed.pt",
    title: "Creative Commons Atribuição 4.0",
  },
  "cc-zero": {
    label: "CC0 1.0",
    url: "https://creativecommons.org/publicdomain/zero/1.0/deed.pt",
    title: "Domínio Público Universal",
  },
  "odbl-1.0": {
    label: "ODbL 1.0",
    url: "https://opendatacommons.org/licenses/odbl/1-0/",
    title: "Open Database License",
  },
};

const getLicense = (key) =>
  key ? LICENSE_INFO[key] || { label: key, url: null, title: key } : null;

export default function DatasetDetailModal({ dataset, onClose }) {
  // =========================================================================
  // 1. TODOS OS HOOKS DECLARADOS NO TOPO (SEM CONDICIONAIS ANTES DELES)
  // =========================================================================
  const [fileSearchTerm, setFileSearchTerm] = useState("");
  const [selectedFileFormat, setSelectedFileFormat] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const dialogRef = useRef(null);

  // Reset síncrono de estado interno quando o dataset muda
  useEffect(() => {
    if (!dataset) return;
    setFileSearchTerm("");
    setSelectedFileFormat("");
    setIsCopied(false);
  }, [dataset]);

  // Trava o scroll do body quando o modal está aberto (corrige iOS Safari)
  useEffect(() => {
    if (!dataset) return;
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [dataset]);

  // Fecha o modal com Escape e foca no dialog ao abrir
  useEffect(() => {
    if (!dataset) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dataset, onClose]);

  // Injeta JSON-LD estruturado no <head> para SEO e rastreabilidade (BP14)
  useEffect(() => {
    if (!dataset) return;

    const meta = dataset.metadata || {};
    const license = getLicense(meta.licenca);
    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Dataset",
      name: dataset.title,
      description: dataset.description,
      ...(meta.doi && { identifier: `https://doi.org/${meta.doi}` }),
      ...(dataset.source && {
        creator: { "@type": "Organization", name: dataset.source },
      }),
      ...(license?.url && { license: license.url }),
      ...(dataset.lastUpdated && { dateModified: dataset.lastUpdated }),
      keywords: Array.isArray(dataset.categories) ? dataset.categories : [],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "dataset-jsonld";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById("dataset-jsonld");
      if (existing) document.head.removeChild(existing);
    };
  }, [dataset]);

  // =========================================================================
  // 2. VERIFICAÇÃO CONDICIONAL SEGURA
  // =========================================================================
  if (!dataset) return null;

  const meta = dataset.metadata || {};
  const license = getLicense(meta.licenca);
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
  const availableFileFormats = [
    ...new Set(filesList.map((f) => f.name.split(".").pop().toUpperCase())),
  ];

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
    filteredFiles.forEach((file) => {
      const a = document.createElement("a");
      a.href = file.downloadUrl;
      a.download = file.name;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const handleShareDirectLink = async () => {
    const directUrl = `${window.location.origin}${window.location.pathname}?id=${dataset.id}`;
    try {
      await navigator.clipboard.writeText(directUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = directUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const hasDwbpFields =
    license ||
    meta.periodicidade ||
    meta.contato ||
    meta.proveniencia ||
    meta.qualidade;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div className="modal-dialog" ref={dialogRef} tabIndex={-1}>
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
            <h2 id="modal-title" className="modal-title">
              {dataset.title || "Sem título"}
            </h2>
            <p className="modal-source-text">
              Fonte: {dataset.source || "Não informada"}
              {dataset.lastUpdated && (
                <span className="modal-date-text">
                  {" "}
                  · Atualizado em {dataset.lastUpdated}
                </span>
              )}
            </p>
          </div>

          <div className="header-actions-col">
            <button
              onClick={handleShareDirectLink}
              className={`btn-share-link ${isCopied ? "copied" : ""}`}
              title="Copiar link direto para este dataset"
            >
              {isCopied ? "✅" : "🔗"}
              <span className="btn-share-label">
                {isCopied ? " Link Copiado!" : " Compartilhar"}
              </span>
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
          {/* O QUE ESTOU VENDO? */}
          <div className="modal-section">
            <h3 className="section-title">Sobre este conjunto de dados</h3>
            <p className="section-description">
              {dataset.description ||
                "Nenhuma descrição detalhada fornecida para este conjunto de dados."}
            </p>
          </div>

          {/* SEÇÃO DE ARQUIVOS COM PESQUISA E FILTRO INTERNO */}
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

            {filesList.length > 1 && (
              <div className="internal-file-controls">
                <div className="file-search-wrapper">
                  <input
                    type="text"
                    value={fileSearchTerm}
                    onChange={(e) => setFileSearchTerm(e.target.value)}
                    placeholder="Buscar arquivo específico por nome..."
                    className="file-search-input"
                    aria-label="Buscar arquivo por nome"
                  />
                  {fileSearchTerm && (
                    <button
                      onClick={() => setFileSearchTerm("")}
                      className="file-search-clear"
                      aria-label="Limpar busca de arquivo"
                    >
                      ✕
                    </button>
                  )}
                </div>

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

          {/* METADADOS TÉCNICOS (BP7 — identificadores persistentes) */}
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
                {meta.doi ? (
                  <a
                    href={`https://doi.org/${meta.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="metadata-value font-mono truncate metadata-doi-link"
                    title={`Acessar registro completo: ${meta.doi}`}
                  >
                    {meta.doi}
                  </a>
                ) : (
                  <span className="metadata-value font-mono">N/A</span>
                )}
              </div>
            </div>

          </div>

          {/* REUTILIZAÇÃO E PROVENIÊNCIA — bloco independente (W3C DWBP BP4, BP5, BP6, BP23, BP29) */}
          {hasDwbpFields && (
            <div className="dwbp-box">
              <div className="dwbp-box-header">
                <h3 className="dwbp-box-title">Reutilização e Proveniência</h3>
                <span className="dwbp-badge">W3C DWBP</span>
              </div>

              <div className="dwbp-grid">
                {/* BP4 — Licença */}
                {license && (
                  <div className="metadata-item">
                    <span className="metadata-label">Licença de Uso</span>
                    {license.url ? (
                      <a
                        href={license.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="license-badge"
                        title={license.title}
                      >
                        {license.label}
                      </a>
                    ) : (
                      <span className="license-badge license-badge--plain">
                        {license.label}
                      </span>
                    )}
                  </div>
                )}

                {/* BP29 — Frequência de atualização */}
                {meta.periodicidade && (
                  <div className="metadata-item">
                    <span className="metadata-label">Atualização</span>
                    <span className="metadata-value">{meta.periodicidade}</span>
                  </div>
                )}

                {/* BP23 — Contato responsável */}
                {meta.contato && (
                  <div className="metadata-item">
                    <span className="metadata-label">Contato</span>
                    {meta.contato.includes("@") ? (
                      <a
                        href={`mailto:${meta.contato}`}
                        className="metadata-value metadata-contact-link"
                      >
                        {meta.contato}
                      </a>
                    ) : (
                      <span className="metadata-value">{meta.contato}</span>
                    )}
                  </div>
                )}

                {/* BP5 — Proveniência */}
                {meta.proveniencia && (
                  <div className="metadata-item metadata-item--full">
                    <span className="metadata-label">Proveniência e Metodologia</span>
                    <span className="metadata-value dwbp-text">{meta.proveniencia}</span>
                  </div>
                )}

                {/* BP6 — Qualidade */}
                {meta.qualidade && (
                  <div className="metadata-item metadata-item--full">
                    <span className="metadata-label">Qualidade e Limitações Conhecidas</span>
                    <span className="metadata-value dwbp-text">{meta.qualidade}</span>
                  </div>
                )}
              </div>
            </div>
          )}

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
