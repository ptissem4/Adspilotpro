
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 AdsPilot Pro : Initialisation du moteur...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("❌ Erreur Critique : Élément #root introuvable dans le DOM.");
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
