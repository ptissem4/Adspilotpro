
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 AdsPilot Pro : Initialisation du moteur...");

// --- ERROR BOUNDARY ---
// Define interfaces for Props and State to fix TS property access errors
interface ErrorBoundaryProps {
  // Fix: Making children optional helps resolve JSX validation errors in some TS versions
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Fixed class component definition with explicit Generic types
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declare state and props to resolve "Property does not exist" errors
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Fix: Explicit initialization of state in constructor
    this.state = { hasError: false, error: null };
    this.props = props;
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("❌ ERREUR CRITIQUE REACT:", error, errorInfo);
  }

  render() {
    // Fix: Accessing this.state which is now explicitly declared
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#FEF2F2', minHeight: '100vh', color: '#991B1B' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>💀 Erreur Critique - Application Crashée</h1>
          <p>Une erreur technique empêche l'affichage de l'application.</p>
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #FCA5A5', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Recharger la page
          </button>
        </div>
      );
    }

    // Fix: Accessing this.props.children which is now explicitly declared
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("❌ Erreur Critique : Élément #root introuvable dans le DOM.");
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
