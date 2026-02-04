
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("React: Iniciando processo de montagem...");

const container = document.getElementById('root');

if (!container) {
  console.error("Erro Fatal: Elemento #root não encontrado no DOM.");
} else {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React: Aplicativo renderizado com sucesso.");
  } catch (error) {
    console.error("Erro durante a renderização:", error);
    container.innerHTML = `<div style="color: red; padding: 20px;">Erro de inicialização: ${error.message}</div>`;
  }
}
