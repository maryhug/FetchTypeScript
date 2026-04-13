// ============================================================
// Capa de UI — UsersPanel
//
// Responsabilidad: renderizar el panel de usuarios y manejar
// los eventos (crear, editar, borrar, buscar).
// ============================================================

import type { RandomUser } from '../types/index.js';
import { ApiService } from '../services/apiService.js';
import { API_URL } from '../config.js';

const svc = new ApiService<RandomUser>('/api/users');

const HEADERS: HeadersInit = {
  'ngrok-skip-browser-warning': 'true',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// ── Normaliza un usuario crudo de la API (puede tener tipos desconocidos) ─────
function normalizarUsuario(u: Record<string, unknown>, indice: number): RandomUser {
  const nombre   = (u['name']     ?? {}) as Record<string, unknown>;
  const ubicacion = (u['location'] ?? {}) as Record<string, unknown>;
  const foto     = (u['picture']  ?? {}) as Record<string, unknown>;

  return {
    id:    typeof u['id'] === 'number' ? u['id'] : indice + 1,
    name:  {
      title: String(nombre['title'] ?? ''),
      first: String(nombre['first'] ?? ''),
      last:  String(nombre['last']  ?? ''),
    },
    email:    String(u['email'] ?? ''),
    phone:    String(u['phone'] ?? ''),
    nat:      String(u['nat']   ?? ''),
    location: {
      country: String(ubicacion['country'] ?? ''),
      city:    String(ubicacion['city']    ?? ''),
    },
    picture: {
      large:     String(foto['large']     ?? ''),
      medium:    String(foto['medium']    ?? ''),
      thumbnail: String(foto['thumbnail'] ?? ''),
    },
  };
}

// ── Renderiza la grilla de usuarios ──────────────────────────────────────────
function renderizarGrilla(grilla: HTMLElement, usuarios: RandomUser[]): void {
  if (usuarios.length === 0) { grilla.innerHTML = ''; return; }

  grilla.innerHTML = usuarios.map((u) => `
    <div class="user-card">
      ${u.picture.medium
        ? `<img src="${u.picture.medium}" alt="${u.name.first}" class="user-avatar" />`
        : ''}
      <div style="flex:1;min-width:0">
        <div class="user-name">
          ${u.name.first} ${u.name.last}
          <span class="fruit-id">#${u.id}</span>
        </div>
        <div class="user-detail">${u.email}</div>
        <div class="user-detail">${u.phone}</div>
        <div class="user-location">
          📍 ${[u.location.city, u.location.country].filter(Boolean).join(', ')}
        </div>
        <div class="crud-actions">
          <button class="btn-edit"   data-accion="editar"   data-id="${u.id}">✏️ Editar</button>
          <button class="btn-delete" data-accion="eliminar" data-id="${u.id}">🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function showToast(panel: HTMLElement, mensaje: string): void {
  const anterior = panel.querySelector('.toast');
  if (anterior) anterior.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensaje;
  panel.insertBefore(toast, panel.firstChild);
  setTimeout(() => toast.remove(), 3000);
}

// ── Monta el panel en el contenedor dado ──────────────────────────────────────
export function mountUsers(contenedor: HTMLElement): void {

  contenedor.innerHTML = `
    <div class="panel">

      <!-- Formulario: crear o editar un usuario -->
      <form class="crud-form" id="u-form">
        <h3 id="u-titulo-form">Agregar usuario</h3>
        <div class="form-row">
          <select id="u-titulo">
            <option value="Mr">Mr</option>
            <option value="Ms">Ms</option>
            <option value="Mrs">Mrs</option>
            <option value="Dr">Dr</option>
          </select>
          <input id="u-nombre"   placeholder="Nombre *"  required />
          <input id="u-apellido" placeholder="Apellido" />
          <input id="u-email"    placeholder="Email *"   required type="email" />
        </div>
        <div class="form-row">
          <input id="u-telefono" placeholder="Teléfono" />
          <input id="u-pais"     placeholder="País" />
          <input id="u-ciudad"   placeholder="Ciudad" />
          <input id="u-nat"      placeholder="Nat (CO)" />
        </div>
        <div class="form-actions">
          <button type="submit" id="u-btn-enviar"   class="btn-post">➕ Crear</button>
          <button type="button" id="u-btn-cancelar" class="btn-cancel" style="display:none">
            ✕ Cancelar
          </button>
        </div>
      </form>

      <!-- Barra de búsqueda -->
      <form class="search-bar" id="u-busqueda">
        <input id="u-query" placeholder="Buscar por ID o nombre/email" />
        <button type="submit" class="btn-search">🔍 Buscar</button>
        <button type="button" id="u-btn-limpiar" class="btn-cancel" style="display:none">
          ✕ Limpiar
        </button>
      </form>

      <button id="u-btn-obtener" class="btn-fetch users">▶ GET /api/users</button>

      <div id="u-fuente" class="source-tag" style="display:none"></div>
      <div id="u-grilla" class="users-grid"></div>

    </div>`;

  const panel   = contenedor.querySelector<HTMLElement>('.panel')!;
  const grilla  = contenedor.querySelector<HTMLElement>('#u-grilla')!;
  const fuente  = contenedor.querySelector<HTMLElement>('#u-fuente')!;

  let usuarios: RandomUser[]    = [];
  let editandoId: number | null = null;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function mostrarFuente(source: string): void {
    fuente.style.display = '';
    fuente.innerHTML = `source: <strong>${source}</strong>`;
  }

  function actualizarFormulario(): void {
    const titulo      = contenedor.querySelector<HTMLElement>('#u-titulo-form')!;
    const btnEnviar   = contenedor.querySelector<HTMLButtonElement>('#u-btn-enviar')!;
    const btnCancelar = contenedor.querySelector<HTMLButtonElement>('#u-btn-cancelar')!;

    if (editandoId !== null) {
      titulo.textContent        = `Editando usuario #${editandoId}`;
      btnEnviar.textContent     = '💾 Guardar cambios';
      btnCancelar.style.display = '';
    } else {
      titulo.textContent        = 'Agregar usuario';
      btnEnviar.textContent     = '➕ Crear';
      btnCancelar.style.display = 'none';
    }
  }

  function rellenarFormulario(u: RandomUser): void {
    (contenedor.querySelector<HTMLSelectElement>('#u-titulo')!).value   = u.name.title;
    (contenedor.querySelector<HTMLInputElement>('#u-nombre')!).value    = u.name.first;
    (contenedor.querySelector<HTMLInputElement>('#u-apellido')!).value  = u.name.last;
    (contenedor.querySelector<HTMLInputElement>('#u-email')!).value     = u.email;
    (contenedor.querySelector<HTMLInputElement>('#u-telefono')!).value  = u.phone;
    (contenedor.querySelector<HTMLInputElement>('#u-pais')!).value      = u.location.country;
    (contenedor.querySelector<HTMLInputElement>('#u-ciudad')!).value    = u.location.city;
    (contenedor.querySelector<HTMLInputElement>('#u-nat')!).value       = u.nat;
  }

  function limpiarFormulario(): void {
    (contenedor.querySelector<HTMLFormElement>('#u-form')!).reset();
    editandoId = null;
    actualizarFormulario();
  }

  // ── Cargar todos los usuarios ─────────────────────────────────────────────
  async function cargarUsuarios(): Promise<void> {
    const btn = contenedor.querySelector<HTMLButtonElement>('#u-btn-obtener')!;
    btn.disabled = true;
    btn.textContent = 'Cargando...';

    try {
      const res  = await fetch(`${API_URL}/api/users`, { headers: HEADERS });
      const json = await res.json() as { data?: { results?: unknown[] }; source?: string };

      const lista = json?.data?.results;
      if (!Array.isArray(lista)) {
        showToast(panel, '❌ Respuesta inesperada del servidor');
        return;
      }

      usuarios = (lista as Record<string, unknown>[]).map(normalizarUsuario);
      mostrarFuente(json.source ?? 'api');
      renderizarGrilla(grilla, usuarios);
    } catch (err) {
      showToast(panel, `❌ ${err instanceof Error ? err.message : 'Error de red'}`);
    } finally {
      btn.disabled = false;
      btn.textContent = '▶ GET /api/users';
    }
  }

  // 4. Eventos

  contenedor.querySelector('#u-btn-obtener')!
    .addEventListener('click', () => cargarUsuarios());

  // Enviar formulario
  contenedor.querySelector('#u-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cuerpo = {
      name: {
        title: (contenedor.querySelector<HTMLSelectElement>('#u-titulo')!).value,
        first: (contenedor.querySelector<HTMLInputElement>('#u-nombre')!).value,
        last:  (contenedor.querySelector<HTMLInputElement>('#u-apellido')!).value,
      },
      email:    (contenedor.querySelector<HTMLInputElement>('#u-email')!).value,
      phone:    (contenedor.querySelector<HTMLInputElement>('#u-telefono')!).value,
      location: {
        country: (contenedor.querySelector<HTMLInputElement>('#u-pais')!).value,
        city:    (contenedor.querySelector<HTMLInputElement>('#u-ciudad')!).value,
      },
      picture: { large: '', medium: '', thumbnail: '' },
      nat:     (contenedor.querySelector<HTMLInputElement>('#u-nat')!).value,
    };

    if (editandoId !== null) {
      const res = await svc.update(editandoId, cuerpo);
      showToast(panel, res.data
        ? `✅ Usuario #${editandoId} actualizado`
        : `❌ ${String(res.error)}`);
    } else {
      const res = await svc.create(cuerpo);
      showToast(panel, res.data
        ? `✅ Usuario creado (ID ${res.data.id})`
        : `❌ ${String(res.error)}`);
    }

    limpiarFormulario();
    await cargarUsuarios();
  });

  contenedor.querySelector('#u-btn-cancelar')!
    .addEventListener('click', limpiarFormulario);

  contenedor.querySelector<HTMLInputElement>('#u-query')!.addEventListener('input', function () {
    (contenedor.querySelector<HTMLButtonElement>('#u-btn-limpiar')!).style.display =
      this.value ? '' : 'none';
  });

  contenedor.querySelector('#u-btn-limpiar')!.addEventListener('click', async () => {
    (contenedor.querySelector<HTMLInputElement>('#u-query')!).value = '';
    (contenedor.querySelector<HTMLButtonElement>('#u-btn-limpiar')!).style.display = 'none';
    await cargarUsuarios();
  });

  contenedor.querySelector('#u-busqueda')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const termino = (contenedor.querySelector<HTMLInputElement>('#u-query')!).value.trim();
    if (!termino) return;

    const porId = parseInt(termino, 10);
    if (!isNaN(porId)) {
      const res = await svc.getOne(porId);
      if (res.data) {
        usuarios = [res.data];
        mostrarFuente(res.source);
        renderizarGrilla(grilla, usuarios);
      } else {
        showToast(panel, `❌ Usuario #${porId} no encontrado`);
      }
    } else {
      await cargarUsuarios();
      usuarios = usuarios.filter((u) => {
        const nombreCompleto = `${u.name.first} ${u.name.last}`.toLowerCase();
        return (
          nombreCompleto.includes(termino.toLowerCase()) ||
          u.email.toLowerCase().includes(termino.toLowerCase())
        );
      });
      renderizarGrilla(grilla, usuarios);
    }
  });

  // Delegación: editar / eliminar
  grilla.addEventListener('click', async (e) => {
    const boton = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-accion]');
    if (!boton) return;

    const id     = Number(boton.dataset['id']);
    const accion = boton.dataset['accion'];

    if (accion === 'editar') {
      const usuario = usuarios.find((u) => u.id === id);
      if (!usuario) return;
      editandoId = id;
      rellenarFormulario(usuario);
      actualizarFormulario();
      contenedor.scrollIntoView({ behavior: 'smooth' });
    }

    if (accion === 'eliminar') {
      await svc.delete(id);
      showToast(panel, `🗑️ Usuario #${id} eliminado`);
      await cargarUsuarios();
    }
  });
}
