// ============================================================
// Punto de entrada — main.ts
//
// Responsabilidad: inicializar la app, manejar el health-check
// y controlar qué panel se muestra al cambiar de tab.
// ============================================================

import { API_URL } from './config.js';
import { mountApod }   from './components/apod.js';
import { mountUsers }  from './components/users.js';
import { mountFruits } from './components/fruits.js';

// Tipo que agrupa los nombres de tabs válidos
type Tab = 'apod' | 'users' | 'fruits';

// Etiquetas visibles en los botones
const ETIQUETAS: Record<Tab, string> = {
  apod:   '🌌 NASA APOD',
  users:  '👤 Usuarios',
  fruits: '🍎 Frutas',
};

// Endpoint activo que se muestra debajo de los tabs
const ENDPOINTS: Record<Tab, string> = {
  apod:   `${API_URL}/api/apod`,
  users:  `${API_URL}/api/users`,
  fruits: `${API_URL}/api/fruits`,
};

// Función que monta cada panel (una por tab)
const MONTAR: Record<Tab, (c: HTMLElement) => void> = {
  apod:   mountApod,
  users:  mountUsers,
  fruits: mountFruits,
};

// ── 1. Construir el HTML base de la app ──────────────────────────────────────
const app = document.getElementById('app')!;

app.innerHTML = `
  <div class="app">

    <header class="header">
      <div class="header-badges">
        <span class="badge badge-yellow">TypeScript</span>
        <span class="badge badge-purple">Next.js API</span>
        <span class="badge badge-green">GET · POST · PUT · DELETE</span>
      </div>
      <h1>Universal Data Fetcher</h1>
      <p class="header-subtitle">
        Consume, gestiona y persiste datos de múltiples APIs externas
      </p>
      <div id="conn-status" class="conn-status conn-loading">
        ⏳ Verificando conexión...
      </div>
    </header>

    <!-- Tabs de navegación -->
    <div class="tabs" id="tabs">
      ${(Object.keys(ETIQUETAS) as Tab[])
        .map((t) => `<button class="tab-btn" data-tab="${t}">${ETIQUETAS[t]}</button>`)
        .join('')}
    </div>

    <!-- Muestra el endpoint del tab activo -->
    <div class="endpoint-bar">
      <span class="endpoint-label">Endpoint activo</span>
      <code id="endpoint-url" class="endpoint-url">${ENDPOINTS['apod']}</code>
    </div>

    <!-- Aquí se monta el panel del tab activo -->
    <main class="main" id="panel-root"></main>

  </div>`;

// ── 2. Health-check al backend ───────────────────────────────────────────────
const connEl = document.getElementById('conn-status')!;

async function verificarConexion(): Promise<void> {
  connEl.className = 'conn-status conn-loading';
  connEl.textContent = '⏳ Verificando conexión...';

  try {
    const res = await fetch(`${API_URL}/api/health`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });

    if (res.ok) {
      connEl.className   = 'conn-status conn-ok';
      connEl.textContent = '● Backend conectado';
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch {
    connEl.className = 'conn-status conn-error';
    connEl.innerHTML =
      '● Sin conexión con el backend ' +
      '<button id="btn-reintentar" class="btn-retry">↺ Reintentar</button>';
    document.getElementById('btn-reintentar')
      ?.addEventListener('click', verificarConexion);
  }
}

verificarConexion();

// ── 3. Cambio de tab ─────────────────────────────────────────────────────────
let tabActivo: Tab = 'apod';
const panelRoot  = document.getElementById('panel-root')!;
const endpointEl = document.getElementById('endpoint-url')!;

function cambiarTab(tab: Tab): void {
  tabActivo = tab;

  // Actualizar estilos de los botones
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset['tab'] === tab);
  });

  // Actualizar la barra de endpoint
  endpointEl.textContent = ENDPOINTS[tab];

  // Desmontar panel anterior y montar el nuevo
  panelRoot.innerHTML = '';
  MONTAR[tab](panelRoot);
}

document.getElementById('tabs')!.addEventListener('click', (e) => {
  const boton = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tab]');
  if (!boton) return;
  const tab = boton.dataset['tab'] as Tab;
  if (tab && tab !== tabActivo) cambiarTab(tab);
});

// Cargar el tab inicial
cambiarTab('apod');
