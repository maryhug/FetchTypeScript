# uf-backend — Next.js 14 API

Backend del proyecto **Universal Data Fetcher**.  
Construido con **Next.js 14** usando App Router y API Routes.  
Corre en `http://localhost:3000`.

---

## Tecnologías

| Herramienta | Para qué sirve |
|---|---|
| Next.js 14 | Framework que expone las rutas `/api/...` |
| TypeScript | Tipado estático |
| `fs` / `path` | Leer y escribir los archivos JSON locales |
| `fetch` nativo | Llamar a las APIs externas (Node.js 18+) |

---

## Estructura del proyecto

```
uf-backend/
├── app/
│   ├── layout.tsx              ← Layout mínimo requerido por Next.js
│   ├── page.tsx                ← Página raíz con lista de endpoints
│   └── api/
│       ├── health/
│       │   └── route.ts        ← GET /api/health
│       ├── apod/
│       │   ├── route.ts        ← GET /api/apod   · POST /api/apod
│       │   ├── range/
│       │   │   └── route.ts    ← GET /api/apod/range
│       │   └── [id]/
│       │       └── route.ts    ← GET · PUT · DELETE /api/apod/:id
│       ├── users/
│       │   ├── route.ts        ← GET /api/users  · POST /api/users
│       │   └── [id]/
│       │       └── route.ts    ← GET · PUT · DELETE /api/users/:id
│       └── fruits/
│           ├── route.ts        ← GET /api/fruits · POST /api/fruits
│           └── [id]/
│               └── route.ts    ← GET · PUT · DELETE /api/fruits/:id
├── middleware.ts               ← CORS para todas las rutas /api/*
├── next.config.js
└── src/
    ├── config.ts               ← Constantes (NASA_API_KEY)
    ├── types/
    │   ├── types.ts            ← ApiResponse, Fruit, RandomUser
    │   └── apod.ts             ← ApodEntry
    ├── services/
    │   └── fetchData.ts        ← Función genérica para llamar APIs externas
    ├── repositories/
    │   ├── base.repository.ts  ← CRUD genérico sobre archivos JSON
    │   ├── JsonRepository.ts   ← Lectura/escritura simple (usado por APOD)
    │   ├── fruits.repository.ts
    │   └── users.repository.ts
    └── data/
        ├── apod.json           ← Datos locales / fallback de NASA
        ├── fruits.json         ← Frutas creadas o editadas localmente
        └── users.json          ← Usuarios creados o editados localmente
```

---

## Cómo funciona un endpoint GET

Todos los endpoints GET siguen el mismo patrón:

```
1. Llama a la API externa (NASA, FruityVice, RandomUser)
2. Si responde bien  → devuelve esos datos  (source: "api")
3. Si falla          → usa el JSON local    (source: "fallback")

Las operaciones POST / PUT / DELETE siempre escriben en el JSON local.
```

---

## Endpoints disponibles

### `/api/health`
| Método | Descripción |
|---|---|
| GET | Verifica que el servidor está corriendo |

### `/api/fruits`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/fruits` | Todas las frutas (API externa + locales mezcladas) |
| GET | `/api/fruits/:id` | Una fruta por ID |
| POST | `/api/fruits` | Crear fruta (se guarda en `fruits.json`) |
| PUT | `/api/fruits/:id` | Editar fruta en `fruits.json` |
| DELETE | `/api/fruits/:id` | Eliminar fruta de `fruits.json` |

### `/api/users`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | 6 usuarios aleatorios (RandomUser API) |
| GET | `/api/users/:id` | Buscar en `users.json` local |
| POST | `/api/users` | Crear usuario en `users.json` |
| PUT | `/api/users/:id` | Editar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |

### `/api/apod`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/apod` | Foto astronómica del día (NASA APOD API) |
| GET | `/api/apod/range` | Últimas 10 fotos |
| GET | `/api/apod/:id` | Buscar en `apod.json` local |
| POST | `/api/apod` | Crear entrada en `apod.json` |
| PUT | `/api/apod/:id` | Editar entrada |
| DELETE | `/api/apod/:id` | Eliminar entrada |

---

## Variables de entorno

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
NASA_API_KEY=DEMO_KEY
```

> Con `DEMO_KEY` la NASA limita las peticiones. Puedes obtener una clave
> gratuita en https://api.nasa.gov/

---

## Instalación y ejecución

```bash
npm install
npm run dev
```

El servidor arranca en `http://localhost:3000`.  
Puedes verificarlo en el navegador o con:

```bash
curl http://localhost:3000/api/health
# → { "status": "ok", "message": "Backend corriendo en Next.js (:3000)" }
```

---

## Usar con ngrok

Si necesitas exponer el backend a internet (por ejemplo para probar desde otro
dispositivo), instala ngrok y ejecuta:

```bash
ngrok http 3000
```

Ngrok te dará una URL pública. Cópiala y pégala en `src/config.ts` del
frontend:

```ts
export const API_URL = 'https://TU-URL.ngrok-free.app';
```
