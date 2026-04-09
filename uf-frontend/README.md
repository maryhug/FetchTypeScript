# uf-frontend

Frontend Next.js 14. Consume el backend Express a través del túnel ngrok.

## Setup

```bash
npm install
npm run dev
# Abre http://localhost:3000
```

## Cambiar la URL de ngrok

El plan gratuito de ngrok genera una URL diferente en cada sesión.
Cuando reinicies ngrok, actualiza el archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://TU-NUEVA-URL.ngrok-free.app
```

Reinicia el servidor de Next.js después de cambiar el `.env.local`.

## Flujo completo

```
Browser (localhost:3000)
  └── fetch("/api/anime")           ← fetchData<T> con BASE_URL de .env.local
       └── ngrok tunnel
            └── localhost:4000       ← Express backend
                 └── animechan.io    ← API externa (o fallback si falla)
```
