import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './theme.css';
import './experience.css';
import './mobile-first.css';
import './color-correction.css';
import './pages.css';

const container = document.getElementById('root');
const path = location.pathname;
const search = location.search;
const app = <App path={path} search={search} />;

if (container.hasChildNodes()) {
  hydrateRoot(container, app, {
    onRecoverableError() {
      createRoot(container).render(app);
    },
  });
} else {
  createRoot(container).render(app);
}
