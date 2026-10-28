import '@fontsource-variable/archivo/wdth.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import './styles.css';
import './depth.css';

// Só com JavaScript ativo as entradas de seção ficam ocultas até aparecerem (sem JS, tudo visível).
document.documentElement.classList.add('js');

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
