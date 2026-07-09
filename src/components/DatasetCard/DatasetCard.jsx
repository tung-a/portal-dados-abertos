import "./DatasetCard.css";

export default function DatasetCard({ dataset, onSelect }) {
  return (
    <article className="dataset-card">
      <div>
        <div className="dataset-card__header">
          <span className="dataset-card__badge">{dataset.category}</span>
          <span className="dataset-card__updated">
            Atualizado: {dataset.lastUpdated}
          </span>
        </div>

        <h3 className="dataset-card__title">{dataset.title}</h3>
        <p className="dataset-card__description">{dataset.description}</p>
      </div>

      <div className="dataset-card__footer">
        <div className="dataset-card__formats">
          {dataset.formats.map((fmt) => (
            <span key={fmt} className="dataset-card__format">
              {fmt}
            </span>
          ))}
        </div>

        <button onClick={() => onSelect(dataset)} className="dataset-card__action">
          Explorar dados →
        </button>
      </div>
    </article>
  );
}
