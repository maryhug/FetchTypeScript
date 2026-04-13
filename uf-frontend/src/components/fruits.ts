// ============================================================
// Capa de UI — FruitsPanel
//
// Responsabilidad: renderizar el panel de frutas y manejar
// los eventos del usuario (crear, editar, borrar, buscar).
// Para los datos llama a ApiService (capa de servicios).
// ============================================================

import type { Fruit } from '../types/index.js';
import { ApiService } from '../services/apiService.js';

// Instancia del servicio para este recurso
const svc = new ApiService<Fruit>('/api/fruits');

// ── Función auxiliar: mostrar notificación temporal ───────────────────────────
function showToast(panel: HTMLElement, mensaje: string): void {
  const anterior = panel.querySelector('.toast');
  if (anterior) anterior.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensaje;
  panel.insertBefore(toast, panel.firstChild);

  setTimeout(() => toast.remove(), 3000);
}

// ── Función auxiliar: renderizar la grilla de frutas ─────────────────────────
function renderizarGrilla(grilla: HTMLElement, frutas: Fruit[]): void {
  if (frutas.length === 0) {
    grilla.innerHTML = '';
    return;
  }

  grilla.innerHTML = frutas.map((f) => `
    <div class="fruit-card">
      <div class="fruit-name">${f.name} <span class="fruit-id">#${f.id}</span></div>
      <div class="fruit-family">${f.family}</div>
      <div class="nutr-row">
        <span class="nutr-label">Calorías</span>
        <span class="nutr-value">${f.nutritions.calories} kcal</span>
      </div>
      <div class="nutr-row">
        <span class="nutr-label">Azúcar</span>
        <span class="nutr-value">${f.nutritions.sugar}g</span>
      </div>
      <div class="nutr-row">
        <span class="nutr-label">Carbohidratos</span>
        <span class="nutr-value">${f.nutritions.carbohydrates}g</span>
      </div>
      <div class="nutr-row">
        <span class="nutr-label">Proteína</span>
        <span class="nutr-value">${f.nutritions.protein}g</span>
      </div>
      <div class="crud-actions">
        <button class="btn-edit"   data-accion="editar"   data-id="${f.id}">✏️ Editar</button>
        <button class="btn-delete" data-accion="eliminar" data-id="${f.id}">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');
}

// ── Función principal: monta el panel en el contenedor dado ──────────────────
export function mountFruits(contenedor: HTMLElement): void {

  // 1. Insertar el HTML del panel
  contenedor.innerHTML = `
    <div class="panel">

      <!-- Formulario: crear o editar una fruta -->
      <form class="crud-form" id="f-form">
        <h3 id="f-titulo-form">Agregar fruta</h3>
        <div class="form-row">
          <input id="f-nombre"  placeholder="Nombre *"  required />
          <input id="f-familia" placeholder="Familia *" required />
          <input id="f-orden"   placeholder="Orden" />
          <input id="f-genero"  placeholder="Género" />
        </div>
        <div class="form-row">
          <input id="f-cal"     type="number" placeholder="Calorías"      value="0" />
          <input id="f-grasa"   type="number" placeholder="Grasa"         value="0" />
          <input id="f-azucar"  type="number" placeholder="Azúcar"        value="0" />
          <input id="f-carbs"   type="number" placeholder="Carbohidratos" value="0" />
          <input id="f-prot"    type="number" placeholder="Proteína"      value="0" />
        </div>
        <div class="form-actions">
          <button type="submit" id="f-btn-enviar" class="btn-post">➕ Crear</button>
          <button type="button" id="f-btn-cancelar" class="btn-cancel" style="display:none">
            ✕ Cancelar
          </button>
        </div>
      </form>

      <!-- Barra de búsqueda -->
      <form class="search-bar" id="f-busqueda">
        <input id="f-query" placeholder="Buscar por ID (ej: 3) o nombre (ej: Mango)" />
        <button type="submit" class="btn-search">🔍 Buscar</button>
        <button type="button" id="f-btn-limpiar" class="btn-cancel" style="display:none">
          ✕ Limpiar
        </button>
      </form>

      <!-- Botón GET -->
      <button id="f-btn-obtener" class="btn-fetch fruits">▶ GET /api/fruits</button>

      <!-- Fuente de los datos -->
      <div id="f-fuente" class="source-tag" style="display:none"></div>

      <!-- Grilla de resultados -->
      <div id="f-grilla" class="fruits-grid"></div>

    </div>`;

  // 2. Referencias a elementos del DOM
  const panel   = contenedor.querySelector<HTMLElement>('.panel')!;
  const grilla  = contenedor.querySelector<HTMLElement>('#f-grilla')!;
  const fuente  = contenedor.querySelector<HTMLElement>('#f-fuente')!;

  // 3. Estado local del componente
  let frutas: Fruit[]       = [];
  let editandoId: number | null = null;

  // ── Helpers internos ───────────────────────────────────────────────────────

  function mostrarFuente(source: string): void {
    fuente.style.display = '';
    fuente.innerHTML = `source: <strong>${source}</strong>`;
  }

  function actualizarFormulario(): void {
    const titulo   = contenedor.querySelector<HTMLElement>('#f-titulo-form')!;
    const btnEnviar  = contenedor.querySelector<HTMLButtonElement>('#f-btn-enviar')!;
    const btnCancelar = contenedor.querySelector<HTMLButtonElement>('#f-btn-cancelar')!;

    if (editandoId !== null) {
      titulo.textContent    = `Editando fruta #${editandoId}`;
      btnEnviar.textContent = '💾 Guardar cambios';
      btnCancelar.style.display = '';
    } else {
      titulo.textContent    = 'Agregar fruta';
      btnEnviar.textContent = '➕ Crear';
      btnCancelar.style.display = 'none';
    }
  }

  function rellenarFormulario(fruta: Fruit): void {
    (contenedor.querySelector<HTMLInputElement>('#f-nombre')!).value  = fruta.name;
    (contenedor.querySelector<HTMLInputElement>('#f-familia')!).value = fruta.family;
    (contenedor.querySelector<HTMLInputElement>('#f-orden')!).value   = fruta.order;
    (contenedor.querySelector<HTMLInputElement>('#f-genero')!).value  = fruta.genus;
    (contenedor.querySelector<HTMLInputElement>('#f-cal')!).value     = String(fruta.nutritions.calories);
    (contenedor.querySelector<HTMLInputElement>('#f-grasa')!).value   = String(fruta.nutritions.fat);
    (contenedor.querySelector<HTMLInputElement>('#f-azucar')!).value  = String(fruta.nutritions.sugar);
    (contenedor.querySelector<HTMLInputElement>('#f-carbs')!).value   = String(fruta.nutritions.carbohydrates);
    (contenedor.querySelector<HTMLInputElement>('#f-prot')!).value    = String(fruta.nutritions.protein);
  }

  function limpiarFormulario(): void {
    (contenedor.querySelector<HTMLFormElement>('#f-form')!).reset();
    editandoId = null;
    actualizarFormulario();
  }

  // ── Cargar todas las frutas ────────────────────────────────────────────────
  async function cargarFrutas(): Promise<void> {
    const btn = contenedor.querySelector<HTMLButtonElement>('#f-btn-obtener')!;
    btn.disabled = true;
    btn.textContent = 'Cargando...';

    const resultado = await svc.getAll();

    btn.disabled = false;
    btn.textContent = '▶ GET /api/fruits';

    if (resultado.data) {
      frutas = resultado.data;
      mostrarFuente(resultado.source);
      renderizarGrilla(grilla, frutas);
    } else {
      showToast(panel, `❌ ${resultado.error ?? 'Error desconocido'}`);
    }
  }

  // 4. Eventos

  // Botón GET
  contenedor.querySelector('#f-btn-obtener')!
    .addEventListener('click', () => cargarFrutas());

  // Enviar formulario (crear o actualizar)
  contenedor.querySelector('#f-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cuerpo = {
      name:   (contenedor.querySelector<HTMLInputElement>('#f-nombre')!).value,
      family: (contenedor.querySelector<HTMLInputElement>('#f-familia')!).value,
      order:  (contenedor.querySelector<HTMLInputElement>('#f-orden')!).value,
      genus:  (contenedor.querySelector<HTMLInputElement>('#f-genero')!).value,
      nutritions: {
        calories:      Number((contenedor.querySelector<HTMLInputElement>('#f-cal')!).value),
        fat:           Number((contenedor.querySelector<HTMLInputElement>('#f-grasa')!).value),
        sugar:         Number((contenedor.querySelector<HTMLInputElement>('#f-azucar')!).value),
        carbohydrates: Number((contenedor.querySelector<HTMLInputElement>('#f-carbs')!).value),
        protein:       Number((contenedor.querySelector<HTMLInputElement>('#f-prot')!).value),
      },
    };

    if (editandoId !== null) {
      const res = await svc.update(editandoId, cuerpo);
      showToast(panel, res.data
        ? `✅ Fruta #${editandoId} actualizada`
        : `❌ ${String(res.error)}`);
    } else {
      const res = await svc.create(cuerpo);
      showToast(panel, res.data
        ? `✅ "${res.data.name}" creada (ID ${res.data.id})`
        : `❌ ${String(res.error)}`);
    }

    limpiarFormulario();
    await cargarFrutas();
  });

  // Cancelar edición
  contenedor.querySelector('#f-btn-cancelar')!
    .addEventListener('click', limpiarFormulario);

  // Mostrar/ocultar botón limpiar en búsqueda
  contenedor.querySelector<HTMLInputElement>('#f-query')!.addEventListener('input', function () {
    (contenedor.querySelector<HTMLButtonElement>('#f-btn-limpiar')!).style.display =
      this.value ? '' : 'none';
  });

  // Limpiar búsqueda
  contenedor.querySelector('#f-btn-limpiar')!.addEventListener('click', async () => {
    (contenedor.querySelector<HTMLInputElement>('#f-query')!).value = '';
    (contenedor.querySelector<HTMLButtonElement>('#f-btn-limpiar')!).style.display = 'none';
    await cargarFrutas();
  });

  // Buscar por ID o nombre
  contenedor.querySelector('#f-busqueda')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const termino = (contenedor.querySelector<HTMLInputElement>('#f-query')!).value.trim();
    if (!termino) return;

    const porId = parseInt(termino, 10);

    if (!isNaN(porId)) {
      // Buscar una sola fruta por ID
      const res = await svc.getOne(porId);
      if (res.data) {
        frutas = [res.data];
        mostrarFuente(res.source);
        renderizarGrilla(grilla, frutas);
      } else {
        showToast(panel, `❌ Fruta con ID ${porId} no encontrada`);
      }
    } else {
      // Filtrar por nombre en los resultados ya cargados
      await cargarFrutas();
      frutas = frutas.filter((f) =>
        f.name.toLowerCase().includes(termino.toLowerCase()) ||
        f.family.toLowerCase().includes(termino.toLowerCase())
      );
      renderizarGrilla(grilla, frutas);
    }
  });

  // Editar / Eliminar (delegación de eventos en la grilla)
  grilla.addEventListener('click', async (e) => {
    const boton = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-accion]');
    if (!boton) return;

    const id     = Number(boton.dataset['id']);
    const accion = boton.dataset['accion'];

    if (accion === 'editar') {
      const fruta = frutas.find((f) => f.id === id);
      if (!fruta) return;
      editandoId = id;
      rellenarFormulario(fruta);
      actualizarFormulario();
      contenedor.scrollIntoView({ behavior: 'smooth' });
    }

    if (accion === 'eliminar') {
      const res = await svc.delete(id);
      showToast(panel, res.error
        ? `❌ ${String(res.error)}`
        : `🗑️ Fruta #${id} eliminada`);
      await cargarFrutas();
    }
  });
}
