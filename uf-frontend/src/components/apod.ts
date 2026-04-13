// ============================================================
// Capa de UI — ApodPanel
//
// Responsabilidad: renderizar el panel de NASA APOD y manejar
// los eventos (obtener foto del día, rango, crear, editar, borrar).
// ============================================================

import type { ApodEntry, ApiResponse } from '../types/index.js';
import { API_URL } from '../config.js';

const HEADERS: HeadersInit = {
  'ngrok-skip-browser-warning': 'true',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// ── Genera el HTML de una tarjeta APOD ───────────────────────────────────────
function tarjetaApodHTML(entrada: ApodEntry): string {
  const media = entrada.media_type === 'image'
    ? `<img src="${entrada.url}" alt="${entrada.title}" class="apod-img" />`
    : `<iframe src="${entrada.url}" title="${entrada.title}" class="apod-video" allowfullscreen></iframe>`;

  const texto = entrada.explanation.length > 220
    ? entrada.explanation.slice(0, 220) + '…'
    : entrada.explanation;

  const enlaceHD = entrada.hdurl
    ? `<a href="${entrada.hdurl}" target="_blank" rel="noreferrer" class="btn-search"
         style="text-decoration:none;padding:0.3rem 0.75rem;display:inline-block">🔭 HD</a>`
    : '';

  return `
    <div class="apod-card">
      ${media}
      <div class="apod-body">
        <div class="apod-title">
          ${entrada.title}
          ${entrada.id ? `<span class="fruit-id">#${entrada.id}</span>` : ''}
        </div>
        <div class="apod-date">
          📅 ${entrada.date}${entrada.copyright ? ` · © ${entrada.copyright}` : ''}
        </div>
        <p class="apod-explanation">${texto}</p>
        <div class="crud-actions">
          <button class="btn-edit"   data-accion="editar"   data-id="${entrada.id}">✏️ Editar</button>
          <button class="btn-delete" data-accion="eliminar" data-id="${entrada.id}">🗑️ Eliminar</button>
          ${enlaceHD}
        </div>
      </div>
    </div>`;
}

function showToast(panel: HTMLElement, mensaje: string): void {
  const anterior = panel.querySelector('.toast');
  if (anterior) anterior.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensaje;
  panel.insertBefore(toast, panel.firstChild);
  setTimeout(() => toast.remove(), 4000);
}

// ── Monta el panel ────────────────────────────────────────────────────────────
export function mountApod(contenedor: HTMLElement): void {

  contenedor.innerHTML = `
    <div class="panel">

      <!-- Botón para mostrar/ocultar formulario -->
      <button id="a-btn-toggle" class="btn-cancel" style="margin-bottom:.75rem">
        ➕ Agregar APOD local
      </button>

      <!-- Formulario: crear o editar una entrada APOD -->
      <form class="crud-form" id="a-form" style="display:none">
        <h3 id="a-titulo-form">Nuevo APOD local</h3>
        <div class="form-row">
          <input id="a-titulo-input" placeholder="Título *" required />
          <input id="a-fecha"        type="date" required />
          <select id="a-tipo">
            <option value="image">image</option>
            <option value="video">video</option>
          </select>
        </div>
        <input id="a-url" placeholder="URL de imagen *" required
          style="width:100%;padding:.4rem .75rem;margin-bottom:.5rem;
                 border:1px solid var(--border);border-radius:4px;
                 background:var(--surface);color:var(--text);font-family:var(--font-mono)" />
        <textarea id="a-explicacion" placeholder="Explicación *" required rows="3"
          style="width:100%;padding:.5rem;border-radius:4px;
                 border:1px solid var(--border);background:var(--surface);
                 color:var(--text);resize:vertical;font-family:var(--font-mono)"></textarea>
        <div class="form-actions" style="margin-top:.5rem">
          <button type="submit" id="a-btn-enviar" class="btn-post">➕ Crear</button>
          <button type="button" id="a-btn-cancelar" class="btn-cancel">✕ Cancelar</button>
        </div>
      </form>

      <!-- Barra de búsqueda -->
      <form class="search-bar" id="a-busqueda">
        <input id="a-query" placeholder="Buscar por ID o título" />
        <button type="submit" class="btn-search">🔍 Buscar</button>
        <button type="button" id="a-btn-limpiar" class="btn-cancel" style="display:none">✕</button>
      </form>

      <!-- Botones de carga -->
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem">
        <button id="a-btn-hoy"   class="btn-fetch anime">🌌 GET foto del día</button>
        <button id="a-btn-rango" class="btn-fetch fruits">📅 GET últimas 10 fotos</button>
      </div>

      <div id="a-fuente" class="source-tag" style="display:none"></div>

      <!-- Área de resultados -->
      <div id="a-individual"></div>
      <div id="a-grilla"    class="apod-grid"></div>

    </div>`;

  const panel      = contenedor.querySelector<HTMLElement>('.panel')!;
  const areaUnica  = contenedor.querySelector<HTMLElement>('#a-individual')!;
  const areaGrilla = contenedor.querySelector<HTMLElement>('#a-grilla')!;
  const fuente     = contenedor.querySelector<HTMLElement>('#a-fuente')!;
  const formulario = contenedor.querySelector<HTMLFormElement>('#a-form')!;

  // Estado local
  let entradas: ApodEntry[]     = [];
  let seleccionado: ApodEntry | null = null;
  let editandoId: number | null      = null;
  let formularioVisible              = false;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function mostrarFuente(source: string): void {
    fuente.style.display = '';
    fuente.innerHTML = `source: <strong>${source}</strong>`;
  }

  function renderizarResultados(): void {
    areaUnica.innerHTML  = seleccionado ? tarjetaApodHTML(seleccionado) : '';
    areaGrilla.innerHTML = entradas.length > 0
      ? entradas.map(tarjetaApodHTML).join('')
      : '';
  }

  function setLoading(cargando: boolean): void {
    const btnHoy   = contenedor.querySelector<HTMLButtonElement>('#a-btn-hoy')!;
    const btnRango = contenedor.querySelector<HTMLButtonElement>('#a-btn-rango')!;
    btnHoy.disabled   = cargando;
    btnRango.disabled = cargando;
    if (cargando) {
      btnHoy.textContent   = 'Cargando...';
      btnRango.textContent = 'Cargando...';
    } else {
      btnHoy.textContent   = '🌌 GET foto del día';
      btnRango.textContent = '📅 GET últimas 10 fotos';
    }
  }

  function abrirFormulario(entrada?: ApodEntry): void {
    formularioVisible = true;
    formulario.style.display = '';
    (contenedor.querySelector('#a-btn-toggle')!).textContent = '✕ Cerrar formulario';
    if (entrada) {
      (contenedor.querySelector<HTMLInputElement>('#a-titulo-input')!).value   = entrada.title;
      (contenedor.querySelector<HTMLInputElement>('#a-fecha')!).value          = entrada.date;
      (contenedor.querySelector<HTMLSelectElement>('#a-tipo')!).value          = entrada.media_type;
      (contenedor.querySelector<HTMLInputElement>('#a-url')!).value            = entrada.url;
      (contenedor.querySelector<HTMLTextAreaElement>('#a-explicacion')!).value = entrada.explanation;
      (contenedor.querySelector('#a-titulo-form')!).textContent  = `Editando APOD #${entrada.id}`;
      (contenedor.querySelector<HTMLButtonElement>('#a-btn-enviar')!).textContent = '💾 Guardar';
    }
  }

  function cerrarFormulario(): void {
    formularioVisible = false;
    formulario.style.display = 'none';
    formulario.reset();
    editandoId = null;
    (contenedor.querySelector('#a-btn-toggle')!).textContent       = '➕ Agregar APOD local';
    (contenedor.querySelector('#a-titulo-form')!).textContent      = 'Nuevo APOD local';
    (contenedor.querySelector<HTMLButtonElement>('#a-btn-enviar')!).textContent = '➕ Crear';
  }

  // 4. Eventos

  // Toggle formulario
  contenedor.querySelector('#a-btn-toggle')!.addEventListener('click', () => {
    if (formularioVisible) cerrarFormulario(); else abrirFormulario();
  });
  contenedor.querySelector('#a-btn-cancelar')!.addEventListener('click', cerrarFormulario);

  // Enviar formulario (crear o editar)
  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cuerpo = {
      title:       (contenedor.querySelector<HTMLInputElement>('#a-titulo-input')!).value,
      date:        (contenedor.querySelector<HTMLInputElement>('#a-fecha')!).value,
      media_type:  (contenedor.querySelector<HTMLSelectElement>('#a-tipo')!).value as 'image' | 'video',
      url:         (contenedor.querySelector<HTMLInputElement>('#a-url')!).value,
      explanation: (contenedor.querySelector<HTMLTextAreaElement>('#a-explicacion')!).value,
    };

    try {
      if (editandoId !== null) {
        const res  = await fetch(`${API_URL}/api/apod/${editandoId}`, { method: 'PUT', headers: HEADERS, body: JSON.stringify(cuerpo) });
        const json = await res.json() as ApiResponse<ApodEntry>;
        showToast(panel, json.data ? `✅ APOD #${editandoId} actualizado` : `❌ ${String(json.error)}`);
        if (json.data) {
          if (seleccionado?.id === editandoId) seleccionado = json.data;
          entradas = entradas.map((en) => en.id === editandoId ? json.data! : en);
          renderizarResultados();
        }
      } else {
        const res  = await fetch(`${API_URL}/api/apod`, { method: 'POST', headers: HEADERS, body: JSON.stringify(cuerpo) });
        const json = await res.json() as ApiResponse<ApodEntry>;
        showToast(panel, json.data
          ? `✅ APOD "${json.data.title}" creado (ID ${json.data.id})`
          : `❌ ${String(json.error)}`);
      }
    } catch {
      showToast(panel, '❌ Error de red');
    }

    cerrarFormulario();
  });

  // GET foto del día
  contenedor.querySelector('#a-btn-hoy')!.addEventListener('click', async () => {
    setLoading(true);
    entradas = []; seleccionado = null;
    try {
      const res  = await fetch(`${API_URL}/api/apod`, { headers: HEADERS });
      const json = await res.json() as ApiResponse<ApodEntry>;
      if (json.data) { seleccionado = json.data; mostrarFuente(json.source); }
      else showToast(panel, '❌ No se pudo obtener la foto del día');
    } catch { showToast(panel, '❌ Error de red'); }
    setLoading(false);
    renderizarResultados();
  });

  // GET rango de 10 días
  contenedor.querySelector('#a-btn-rango')!.addEventListener('click', async () => {
    setLoading(true);
    seleccionado = null;
    try {
      const res  = await fetch(`${API_URL}/api/apod/range`, { headers: HEADERS });
      const json = await res.json() as ApiResponse<ApodEntry[]>;
      if (Array.isArray(json.data)) { entradas = json.data; mostrarFuente(json.source); }
      else showToast(panel, '❌ No se pudo obtener el rango');
    } catch { showToast(panel, '❌ Error de red'); }
    setLoading(false);
    renderizarResultados();
  });

  // Mostrar/ocultar limpiar
  contenedor.querySelector<HTMLInputElement>('#a-query')!.addEventListener('input', function () {
    (contenedor.querySelector<HTMLButtonElement>('#a-btn-limpiar')!).style.display =
      this.value ? '' : 'none';
  });

  // Limpiar búsqueda
  contenedor.querySelector('#a-btn-limpiar')!.addEventListener('click', () => {
    (contenedor.querySelector<HTMLInputElement>('#a-query')!).value = '';
    (contenedor.querySelector<HTMLButtonElement>('#a-btn-limpiar')!).style.display = 'none';
    seleccionado = null; entradas = [];
    renderizarResultados();
  });

  // Buscar por ID o título
  contenedor.querySelector('#a-busqueda')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const termino = (contenedor.querySelector<HTMLInputElement>('#a-query')!).value.trim();
    if (!termino) return;

    const porId = parseInt(termino, 10);
    if (!isNaN(porId)) {
      setLoading(true);
      try {
        const res  = await fetch(`${API_URL}/api/apod/${porId}`, { headers: HEADERS });
        const json = await res.json() as ApiResponse<ApodEntry>;
        if (json.data) { seleccionado = json.data; entradas = []; mostrarFuente(json.source); }
        else showToast(panel, `❌ APOD #${porId} no encontrado`);
      } catch { showToast(panel, '❌ Error de red'); }
      setLoading(false);
    } else {
      if (entradas.length === 0) {
        const res  = await fetch(`${API_URL}/api/apod/range`, { headers: HEADERS });
        const json = await res.json() as ApiResponse<ApodEntry[]>;
        entradas = Array.isArray(json.data) ? json.data : [];
      }
      entradas = entradas.filter((en) =>
        en.title.toLowerCase().includes(termino.toLowerCase())
      );
    }
    renderizarResultados();
  });

  // Delegación: editar / eliminar (en ambas áreas)
  function escucharAcciones(area: HTMLElement): void {
    area.addEventListener('click', async (e) => {
      const boton = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-accion]');
      if (!boton) return;

      const id     = Number(boton.dataset['id']);
      const accion = boton.dataset['accion'];

      if (accion === 'editar') {
        const entrada = entradas.find((en) => en.id === id) ?? seleccionado;
        if (entrada) { editandoId = id; abrirFormulario(entrada); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      }

      if (accion === 'eliminar') {
        try { await fetch(`${API_URL}/api/apod/${id}`, { method: 'DELETE', headers: HEADERS }); }
        catch { /* ignorar */ }
        showToast(panel, `🗑️ APOD #${id} eliminado`);
        if (seleccionado?.id === id) seleccionado = null;
        entradas = entradas.filter((en) => en.id !== id);
        renderizarResultados();
      }
    });
  }
  escucharAcciones(areaUnica);
  escucharAcciones(areaGrilla);
}
