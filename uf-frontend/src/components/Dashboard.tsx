"use client";
// ============================================================
// "use client" → Este componente corre en el NAVEGADOR.
// Necesitamos useState (estado) y fetch interactivo.
// ============================================================

import { useState, useEffect } from "react";
import { ApiService, fetchData } from "@/services/apiService";
import type { ApiResponse, AnimeQuote, RandomUserApiResponse, Fruit, RandomUser } from "@/types";

// ============================================================
// TIPOS LOCALES
// ============================================================
type Tab = "anime" | "users" | "fruits";

// ============================================================
// INSTANCIAS DE ApiService<T> — Parte 4 del taller
// Cada servicio apunta a una ruta de nuestro backend Express
// ============================================================
const animeService  = new ApiService<AnimeQuote>("/api/anime");
const usersService  = new ApiService<RandomUserApiResponse>("/api/users");
const fruitsService = new ApiService<Fruit>("/api/fruits");

// ============================================================
// URL del backend para mostrarla en la UI
// ============================================================
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Dashboard() {
  const [tab,        setTab]        = useState<Tab>("anime");
  const [loading,    setLoading]    = useState(false);
  const [connStatus, setConnStatus] = useState<"loading" | "ok" | "error">("loading");

  // Estado de datos por API
  const [animeData,  setAnimeData]  = useState<ApiResponse<AnimeQuote> | null>(null);
  const [usersData,  setUsersData]  = useState<ApiResponse<RandomUserApiResponse> | null>(null);
  const [fruitsData, setFruitsData] = useState<ApiResponse<Fruit[]> | null>(null);

  // ── Al montar el componente: verificar conexión con el backend ──
  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    setConnStatus("loading");
    try {
      const res = await fetch(`${API_URL}/health`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      setConnStatus(res.ok ? "ok" : "error");
    } catch {
      setConnStatus("error");
    }
  }

  // ── Fetch de datos según la pestaña activa ──
  async function handleFetch() {
    setLoading(true);

    if (tab === "anime") {
      // getAll() → GET /api/anime en el backend
      const result = await animeService.getAll();
      // El backend devuelve ApiResponse<AnimeQuote>, no un array
      // así que usamos fetchData directo para la cita individual
      const direct = await fetchData<AnimeQuote>("/api/anime");
      setAnimeData(direct);
    }

    else if (tab === "users") {
      const result = await fetchData<RandomUserApiResponse>("/api/users");
      setUsersData(result);
    }

    else if (tab === "fruits") {
      const result = await fetchData<Fruit[]>("/api/fruits");
      setFruitsData(result);
    }

    setLoading(false);
  }

  // ── Render del contenido según la pestaña ──
  function renderContent() {
    if (loading) {
      return (
        <div className="loading">
          <div className="spinner" />
          <span>Llamando al backend...</span>
        </div>
      );
    }

    if (tab === "anime") {
      if (!animeData) return <EmptyState tab="anime" />;
      if (animeData.error) return <ErrorBox message={animeData.error} />;
      const q = animeData.data;
      if (!q) return <ErrorBox message="Sin datos" />;
      return (
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <StatusBadge status={animeData.status} />
            <SourceBadge source={animeData.source} />
          </div>
          <div className="quote-card">
            <p className="quote-text">{q.quote}</p>
            <div>
              <div className="quote-character">— {q.character}</div>
              <div className="quote-anime-name">{q.anime}</div>
            </div>
          </div>
        </div>
      );
    }

    if (tab === "users") {
      if (!usersData) return <EmptyState tab="users" />;
      if (usersData.error) return <ErrorBox message={usersData.error} />;
      const users: RandomUser[] = usersData.data?.results ?? [];
      return (
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <StatusBadge status={usersData.status} />
            <SourceBadge source={usersData.source} />
          </div>
          <div className="users-grid">
            {users.map((u, i) => (
              <div key={i} className="user-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.picture.medium} alt={u.name.first} className="user-avatar" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="user-name">{u.name.first} {u.name.last}</div>
                  <div className="user-detail">{u.email}</div>
                  <div className="user-detail">{u.phone}</div>
                  <div className="user-location">📍 {u.location.city}, {u.location.country}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (tab === "fruits") {
      if (!fruitsData) return <EmptyState tab="fruits" />;
      if (fruitsData.error) return <ErrorBox message={fruitsData.error} />;
      const fruits = Array.isArray(fruitsData.data) ? (fruitsData.data as Fruit[]).slice(0, 12) : [];
      return (
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <StatusBadge status={fruitsData.status} />
            <SourceBadge source={fruitsData.source} />
          </div>
          <div className="fruits-grid">
            {fruits.map((f) => (
              <div key={f.id} className="fruit-card">
                <div className="fruit-name">{f.name}</div>
                <div className="fruit-family">{f.family}</div>
                <div className="nutr-row"><span className="nutr-label">Calorías</span><span className="nutr-value">{f.nutritions.calories} kcal</span></div>
                <div className="nutr-row"><span className="nutr-label">Azúcar</span><span className="nutr-value">{f.nutritions.sugar}g</span></div>
                <div className="nutr-row"><span className="nutr-label">Carbohidratos</span><span className="nutr-value">{f.nutritions.carbohydrates}g</span></div>
                <div className="nutr-row"><span className="nutr-label">Proteína</span><span className="nutr-value">{f.nutritions.protein}g</span></div>
                <div className="nutr-row"><span className="nutr-label">Grasa</span><span className="nutr-value">{f.nutritions.fat}g</span></div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  // Info que mostramos sobre el endpoint activo
  const endpointMap: Record<Tab, string> = {
    anime:  `${API_URL}/api/anime`,
    users:  `${API_URL}/api/users`,
    fruits: `${API_URL}/api/fruits`,
  };

  const connLabel = {
    loading: "Verificando conexión...",
    ok:      "Backend conectado",
    error:   "No se pudo conectar con el backend",
  }[connStatus];

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="header-badges">
          <span className="badge badge-purple">Next.js 14</span>
          <span className="badge badge-green">Express Backend</span>
          <span className="badge badge-yellow">ngrok tunnel</span>
        </div>
        <h1>Universal Data Fetcher</h1>
        <p className="header-sub">
          Frontend → ngrok → Backend Express (localhost:4000) → APIs externas
        </p>
      </header>

      {/* BARRA DE CONEXIÓN — muestra estado del backend */}
      <div className="connection-bar">
        <span className={`conn-dot ${connStatus}`} />
        <span style={{ fontSize: "0.72rem" }}>{connLabel}</span>
        <span className="conn-url">{API_URL}</span>
        <button
          onClick={checkConnection}
          style={{
            background: "none", border: "1px solid var(--border)",
            color: "var(--text-secondary)", cursor: "pointer",
            fontSize: "0.65rem", padding: "0.2rem 0.5rem",
            borderRadius: "3px", fontFamily: "var(--font-mono)",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}
        >
          ↺ Reconectar
        </button>
      </div>

      {/* TABS */}
      <nav className="tabs">
        {(["anime", "users", "fruits"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab ${t} ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            <span className="tab-dot" />
            {t === "anime"  && "AnimeChan"}
            {t === "users"  && "Random User"}
            {t === "fruits" && "Fruityvice"}
          </button>
        ))}
      </nav>

      {/* ENDPOINT ACTIVO */}
      <div className="api-info">
        <span className="api-info-label">Endpoint que se va a llamar</span>
        <span className="api-info-url">{endpointMap[tab]}</span>
      </div>

      {/* BOTÓN */}
      <button
        className={`btn-fetch ${tab}`}
        onClick={handleFetch}
        disabled={loading || connStatus !== "ok"}
      >
        {loading ? "Cargando..." : `▶ Fetch ${tab}`}
      </button>

      {/* CONTENIDO */}
      {renderContent()}

      {/* FOOTER TÉCNICO */}
      <footer className="footer">
        <div className="footer-item"><span className="footer-dot" /><span>ApiResponse&lt;T&gt;</span></div>
        <div className="footer-item"><span className="footer-dot" /><span>fetchData&lt;T&gt;</span></div>
        <div className="footer-item"><span className="footer-dot" /><span>ApiService&lt;T&gt;</span></div>
        <div className="footer-item"><span className="footer-dot" /><span>ngrok tunnel activo</span></div>
      </footer>
    </div>
  );
}

// ── Subcomponentes ──

function StatusBadge({ status }: { status: number }) {
  const ok = status >= 200 && status < 300;
  return (
    <div className={`status-badge ${ok ? "status-ok" : "status-err"}`}>
      <span>●</span> HTTP {status}
    </div>
  );
}

// Muestra si el dato vino de la API real o del fallback
function SourceBadge({ source }: { source: "api" | "fallback" | undefined }) {
  if (!source) return null;
  return (
    <span className={`source-badge ${source === "api" ? "source-api" : "source-fallback"}`}>
      {source === "api" ? "⚡ API real" : "📦 Fallback"}
    </span>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="error-box">
      <strong>Error</strong>
      {message}
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const icons: Record<Tab, string> = { anime: "⛩️", users: "👤", fruits: "🍎" };
  return (
    <div className="empty">
      <span className="empty-icon">{icons[tab]}</span>
      Presiona el botón para hacer fetch al backend
    </div>
  );
}
