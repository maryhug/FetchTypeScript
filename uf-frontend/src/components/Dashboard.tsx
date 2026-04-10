"use client";
import { useState, useEffect } from "react";
import ApodPanel   from "./ApodPanel";
import UsersPanel  from "./UsersPanel";
import FruitsPanel from "./FruitsPanel";

type Tab = "apod" | "users" | "fruits";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const TAB_LABELS: Record<Tab, string> = {
  apod:   "🌌 NASA APOD",
  users:  "👤 Usuarios",
  fruits: "🍎 Frutas",
};

const ENDPOINTS: Record<Tab, string> = {
  apod:   `${API_URL}/api/apod`,
  users:  `${API_URL}/api/users`,
  fruits: `${API_URL}/api/fruits`,
};

export default function Dashboard() {
  const [tab,        setTab]        = useState<Tab>("apod");
  const [connStatus, setConnStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => { checkConnection(); }, []);

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

  const connLabel = {
    loading: "⏳ Verificando conexión...",
    ok:      "● Backend conectado",
    error:   "● Sin conexión con el backend",
  }[connStatus];

  const connClass = {
    loading: "conn-loading",
    ok:      "conn-ok",
    error:   "conn-error",
  }[connStatus];

  return (
    <div className="app">
      <header className="header">
        <div className="header-badges">
          <span className="badge badge-purple">Next.js 14</span>
          <span className="badge badge-green">Express</span>
          <span className="badge badge-yellow">GET · POST · PUT · DELETE</span>
        </div>

        <h1>Universal Data Fetcher</h1>
        <p className="header-subtitle">
          Consume, gestiona y persiste datos de múltiples APIs externas
        </p>

        <div className={`conn-status ${connClass}`}>
          {connLabel}
          {connStatus === "error" && (
            <button className="btn-retry" onClick={checkConnection}>
              ↺ Reintentar
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
          <button
            key={t}
            data-tab={t}
            className={`tab-btn${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Endpoint activo */}
      <div className="endpoint-bar">
        <span className="endpoint-label">Endpoint activo</span>
        <code className="endpoint-url">{ENDPOINTS[tab]}</code>
      </div>

      <main className="main">
        {tab === "apod"   && <ApodPanel   />}
        {tab === "users"  && <UsersPanel  />}
        {tab === "fruits" && <FruitsPanel />}
      </main>
    </div>
  );
}
