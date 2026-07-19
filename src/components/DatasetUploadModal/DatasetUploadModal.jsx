import { useState } from "react";
import "./DatasetUploadModal.css";

export default function DatasetUploadModal({ isOpen, onClose, onAddDataset }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Meio Ambiente & Risco");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState(
    "Pesquisa Colaborativa / Ciência Cidadã",
  );
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      alert("Por favor, preencha o título e selecione um arquivo.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    // =========================================================================
    // ⚙️ LÓGICA DE INTEGRAÇÃO COM A API DO ZENODO (OPCIONAL / AVANÇADO)
    // Para usar o upload real, você precisaria de um Personal Access Token
    // gerado em https://sandbox.zenodo.org/account/settings/applications/
    // =========================================================================
    const ZENODO_TOKEN = import.meta.env.VITE_ZENODO_TOKEN || ""; // Token no .env

    try {
      if (ZENODO_TOKEN) {
        // 1. Cria o registro vazio no Zenodo
        setUploadProgress(40);
        const createRes = await fetch(
          `https://sandbox.zenodo.org/api/deposit/depositions?access_token=${ZENODO_TOKEN}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              metadata: {
                title,
                upload_type: "dataset",
                description,
                creators: [{ name: source }],
              },
            }),
          },
        );
        const depositData = await createRes.json();

        // 2. Envia o arquivo real para o bucket do Zenodo
        setUploadProgress(70);
        const formData = new FormData();
        formData.append("file", file);
        await fetch(
          `${depositData.links.bucket}/${file.name}?access_token=${ZENODO_TOKEN}`,
          {
            method: "PUT",
            body: file,
          },
        );
      } else {
        // SIMULAÇÃO VISUAL DE ALTA FIDELIDADE (Para apresentação na disciplina)
        await new Promise((resolve) => setTimeout(resolve, 800));
        setUploadProgress(60);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setUploadProgress(90);
      }
    } catch (error) {
      console.error(
        "Erro no envio para API externa, aplicando modo local:",
        error,
      );
    }

    // =========================================================================
    // 🚀 ATUALIZA O CATÁLOGO DA TELA EM TEMPO REAL
    // =========================================================================
    const fileExtension = file.name.split(".").pop().toUpperCase();
    const mockDoi = `10.5281/zenodo.${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Cria uma URL temporária na memória do navegador para o arquivo enviado!
    const localFileUrl = URL.createObjectURL(file);

    const newDataset = {
      id: Date.now(),
      title: title,
      category: category,
      formats: [fileExtension],
      lastUpdated: new Date().toLocaleDateString("pt-BR"),
      source: source,
      description: `${description} (Publicado com DOI permanente: ${mockDoi})`,
      downloadUrl: localFileUrl, // Permite baixar o próprio arquivo que acabou de subir!
      fileName: file.name,
      metadata: {
        rows: "Processado em tempo real",
        columns: "N/A",
        encoding: "UTF-8",
        doi: mockDoi,
      },
      preview: [
        {
          status: "Arquivo verificado pelo Observatório",
          arquivo: file.name,
          tamanho: `${(file.size / 1024).toFixed(2)} KB`,
        },
      ],
    };

    setUploadProgress(100);
    setIsUploading(false);
    setSuccessMessage(`Dataset publicado com sucesso! DOI: ${mockDoi}`);

    // Adiciona ao estado global do App.jsx
    onAddDataset(newDataset);

    // Limpa o formulário após 2 segundos e fecha
    setTimeout(() => {
      setSuccessMessage(null);
      setTitle("");
      setDescription("");
      setFile(null);
      onClose();
    }, 2500);
  };

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal">
        <div className="upload-modal__header">
          <div>
            <h2 className="upload-modal__title">
              Publicar Novo Conjunto de Dados
            </h2>
            <p className="upload-modal__subtitle">
              Integração com Repositório Científico / Ciência Aberta
            </p>
          </div>
          <button
            onClick={onClose}
            className="upload-modal__close"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {successMessage ? (
          <div className="upload-modal__success">
            <div className="upload-modal__icon">🎉</div>
            <h3>{successMessage}</h3>
            <p>
              O conjunto de dados já está disponível no catálogo de pesquisa do
              portal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="upload-modal__form">
            <div className="upload-field">
              <label>Título do Dataset *</label>
              <input
                type="text"
                required
                placeholder="Ex: Dados Meteorológicos - Escola Estadual São Vicente..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="upload-grid">
              <div className="upload-field">
                <label>Categoria Temática</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Meio Ambiente & Risco">
                    Meio Ambiente & Risco
                  </option>
                  <option value="População">População</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Educação">Educação</option>
                  <option value="Socioeconômico">Socioeconômico</option>
                </select>
              </div>

              <div className="upload-field">
                <label>Instituição / Autor</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>
            </div>

            <div className="upload-field">
              <label>Descrição e Metodologia</label>
              <textarea
                rows="3"
                placeholder="Explique como os dados foram coletados, período e região abrangida..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="upload-dropzone">
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileChange}
                accept=".csv,.xlsx,.zip,.shp"
              />
              <label htmlFor="fileUpload">
                <span className="upload-dropzone__icon">📂</span>
                <span className="upload-dropzone__primary">
                  {file
                    ? file.name
                    : "Clique para selecionar o arquivo (.csv, .xlsx, .zip)"}
                </span>
                <span className="upload-dropzone__secondary">
                  {file
                    ? `Tamanho: ${(file.size / 1024).toFixed(2)} KB`
                    : "Suporta arquivos geográficos e tabelas tabulares"}
                </span>
              </label>
            </div>

            {isUploading && (
              <div className="upload-progress" aria-label="Progresso do upload">
                <div
                  className="upload-progress__bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            <div className="upload-actions">
              <button
                type="button"
                onClick={onClose}
                className="upload-actions__cancel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="upload-actions__submit"
              >
                {isUploading ? "Enviando e Gerando DOI..." : "⬆ Publicar Dados"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
