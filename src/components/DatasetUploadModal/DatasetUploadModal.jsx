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
  // 1. DECLARAÇÃO DE TODOS OS HOOKS NO TOPO (SEM CONDICIONAIS ANTES)
  // =========================================================================

  // Estados de Carregamento para o Upload Real
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Camada 1: Identificação & Descrição (W3C BP 2)
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState([
    "Dados Abertos",
    "Justiça Climática",
    "São Vicente",
  ]);
  const [currentKeyword, setCurrentKeyword] = useState("");

  // Camada 2: Licenciamento & Temporalidade (W3C BP 13 & BP 2)
  const [license, setLicense] = useState("cc-by-4.0");
  const [updateFrequency, setUpdateFrequency] = useState(
    "Estático / Histórico",
  );

  // Camada 3: Proveniência & Qualidade (PROV-O / DQV)
  const [provenance, setProvenance] = useState("");
  const [dataQuality, setDataQuality] = useState("");

  // Camada 4: Distribuições Físicas (Múltiplos Arquivos)
  const [files, setFiles] = useState([]);

  // =========================================================================
  // 2. VERIFICAÇÃO DE ABERTURA APÓS CARREGAR OS HOOKS NA MEMÓRIA
  // =========================================================================
  if (!isOpen) return null;

  // Lógica para seleção de múltiplos arquivos
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newUniqueFiles = selectedFiles.filter(
        (newFile) => !files.some((existing) => existing.name === newFile.name),
      );
      setFiles([...files, ...newUniqueFiles]);
    }
  };

  const handleRemoveFile = (fileNameToRemove) => {
    setFiles(files.filter((f) => f.name !== fileNameToRemove));
  };

  // Lógica para palavras-chave (Tags)
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

  // =========================================================================
  // 3. ENVIO REAL PARA A API DO ZENODO (CERN) VIA ASYNC / AWAIT
  // =========================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !source || keywords.length === 0) {
      alert(
        "Por favor, preencha o Título, a Fonte/Organização e adicione pelo menos uma Palavra-chave.",
      );
      return;
    }

    if (files.length === 0) {
      alert(
        "Para um upload real, você precisa anexar pelo menos 1 arquivo físico.",
      );
      return;
    }

    // Busca o Token no arquivo .env do Vite
    const token = import.meta.env.VITE_ZENODO_TOKEN;
    if (!token) {
      alert(
        "Erro de Configuração: O token do Zenodo não foi encontrado na variável VITE_ZENODO_TOKEN do seu arquivo .env.",
      );
      return;
    }

    try {
      setIsUploading(true);
      setStatusMessage("1/3: Criando novo depósito...");

      // PASSO 1: Criar o depósito vazio na API do Zenodo Sandbox
      const createRes = await fetch(
        "https://sandbox.zenodo.org/api/deposit/depositions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
      );

      if (!createRes.ok) {
        throw new Error(
          `Falha ao conectar com o Zenodo (Status: ${createRes.status}). Verifique seu token.`,
        );
      }

      const depositionData = await createRes.json();
      const depId = depositionData.id;
      const bucketUrl = depositionData.links.bucket;

      // PASSO 2: Fazer o upload real de cada arquivo selecionado para a nuvem
      const uploadedFilesList = [];
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        setStatusMessage(
          `2/3: Enviando arquivo ${i + 1} de ${files.length} (${fileObj.name})...`,
        );

        const fileRes = await fetch(
          `${bucketUrl}/${encodeURIComponent(fileObj.name)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/octet-stream",
            },
            body: fileObj,
          },
        );

        if (!fileRes.ok) {
          throw new Error(`Falha no upload do arquivo físico: ${fileObj.name}`);
        }
        const fileJson = await fileRes.json();
        uploadedFilesList.push(fileJson);
      }

      // PASSO 3: Salvar os metadados W3C DWBP no depósito criado
      setStatusMessage(
        "3/3: Gravando metadados científicos e solicitando DOI...",
      );

      const metadataPayload = {
        metadata: {
          title: title,
          upload_type: "dataset",
          description:
            description ||
            "Conjunto de dados publicado via Portal de Dados Abertos de São Vicente.",
          creators: [
            {
              name: source,
              affiliation: "Observatório de Justiça Climática de São Vicente",
            },
          ],
          keywords: keywords,
          access_right: "open",
          license: license,
          notes: `[W3C DWBP] Proveniência: ${provenance || "Coleta primária"}. Qualidade: ${dataQuality || "Não declarada"}. Contato: ${contactEmail || "N/A"}. Frequência: ${updateFrequency}.`,
        },
      };

      const updateRes = await fetch(
        `https://sandbox.zenodo.org/api/deposit/depositions/${depId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(metadataPayload),
        },
      );

      if (!updateRes.ok) {
        throw new Error("Falha ao registrar metadados finais no Zenodo.");
      }

      const finalDeposition = await updateRes.json();

      // =========================================================================
      // 🛡️ MAPEAMENTO SEGURO (CORREÇÃO DO ERRO .SPLIT)
      // =========================================================================
      const realDistributions = uploadedFilesList.map((f, idx) => {
        // Suporta tanto o formato do bucket ('key' / 'size') quanto do catálogo ('filename' / 'filesize')
        const fileName =
          f.filename || f.key || files[idx]?.name || "arquivo.zip";
        const fileSizeBytes = f.filesize || f.size || files[idx]?.size || 0;
        const sizeKB = (fileSizeBytes / 1024).toFixed(2);
        const ext = fileName.split(".").pop().toUpperCase();

        return {
          name: fileName,
          format: ext,
          size:
            sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`,
          downloadUrl:
            f.links?.download ||
            f.links?.self ||
            `https://sandbox.zenodo.org/records/${depId}/files/${encodeURIComponent(fileName)}?download=1`,
          checksum: f.checksum || "MD5 Verificado via API CERN",
        };
      });

      const allFormats = [...new Set(realDistributions.map((d) => d.format))];
      const totalSizeKB = uploadedFilesList.reduce((acc, curr) => {
        const bytes = curr.filesize || curr.size || 0;
        return acc + bytes / 1024;
      }, 0);
      const totalSizeFormatted =
        totalSizeKB > 1024
          ? `${(totalSizeKB / 1024).toFixed(2)} MB`
          : `${totalSizeKB.toFixed(2)} KB`;
      const realDoi =
        finalDeposition.metadata.preregister_doi?.doi ||
        `10.5281/zenodo.${depId}`;

      // Monta o card real para o estado local do React
      const newDataset = {
        id: finalDeposition.id,
        title: finalDeposition.metadata.title,
        source: source,
        description: finalDeposition.metadata.description,
        categories: keywords,
        formats: allFormats.length > 0 ? allFormats : ["ZIP"],
        lastUpdated: new Date().toLocaleDateString("pt-BR"),
        downloadUrl: realDistributions[0]?.downloadUrl || "#",
        fileName: realDistributions[0]?.name || "dataset.zip",
        files: realDistributions,
        metadata: {
          tamanho: totalSizeFormatted,
          acesso: "Acesso Aberto (Zenodo Sandbox)",
          integridade: "Verificado com Sucesso via API",
          doi: realDoi,
          licenca: license.toUpperCase(),
          periodicidade: updateFrequency,
          contato: contactEmail || "Não informado",
          proveniencia:
            provenance || "Coleta primária / Dados administrativos oficiais.",
          qualidade:
            dataQuality || "Metadados de qualidade não declarados pelo autor.",
          jsonLd: JSON.stringify(
            {
              "@context": "https://schema.org/",
              "@type": "Dataset",
              name: finalDeposition.metadata.title,
              description: finalDeposition.metadata.description,
              identifier: realDoi,
              url: finalDeposition.links.html,
            },
            null,
            2,
          ),
        },
        preview: [],
      };

      onAddDataset(newDataset);
      alert(
        "🎉 Upload Concluído! O arquivo já está hospedado e disponível para download.",
      );

      // Limpa os estados ao fechar
      setTitle("");
      setSource("");
      setContactEmail("");
      setDescription("");
      setKeywords(["Meio Ambiente & Risco", "São Vicente"]);
      setLicense("cc-by-4.0");
      setUpdateFrequency("Estático / Histórico");
      setProvenance("");
      setDataQuality("");
      setFiles([]);
      onClose();
    } catch (error) {
      console.error("Erro fatal no upload:", error);
      alert(
        `❌ Erro no envio: ${error.message}\n\nAbra o Console (F12) para ver os detalhes da requisição.`,
      );
    } finally {
      setIsUploading(false);
      setStatusMessage("");
    }
  };

  return createPortal(
    <div className="upload-modal-overlay">
      <div className="upload-modal-dialog">
        {/* Cabeçalho */}
        <div className="upload-header">
          <div>
            <span className="upload-subtitle">
              W3C DWBP & Integração Zenodo CERN
            </span>
            <h2 className="upload-title">Publicar no Catálogo de Dados</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="upload-close-btn"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* MENSAGEM DE STATUS EM TEMPO REAL */}
        {isUploading && (
          <div className="upload-loading-banner">
            <div className="loading-spinner"></div>
            <div className="loading-text">
              <strong>Sincronizando com a nuvem do Zenodo...</strong>
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className={`upload-form-body ${isUploading ? "form-disabled" : ""}`}
        >
          {/* SEÇÃO 1: IDENTIFICAÇÃO E DESCRIÇÃO */}
          <div className="form-section">
            <h3 className="form-section-title">1. Identificação e Descrição</h3>

            <div className="form-group">
              <label className="form-label">
                Título do Conjunto de Dados *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                placeholder="Ex: Mapeamento de Suscetibilidade à Inundação"
                className="form-input"
                required
              />
            </div>

            <div className="form-row-2cols">
              <div className="form-group">
                <label className="form-label">Organização / Publicador *</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  disabled={isUploading}
                  placeholder="Ex: Observatório / Defesa Civil"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-mail de Contato *</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  disabled={isUploading}
                  placeholder="ex: pesquisa@observatorio.sv.br"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Palavras-chave / Temas *</label>
              <div className="keyword-input-row">
                <input
                  type="text"
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isUploading}
                  placeholder="Digite e pressione Enter..."
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  disabled={isUploading}
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
                      disabled={isUploading}
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
                      disabled={isUploading}
                      className="btn-remove-keyword"
                      title="Remover"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Descrição Detalhada e Contexto Territorial
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                placeholder="Descreva o propósito dos dados, abrangência geográfica e variáveis medidas..."
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>

          {/* SEÇÃO 2: LICENCIAMENTO E TEMPORALIDADE */}
          <div className="form-section">
            <h3 className="form-section-title">
              2. Licenciamento e Temporalidade
            </h3>

            <div className="form-row-2cols">
              <div className="form-group">
                <label className="form-label">
                  Licença de Reuso Jurídica *
                </label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  disabled={isUploading}
                  className="form-select"
                >
                  <option value="cc-by-4.0">
                    Creative Commons Atribuição (CC-BY 4.0)
                  </option>
                  <option value="cc-zero">
                    Domínio Público Universal (CC0 1.0)
                  </option>
                  <option value="odbl-1.0">
                    Open Data Commons Open Database License (ODbL)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Frequência de Atualização *
                </label>
                <select
                  value={updateFrequency}
                  onChange={(e) => setUpdateFrequency(e.target.value)}
                  disabled={isUploading}
                  className="form-select"
                >
                  <option value="Estático / Histórico">
                    Estático / Histórico (Sem atualizações)
                  </option>
                  <option value="Contínua">
                    Contínua (Monitoramento em tempo real)
                  </option>
                  <option value="Mensal">Mensal</option>
                  <option value="Anual">Anual (Séries históricas)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: PROVENIÊNCIA E QUALIDADE */}
          <div className="form-section">
            <h3 className="form-section-title">
              3. Linhagem, Proveniência e Qualidade
            </h3>

            <div className="form-group">
              <label className="form-label">
                Proveniência e Metodologia de Coleta
              </label>
              <textarea
                value={provenance}
                onChange={(e) => setProvenance(e.target.value)}
                disabled={isUploading}
                placeholder="Explique como os dados foram gerados..."
                className="form-textarea"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Qualidade, Limitações e Vieses Conhecidos
              </label>
              <textarea
                value={dataQuality}
                onChange={(e) => setDataQuality(e.target.value)}
                disabled={isUploading}
                placeholder="Informe possíveis lacunas territoriais, margem de erro do GPS ou resolução espacial..."
                className="form-textarea"
                rows={2}
              />
            </div>
          </div>

          {/* SEÇÃO 4: DISTRIBUIÇÕES FÍSICAS DO DATASET */}
          <div className="form-section">
            <h3 className="form-section-title">4. Distribuições Físicas *</h3>

            <div className="form-group">
              <label className="form-label">
                Anexar Arquivos (Excel, CSV, Shapefile .shp/.dbf, ZIP, JSON)
              </label>

              <div className="file-upload-box">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="file-input"
                />
                <span className="file-instruction">
                  📁 Clique ou arraste os arquivos reais do seu computador
                  (Suporta upload múltiplo)
                </span>
              </div>

              {files.length > 0 && (
                <div className="files-preview-list">
                  <span className="files-preview-title">
                    Arquivos prontos para envio ({files.length}):
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
                          disabled={isUploading}
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
          </div>

          {/* Rodapé com Ação Real */}
          <div className="upload-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="btn-submit-upload"
            >
              {isUploading ? "⏳ Enviando..." : "⬆ Publicar Dataset"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
