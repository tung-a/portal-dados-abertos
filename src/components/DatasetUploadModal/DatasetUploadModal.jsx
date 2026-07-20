import { useState } from "react";
import { createPortal } from "react-dom";
import "./DatasetUploadModal.css";

const QUICK_SUGGESTIONS = [
  "Areas de Risco",
  "São Vicente",
  "Justiça Climática",
  "Economia",
  "Saúde",
  "População",
  "Dados Abertos",
];

export default function DatasetUploadModal({ isOpen, onClose, onAddDataset }) {
  // =========================================================================
  // 1. TODOS OS HOOKS DECLARADOS NO TOPO (SEM CONDICIONAIS ANTES DELES)
  // =========================================================================
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");

  // Array para armazenar MÚLTIPLOS ARQUIVOS
  const [files, setFiles] = useState([]);

  // Estados para Múltiplas Palavras-chave
  const [keywords, setKeywords] = useState([
    "Dados Abertos",
    "Justiça Climática",
    "São Vicente",
  ]);
  const [currentKeyword, setCurrentKeyword] = useState("");

  // =========================================================================
  // 2. VERIFICAÇÃO DE ABERTURA JÁ COM A MEMÓRIA DOS HOOKS GARANTIDA
  // =========================================================================
  if (!isOpen) return null;

  // Adiciona novos arquivos à lista (evitando duplicatas pelo nome)
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newUniqueFiles = selectedFiles.filter(
        (newFile) => !files.some((existing) => existing.name === newFile.name),
      );
      setFiles([...files, ...newUniqueFiles]);
    }
  };

  // Remove um arquivo específico da lista antes do envio
  const handleRemoveFile = (fileNameToRemove) => {
    setFiles(files.filter((f) => f.name !== fileNameToRemove));
  };

  // Lógica de Palavras-chave
  const handleAddKeyword = (e) => {
    e && e.preventDefault();
    const trimmed = currentKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setCurrentKeyword("");
    }
  };

  const handleAddSuggestion = (suggestion) => {
    if (!keywords.includes(suggestion)) {
      setKeywords([...keywords, suggestion]);
    }
  };

  const handleRemoveKeyword = (tagToRemove) => {
    setKeywords(keywords.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  // Envio final do formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !source || keywords.length === 0) {
      alert(
        "Por favor, preencha o título, a fonte e adicione pelo menos uma palavra-chave.",
      );
      return;
    }

    // Se nenhum arquivo for anexado, gera um fallback de demonstração
    const finalFilesList =
      files.length > 0
        ? files
        : [{ name: "dados_colaborativos.zip", size: 128000 }];

    // Mapeia todos os arquivos para a estrutura do portal
    const formattedFiles = finalFilesList.map((f) => {
      const sizeKB = ((f.size || 0) / 1024).toFixed(2);
      return {
        name: f.name,
        size:
          sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`,
        downloadUrl: "#",
        checksum: "MD5 (Gerado no Upload)",
      };
    });

    // Extrai automaticamente todos os formatos únicos anexados (ex: [CSV, SHP, XLSX])
    const allFormats = [
      ...new Set(
        formattedFiles.map((f) => f.name.split(".").pop().toUpperCase()),
      ),
    ];

    // Calcula o tamanho total somado do dataset
    const totalSizeKB = finalFilesList.reduce(
      (acc, curr) => acc + (curr.size || 0) / 1024,
      0,
    );
    const totalSizeFormatted =
      totalSizeKB > 1024
        ? `${(totalSizeKB / 1024).toFixed(2)} MB`
        : `${totalSizeKB.toFixed(2)} KB`;

    // Objeto do novo dataset compatível com múltiplos arquivos e filtros
    const newDataset = {
      id: Date.now(),
      title: title,
      source: source,
      description:
        description || "Dataset publicado via Portal de Dados Abertos.",
      categories: keywords,
      formats: allFormats.length > 0 ? allFormats : ["ZIP"],
      lastUpdated: new Date().toLocaleDateString("pt-BR"),
      downloadUrl: "#",
      fileName: formattedFiles[0].name,
      files: formattedFiles, // ⬅️ Lista completa de múltiplos arquivos
      metadata: {
        tamanho: totalSizeFormatted,
        acesso: "Acesso Aberto",
        integridade: "Verificado no Upload",
        doi: `10.5281/zenodo.${Date.now().toString().slice(-6)}`,
      },
      preview: [],
    };

    onAddDataset(newDataset);

    // Limpa os estados ao fechar
    setTitle("");
    setSource("");
    setDescription("");
    setKeywords(["Meio Ambiente & Risco", "São Vicente"]);
    setFiles([]);
    onClose();
  };

  return createPortal(
    <div className="upload-modal-overlay">
      <div className="upload-modal-dialog">
        {/* Cabeçalho */}
        <div className="upload-header">
          <div>
            <span className="upload-subtitle">
              Ciência Aberta & Colaboração
            </span>
            <h2 className="upload-title">Publicar Novo Dataset</h2>
          </div>
          <button
            onClick={onClose}
            className="upload-close-btn"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="upload-form-body">
          {/* Título */}
          <div className="form-group">
            <label className="form-label">Título do Conjunto de Dados *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Áreas de Risco de Inundação - Bairro Quarentenário"
              className="form-input"
              required
            />
          </div>

          {/* Fonte / Autor */}
          <div className="form-group">
            <label className="form-label">Fonte ou Organização *</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Ex: Equipe 4 - Riscos Climáticos / Defesa Civil"
              className="form-input"
              required
            />
          </div>

          {/* Múltiplas Palavras-chave */}
          <div className="form-group">
            <label className="form-label">Palavras-chave / Temas *</label>
            <div className="keyword-input-row">
              <input
                type="text"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite uma palavra-chave e pressione Enter..."
                className="form-input"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="btn-add-keyword"
              >
                + Adicionar
              </button>
            </div>

            <div className="suggestions-wrapper">
              <span className="suggestions-label">Sugestões:</span>
              <div className="suggestions-list">
                {QUICK_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSuggestion(sug)}
                    className="btn-suggestion-pill"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="added-keywords-container">
              {keywords.length === 0 && (
                <span className="empty-keywords-text">
                  Nenhuma tag adicionada.
                </span>
              )}
              {keywords.map((tag, idx) => (
                <span key={idx} className="keyword-pill">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(tag)}
                    className="btn-remove-keyword"
                    title="Remover"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label className="form-label">
              Descrição Detalhada e Metadados
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do arquivo, metodologia de coleta e cobertura territorial..."
              className="form-textarea"
              rows={3}
            />
          </div>

          {/* ========================================================= */}
          {/* UPLOAD DE MÚLTIPLOS ARQUIVOS                              */}
          {/* ========================================================= */}
          <div className="form-group">
            <label className="form-label">
              Arquivos de Dados (Suporta múltiplos: Excel, CSV, SHP, ZIP)
            </label>

            <div className="file-upload-box">
              <input
                type="file"
                multiple /* ⬅️ ATIVA SELEÇÃO DE MÚLTIPLOS ARQUIVOS */
                onChange={handleFileSelect}
                className="file-input"
              />
              <span className="file-instruction">
                📁 Clique aqui ou arraste seus arquivos (você pode selecionar
                vários de uma vez)
              </span>
            </div>

            {/* Lista visual dos arquivos anexados */}
            {files.length > 0 && (
              <div className="files-preview-list">
                <span className="files-preview-title">
                  Arquivos selecionados ({files.length}):
                </span>
                {files.map((f, idx) => {
                  const sizeFormatted = ((f.size || 0) / 1024).toFixed(2);
                  const displaySize =
                    sizeFormatted > 1024
                      ? `${(sizeFormatted / 1024).toFixed(2)} MB`
                      : `${sizeFormatted} KB`;

                  return (
                    <div key={idx} className="file-preview-item">
                      <div className="file-preview-info">
                        <span className="file-preview-icon">📄</span>
                        <span className="file-preview-name" title={f.name}>
                          {f.name}
                        </span>
                        <span className="file-preview-size">
                          ({displaySize})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(f.name)}
                        className="btn-remove-file"
                        title="Remover arquivo"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div className="upload-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-submit-upload">
              ⬆ Publicar no Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
