# uf-frontend — TypeScript puro

Frontend del proyecto **Universal Data Fetcher**.  
Construido con **TypeScript puro** (sin frameworks ni bundlers).  
El compilador `tsc` convierte los `.ts` a `.js`, y el navegador los ejecuta directamente.

---

## Tecnologías

| Herramienta | Para qué sirve |
|---|---|
| TypeScript | Tipado estático y compilación a JavaScript |
| `tsc` | Compilador oficial de TypeScript |
| DOM API | Manipulación del HTML desde TypeScript |
| `fetch` | Peticiones HTTP al backend |

> No se usa React, Vite ni ningún otro framework o bundler.
> El objetivo es aprender TypeScript puro.

---

## Estructura del proyecto (capas)

```
uf-frontend/
├── index.html              ← Punto de entrada: carga el CSS y dist/main.js
├── dist/                   ← JavaScript compilado (generado por tsc, no editar)
└── src/
    ├── config.ts           ← CAPA DE CONFIGURACIÓN: URL del backend
    ├── types/
    │   └── index.ts        ← CAPA DE TIPOS: interfaces de los datos
    ├── services/
    │   └── apiService.ts   ← CAPA DE SERVICIOS: toda la comunicación HTTP
    ├── components/
    │   ├── apod.ts         ← CAPA DE UI: panel de NASA APOD
    │   ├── users.ts        ← CAPA DE UI: panel de usuarios
    │   └── fruits.ts       ← CAPA DE UI: panel de frutas
    ├── styles/
    │   └── main.css        ← Estilos globales
    └── main.ts             ← PUNTO DE ENTRADA: inicializa la app y los tabs
```

### ¿Por qué esta estructura?

Cada carpeta tiene **una sola responsabilidad**:

- **`config.ts`** — un solo lugar donde cambiar la URL del backend.
- **`types/`** — define cómo lucen los datos (qué campos tiene una `Fruit`, un `RandomUser`, etc.).
- **`services/`** — el único lugar donde se hace `fetch`. Los componentes no llaman a la API directamente.
- **`components/`** — cada archivo monta un panel en el DOM y maneja los eventos del usuario.
- **`main.ts`** — une todo: construye el HTML base, verifica la conexión y cambia de tab.

---

## Flujo de datos

```
Usuario hace clic
      │
      ▼
components/fruits.ts   (capa UI)
      │  llama a
      ▼
services/apiService.ts  (capa de servicios)
      │  hace fetch a
      ▼
http://localhost:3000/api/fruits   (backend Next.js)
      │  devuelve ApiResponse<Fruit[]>
      ▼
components/fruits.ts   (renderiza el resultado en el DOM)
```

---

## Instalación y ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Compilar TypeScript en modo watch

```bash
npm run dev
```

Este comando ejecuta `tsc --watch`. Cada vez que guardes un archivo `.ts`,
TypeScript lo recompila automáticamente a `dist/`.

### 3. Abrir en el navegador

Abre `index.html` con la extensión **Live Server** de VS Code:

- Clic derecho sobre `index.html` → **"Open with Live Server"**

O sin extensiones:

```bash
npx serve .
```

> **Importante:** abre siempre desde un servidor HTTP, no haciendo doble clic
> en el archivo. Los `import` de ES modules no funcionan con el protocolo
> `file://`.

---

## Cambiar la URL del backend

Si el backend corre en otro host o puerto (por ejemplo con ngrok), edita el
archivo `src/config.ts`:

```ts
// src/config.ts
export const API_URL = 'https://TU-URL.ngrok-free.app';
```

Después de guardar, `tsc --watch` recompilará automáticamente.

---

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Compila en modo watch (recarga al guardar) |
| `npm run build` | Compilación única a `dist/` |
