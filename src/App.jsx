import { useState, useMemo } from "react";
import { datasets } from "./data/mockDatasets";
import Header from "./components/Header/Header";
import SidebarFilters from "./components/SidebarFilters/SidebarFilters";
import DatasetCard from "./components/DatasetCard/DatasetCard";
import DatasetDetailModal from "./components/DatasetDetailModal/DatasetDetailModal";

import "./App.css";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedDataset, setSelectedDataset] = useState(null);

  const categories = useMemo(() => {
    return [...new Set(datasets.map((d) => d.category))];
  }, []);

  const formats = useMemo(() => {
    const allFormats = datasets.flatMap((d) => d.formats);
    return [...new Set(allFormats)];
  }, []);

  const filteredDatasets = useMemo(() => {
    return datasets.filter((dataset) => {
      const matchesSearch =
        dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.source.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory
        ? dataset.category === selectedCategory
        : true;

      const matchesFormat = selectedFormat
        ? dataset.formats.includes(selectedFormat)
        : true;

      return matchesSearch && matchesCategory && matchesFormat;
    });
  }, [searchTerm, selectedCategory, selectedFormat]);

  return (
    <div className="app-shell">
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="app-main">
        <SidebarFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
          categories={categories}
          formats={formats}
        />

        <section className="catalog-section">
          <div className="catalog-header">
            <h2>Catálogo de Dados</h2>
            <span>
              {filteredDatasets.length}{" "}
              {filteredDatasets.length === 1
                ? "resultado encontrado"
                : "resultados encontrados"}
            </span>
          </div>

          {filteredDatasets.length > 0 ? (
            <div className="catalog-grid">
              {filteredDatasets.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  onSelect={(data) => setSelectedDataset(data)}
                />
              ))}
            </div>
          ) : (
            <div className="catalog-empty">
              <p>Nenhum conjunto de dados encontrado com os filtros atuais.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedFormat("");
                }}
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Projeto Integrador - Disciplina Governo Aberto (EACH/USP) •
          Observatório de Justiça Climática de São Vicente
        </p>
      </footer>

      <DatasetDetailModal
        dataset={selectedDataset}
        onClose={() => setSelectedDataset(null)}
      />
    </div>
  );
}
