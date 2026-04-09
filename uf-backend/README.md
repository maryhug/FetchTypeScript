# uf-backend

Servidor Express + TypeScript. Corre en `localhost:4000` y es expuesto públicamente con ngrok.

## Setup

```bash
npm install
npm run dev
```

## Exponer con ngrok (en otra terminal)

```bash
ngrok http 4000
```

La URL pública que genera ngrok va en el `.env.local` del frontend.

## Rutas

| Método | Ruta             | Descripción                  |
|--------|------------------|------------------------------|
| GET    | /health          | Verifica que el server vive  |
| GET    | /api/anime       | Cita aleatoria de anime      |
| GET    | /api/users       | 6 usuarios aleatorios        |
| GET    | /api/fruits      | Todas las frutas             |
| GET    | /api/fruits/:id  | Una fruta por ID             |
