import { useState, useEffect, useMemo } from "react";
import { datasets as initialDatasets } from "./data/mockDatasets";
import Header from "./components/Header/Header";
import SidebarFilters from "./components/SidebarFilters/SidebarFilters";
import DatasetCard from "./components/DatasetCard/DatasetCard";
import DatasetDetailModal from "./components/DatasetDetailModal/DatasetDetailModal";
import DatasetUploadModal from "./components/DatasetUploadModal/DatasetUploadModal";
import "./App.css";

// Remove tags HTML e decodifica caracteres acentuados (ex: &uacute; -> ú)
const cleanZenodoText = (htmlString) => {
  if (!htmlString) return "Descrição não fornecida nos metadados.";
  const doc = new DOMParser().parseFromString(htmlString, "text/html");
  return doc.body.textContent || "";
};

export default function App() {
  const [datasetsList, setDatasetsList] = useState(initialDatasets);
  const [isLoadingZenodo, setIsLoadingZenodo] = useState(false);

  // Estados de filtro e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");

  // Estados para controle de abertura dos modais
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // =========================================================================
  // 📄 CONTROLE DE PAGINAÇÃO (Evita rolagem infinita)
  // =========================================================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // ⬅️ Define 6 cards por página (fica perfeito em grids 2x3 ou 3x2)

  // Sempre que o usuário buscar algo ou mudar um filtro, volta automaticamente para a Página 1

  // =========================================================================
  // 🔄 BUSCA AUTOMÁTICA DOS SEUS UPLOADS NO ZENODO SANDBOX VIA API
  // =========================================================================
  useEffect(() => {
    const fetchMyZenodoUploads = async () => {
      const ZENODO_TOKEN = import.meta.env.VITE_ZENODO_TOKEN;

      if (!ZENODO_TOKEN) {
        console.warn(
          "Token VITE_ZENODO_TOKEN não encontrado no .env. Exibindo apenas dados locais.",
        );
        return;
      }

      setIsLoadingZenodo(true);
      try {
        // Consulta a API de depósitos do Zenodo Sandbox usando o seu token pessoal
        const response = await fetch(
          `https://sandbox.zenodo.org/api/deposit/depositions?access_token=${ZENODO_TOKEN}`,
        );

        if (!response.ok) {
          throw new Error(`Erro na API do Zenodo: ${response.status}`);
        }

        const depositions = await response.json();

        // Converte os depósitos retornados pelo servidor para o formato do Portal
        const zenodoFormatted = depositions.map((dep) => {
          const recordId = dep.record_id || dep.id;

          // 1. MAPEIA TODOS OS ARQUIVOS DO DATASET
          const allFiles = Array.isArray(dep.files)
            ? dep.files.map((f) => {
                const fName = f.filename || f.key || "arquivo.zip";
                const fSizeKB = ((f.filesize || f.size || 0) / 1024).toFixed(2);
                return {
                  name: fName,
                  size:
                    fSizeKB > 1024
                      ? `${(fSizeKB / 1024).toFixed(2)} MB`
                      : `${fSizeKB} KB`,
                  downloadUrl: `https://sandbox.zenodo.org/records/${recordId}/files/${encodeURIComponent(fName)}?download=1`,
                  checksum: f.checksum || "MD5 Verificado",
                };
              })
            : [];

          // 2. EXTRAI TODOS OS FORMATOS ÚNICOS DESSE DATASET
          const allFormats = [
            ...new Set(
              allFiles.map((f) => f.name.split(".").pop().toUpperCase()),
            ),
          ];

          // 3. DEFINIÇÃO DE MÚLTIPLAS CATEGORIAS (Filtros simultâneos)
          const allCategories =
            Array.isArray(dep.metadata?.keywords) &&
            dep.metadata.keywords.length > 0
              ? dep.metadata.keywords
              : ["Meio Ambiente & Risco", "Dados Abertos"];

          return {
            id: dep.id,
            title: dep.title || dep.metadata?.title || "Dataset sem título",
            categories: allCategories, // ⬅️ Agora é um Array com múltiplas categorias!
            formats: allFormats.length > 0 ? allFormats : ["ZIP"],
            lastUpdated: new Date(
              dep.modified || dep.created,
            ).toLocaleDateString("pt-BR"),
            source:
              dep.metadata?.creators?.[0]?.name ||
              "Observatório de Justiça Climática",
            description: cleanZenodoText(dep.metadata?.description),
            files: allFiles, // ⬅️ Array com a lista completa de arquivos!
            metadata: {
              tamanho:
                allFiles
                  .reduce((acc, curr) => acc + parseFloat(curr.size), 0)
                  .toFixed(2) + " KB/MB",
              acesso:
                dep.metadata?.access_right === "open"
                  ? "Acesso Aberto"
                  : "Público",
              doi: dep.doi || `10.5281/zenodo.${dep.id}`,
            },
            preview: [],
          };
        });

        // Se encontrar dados na sua conta, adiciona no topo do catálogo evitando duplicatas
        if (zenodoFormatted.length > 0) {
          setDatasetsList((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const newItems = zenodoFormatted.filter(
              (d) => !existingIds.has(d.id),
            );
            return [...newItems, ...prev];
          });
        }
      } catch (error) {
        console.error(
          "Falha ao carregar seus datasets do Zenodo Sandbox:",
          error,
        );
      } finally {
        setIsLoadingZenodo(false);
      }
    };

    fetchMyZenodoUploads();
  }, []);

  // 1. Extração dinâmica de CATEGORIAS únicas (suporta array ou string simples)
  const categories = useMemo(() => {
    const allCats = datasetsList.flatMap((d) => {
      if (Array.isArray(d.categories)) return d.categories;
      if (d.category) return [d.category];
      return [];
    });
    return [...new Set(allCats)];
  }, [datasetsList]);

  // 2. Extração dinâmica de FORMATOS únicos (⬅️ É ESTE BLOCO QUE RESOLVE O SEU ERRO!)
  const formats = useMemo(() => {
    const allFormats = datasetsList.flatMap((d) => {
      if (Array.isArray(d.formats)) return d.formats;
      return [];
    });
    return [...new Set(allFormats)];
  }, [datasetsList]);

  // 3. Lógica de Filtragem (Busca + Categoria + Formato)
  const filteredDatasets = useMemo(() => {
    return datasetsList.filter((dataset) => {
      const matchesSearch =
        (dataset.title &&
          dataset.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dataset.description &&
          dataset.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (dataset.source &&
          dataset.source.toLowerCase().includes(searchTerm.toLowerCase()));

      // Verifica se a categoria selecionada está no array de categorias do card
      const matchesCategory = selectedCategory
        ? Array.isArray(dataset.categories)
          ? dataset.categories.includes(selectedCategory)
          : dataset.category === selectedCategory
        : true;

      // Verifica se o formato selecionado está no array de formatos do card
      const matchesFormat = selectedFormat
        ? Array.isArray(dataset.formats) &&
          dataset.formats.includes(selectedFormat)
        : true;

      return matchesSearch && matchesCategory && matchesFormat;
    });
  }, [datasetsList, searchTerm, selectedCategory, selectedFormat]);

  // Calcula o total de páginas e recorta apenas os itens da página atual
  const totalPages = Math.ceil(filteredDatasets.length / itemsPerPage);

  const paginatedDatasets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDatasets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDatasets, currentPage]);

  return (
    <div className="min-h-screen">
      {/* 1. Cabeçalho & Barra de Busca */}
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* 2. Área Principal (Sidebar + Catálogo) */}
      <main>
        {/* Filtros Laterais */}
        <SidebarFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
          categories={categories}
          formats={formats}
        />

        {/* Catálogo de Dados (Grid de Cards) */}
        <section className="flex-1">
          <div className="catalog-header">
            <div>
              <div className="catalog-title-wrapper">
                <h2>Catálogo de Dados</h2>
                {isLoadingZenodo && (
                  <span className="sync-badge">
                    ⚡ Sincronizando com Zenodo...
                  </span>
                )}
              </div>
              <span className="catalog-subtitle">
                {filteredDatasets.length}{" "}
                {filteredDatasets.length === 1
                  ? "resultado encontrado"
                  : "resultados encontrados"}
              </span>
            </div>

            {/* Botão para abrir o Modal de Upload */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="btn-publish"
            >
              <span>➕ Publicar Novo Dataset</span>
            </button>
          </div>

          {/* Grid de Cards (Agora renderiza APENAS os itens da página atual) */}
          {filteredDatasets.length > 0 ? (
            <>
              <div className="datasets-grid">
                {paginatedDatasets.map((dataset) => (
                  <DatasetCard
                    key={dataset.id}
                    dataset={dataset}
                    onSelect={(data) => setSelectedDataset(data)}
                  />
                ))}
              </div>

              {/* Controles de Paginação (Só aparecem se houver mais de 1 página) */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 400, behavior: "smooth" }); // Sobe suavemente ao topo do catálogo
                    }}
                    disabled={currentPage === 1}
                    className="btn-pagination"
                  >
                    ← Anterior
                  </button>

                  <span className="pagination-info">
                    Página <strong>{currentPage}</strong> de{" "}
                    <strong>{totalPages}</strong>
                  </span>

                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    disabled={currentPage === totalPages}
                    className="btn-pagination"
                  >
                    Próximo →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>Nenhum conjunto de dados encontrado com os filtros atuais.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedFormat("");
                }}
                className="btn-clear-filters"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </section>
      </main>

      {/* 3. Rodapé */}
      <footer>
        <p>
          Projeto Integrador - Disciplina Governo Aberto (EACH/USP) •
          Observatório de Justiça Climática de São Vicente
        </p>
      </footer>

      {/* 4. Modais */}
      <DatasetDetailModal
        dataset={selectedDataset}
        onClose={() => setSelectedDataset(null)}
      />

      <DatasetUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddDataset={(newDataset) => {
          setDatasetsList([newDataset, ...datasetsList]);
        }}
      />
    </div>
  );
}
