# Universal Data Fetcher — Documentación de Arquitectura

## Descripción general

**Universal Data Fetcher (UDF)** es una aplicación fullstack de aprendizaje que demuestra cómo consumir múltiples APIs externas, persistir datos localmente en JSON, y exponer una API REST propia con operaciones CRUD completas.

| Capa | Tecnología | Puerto |
|------|-----------|--------|
| Frontend | TypeScript puro (tsc + DOM vanilla) | 5173 o Live Server |
| Backend  | Next.js 14 + TypeScript (API Routes) | 3000 |
| Almacenamiento | Archivos JSON en disco | — |

---

## Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                          NAVEGADOR                                  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           TypeScript puro  (tsc → dist/)                     │   │
│  │                                                              │   │
│  │   index.html                                                 │   │
│  │      └── main.ts  ──── tab: apod / users / fruits            │   │
│  │              │                                               │   │
│  │    ┌─────────┼─────────────┐                                 │   │
│  │    │         │             │                                 │   │
│  │  apod.ts  users.ts  fruits.ts                                │   │
│  │    │         │             │                                 │   │
│  │    └─────────┴──────┬──────┘                                 │   │
│  │                     │                                        │   │
│  │              apiService.ts                                   │   │
│  │         (ApiService<T> + fetchData)                          │   │
│  └─────────────────────┼────────────────────────────────────────┘   │
│                         │  HTTP fetch (VITE_API_URL → :3000)        │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
          ┌───────────────▼──────────────────────────────┐
          │         Next.js 14 API Routes  (:3000)        │
          │                                               │
          │  /api/health          GET → status check      │
          │  /api/apod            ─────────────┐          │
          │  /api/apod/range      ─────────────┤ route.ts │
          │  /api/apod/[id]       ─────────────┘          │
          │  /api/users           ─────────────┐          │
          │  /api/users/[id]      ─────────────┤ route.ts │
          │  /api/fruits          ─────────────┐          │
          │  /api/fruits/[id]     ─────────────┘ route.ts │
          │                                               │
          │         src/services/fetchData.ts             │
          │         (fetch nativo Node.js 18+)            │
          │                                               │
          │   ┌────────────────────────────────┐          │
          │   │         Repositories           │          │
          │   │  BaseRepository<T>             │          │
          │   │  JsonRepository<T>             │          │
          │   │  FruitsRepository              │          │
          │   │  UsersRepository               │          │
          │   └────┬───────────────────────────┘          │
          │        │                                      │
          │   src/data/*.json                             │
          │   ├── apod.json                               │
          │   ├── fruits.json                             │
          │   └── users.json                             │
          └──────────────────────────────────────────────┘
                          │
          ┌───────────────▼──────────────────────────────┐
          │            APIs Externas                      │
          │                                               │
          │  NASA APOD API                                │
          │  api.nasa.gov/planetary/apod                  │
          │                                               │
          │  FruityVice API                               │
          │  fruityvice.com/api/fruit/all                 │
          │                                               │
          │  RandomUser API                               │
          │  randomuser.me/api/?results=6                 │
          └──────────────────────────────────────────────┘
```

---

## Flujo principal: API-first con fallback local

Todos los endpoints GET siguen el mismo patrón:

```
Cliente
  │
  ▼
Route Handler (Next.js)
  │
  ├──► fetchData(url_externa)
  │         │
  │    ¿Respuesta OK?
  │    YES ──► merge con datos locales (si aplica) ──► NextResponse.json({ source: "api" })
  │    NO  ──► repo.readAll() ──────────────────────► NextResponse.json({ source: "fallback" })
  │
  └── POST / PUT / DELETE ──► repo.create/update/delete() ──► JSON en disco
```

---

## Estructura de directorios

```
FetchTypeScript/
├── uf-backend/                        ← Next.js 14 (API Routes)
│   ├── app/
│   │   ├── layout.tsx                 ← Layout mínimo
│   │   ├── page.tsx                   ← Listado de endpoints
│   │   └── api/
│   │       ├── health/route.ts
│   │       ├── apod/
│   │       │   ├── route.ts           ← GET (hoy) + POST
│   │       │   ├── range/route.ts     ← GET (últimas 10)
│   │       │   └── [id]/route.ts      ← GET + PUT + DELETE
│   │       ├── users/
│   │       │   ├── route.ts           ← GET (6 random) + POST
│   │       │   └── [id]/route.ts      ← GET + PUT + DELETE
│   │       └── fruits/
│   │           ├── route.ts           ← GET (merge API+local) + POST
│   │           └── [id]/route.ts      ← GET + PUT + DELETE
│   ├── middleware.ts                  ← CORS para todas las rutas /api
│   ├── next.config.js
│   └── src/
│       ├── repositories/
│       │   ├── base.repository.ts     ← CRUD genérico (process.cwd())
│       │   ├── JsonRepository.ts      ← Read/write (process.cwd())
│       │   ├── fruits.repository.ts
│       │   └── users.repository.ts
│       ├── services/
│       │   └── fetchData.ts           ← fetch nativo (sin node-fetch)
│       ├── data/
│       │   ├── apod.json
│       │   ├── fruits.json
│       │   └── users.json
│       └── types/
│           ├── types.ts               ← ApiResponse, Fruit, RandomUser
│           └── apod.ts                ← ApodEntry
│
└── uf-frontend/                       ← TypeScript puro (sin bundler)
    ├── index.html                     ← Carga CSS + dist/main.js
    ├── dist/                          ← JS compilado por tsc (generado)
    └── src/
        ├── config.ts                  ← API_URL (constante de configuración)
        ├── main.ts                    ← Punto de entrada: tabs + health check
        ├── types/
        │   └── index.ts               ← Interfaces: ApiResponse, Fruit, etc.
        ├── services/
        │   └── apiService.ts          ← ApiService<T>: toda la comunicación HTTP
        ├── components/
        │   ├── apod.ts                ← Panel APOD (DOM vanilla)
        │   ├── users.ts               ← Panel Usuarios (DOM vanilla)
        │   └── fruits.ts              ← Panel Frutas (DOM vanilla)
        └── styles/
            └── main.css               ← Estilos globales
```

---

## Contratos de tipos

### `ApiResponse<T>` — Envelope universal

```typescript
interface ApiResponse<T> {
  data:   T | null;
  status: number;
  error:  string | null;
  source: "api" | "fallback" | "local";
}
```

---

## Endpoints REST

### Fruits — `/api/fruits`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/fruits` | Todos (mezcla API + local) |
| GET | `/api/fruits/:id` | Por ID (API → fallback local) |
| POST | `/api/fruits` | Crea en JSON local |
| PUT | `/api/fruits/:id` | Actualiza en JSON local |
| DELETE | `/api/fruits/:id` | Elimina del JSON local |

### Users — `/api/users`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | 6 usuarios aleatorios (RandomUser API → fallback) |
| GET | `/api/users/:id` | Solo busca en JSON local |
| POST | `/api/users` | Crea en JSON local |
| PUT | `/api/users/:id` | Actualiza en JSON local |
| DELETE | `/api/users/:id` | Elimina del JSON local |

### APOD — `/api/apod`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/apod` | Foto astronómica del día (NASA → fallback) |
| GET | `/api/apod/range` | Últimas 10 fotos (NASA → fallback) |
| GET | `/api/apod/:id` | Por ID en JSON local |
| POST | `/api/apod` | Crea entrada local |
| PUT | `/api/apod/:id` | Actualiza entrada local |
| DELETE | `/api/apod/:id` | Elimina entrada local |

---

## Variables de entorno

| Variable | Dónde | Valor por defecto |
|----------|-------|-------------------|
| `API_URL` | `src/config.ts` | `http://localhost:3000` |
| `NASA_API_KEY` | Backend `.env.local` | `DEMO_KEY` |

---

## Cómo ejecutar

```bash
# Backend (Next.js en :3000)
cd uf-backend
npm install
npm run dev

# Frontend (TypeScript puro) — en otra terminal
cd uf-frontend
npm install
npm run dev        # tsc --watch: recompila al guardar cambios
```

Para ver el frontend en el navegador, abre `index.html` con la extensión
**Live Server** de VS Code (clic derecho → "Open with Live Server").
También sirve ejecutar `npx serve .` dentro de `uf-frontend/`.

Verificar que el backend responde:
```
GET http://localhost:3000/api/health
→ { "status": "ok", "message": "Backend corriendo en Next.js (:3000)" }
```
