import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'Roboto, sans-serif' }}>
          <h2 style={{ color: '#1a3c2c' }}>Algo deu errado.</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#007a4a', color: '#fff', border: 'none',
              padding: '0.65rem 1.5rem', borderRadius: '0.5rem',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Recarregar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
