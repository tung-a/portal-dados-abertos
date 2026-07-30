import "./ProjectDocs.css";

// ─── Edite aqui para adicionar ou renomear documentos ────────────────────────
// Coloque os PDFs em: public/docs/nome-do-arquivo.pdf
const DOCS = [
  {
    file: "slides-projeto.pdf",
    title: "Slides de Apresentação",
    description:
      "Apresentação do projeto para a disciplina Governo Aberto (EACH/USP).",
  },
  {
    file: "relatorio-final.pdf",
    title: "Relatório Final",
    description:
      "Relatório completo de desenvolvimento, decisões técnicas e conformidade W3C DWBP.",
  },
];

// ─── Cole aqui o ID do vídeo do Google Drive ──────────────────────────────────
// URL do Drive: drive.google.com/file/d/ESTE_TRECHO_É_O_ID/view
const GOOGLE_DRIVE_VIDEO_ID = "1sPJZqH46QvQVfdE7M43QFBLC94tzOOl8";

export default function ProjectDocs() {
  return (
    <section className="project-docs-section">
      <div className="project-docs-inner">
        <div className="project-docs-header">
          <h2 className="project-docs-title">Documentação do Projeto</h2>
          <p className="project-docs-subtitle">
            Material produzido ao longo do desenvolvimento
          </p>
        </div>

        <div className="docs-main-grid">
          {/* Coluna esquerda: PDFs empilhados */}
          <div className="docs-pdf-col">
            <h3 className="docs-col-title">Documentos</h3>
            <div className="docs-pdf-grid">
              {DOCS.map((doc) => (
                <a
                  key={doc.file}
                  href={`/docs/${doc.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doc-card"
                >
                  <div className="doc-preview-container">
                    <iframe
                      src={`/docs/${doc.file}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      title={`Preview: ${doc.title}`}
                      className="doc-preview-iframe"
                      tabIndex={-1}
                    />
                  </div>
                  <div className="doc-card-body">
                    <span className="doc-card-title">{doc.title}</span>
                    <span className="doc-card-desc">{doc.description}</span>
                    <span className="doc-card-cta">Abrir PDF →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Coluna direita: vídeo */}
          <div className="docs-video-block">
            <h3 className="docs-col-title">Vídeo de Apresentação</h3>
            {GOOGLE_DRIVE_VIDEO_ID ? (
              <div className="video-wrapper">
                <iframe
                  src={`https://drive.google.com/file/d/${GOOGLE_DRIVE_VIDEO_ID}/preview`}
                  title="Vídeo de apresentação do projeto"
                  allow="autoplay"
                  allowFullScreen
                  className="video-iframe"
                />
              </div>
            ) : (
              <div className="video-placeholder">
                <span className="video-placeholder-icon" aria-hidden="true">
                  🎬
                </span>
                <p className="video-placeholder-text">Vídeo não configurado.</p>
                <p className="video-placeholder-hint">
                  Abra <code>ProjectDocs.jsx</code> e preencha{" "}
                  <code>GOOGLE_DRIVE_VIDEO_ID</code> com o ID do arquivo no
                  Drive.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
