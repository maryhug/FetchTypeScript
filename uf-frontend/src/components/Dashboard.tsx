"use client";
import { useState, useEffect } from "react";
import AnimePanel  from "./AnimePanel";
import UsersPanel  from "./UsersPanel";
import FruitsPanel from "./FruitsPanel";

type Tab = "anime" | "users" | "fruits";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function Dashboard() {
    const [tab,        setTab]        = useState<Tab>("anime");
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
        loading: "Verificando conexión...",
        ok:      "Backend conectado",
        error:   "No se pudo conectar con el backend",
    }[connStatus];

    const endpointMap: Record<Tab, string> = {
        anime:  `${API_URL}/api/anime`,
        users:  `${API_URL}/api/users`,
        fruits: `${API_URL}/api/fruits`,
    };

    return (
        <div className="app">

            {/* HEADER */}
            <header className="header">
                <div className="header-badges">
                    <span className="badge badge-purple">Next.js 14</span>
                    <span className="badge badge-green">Express Backend</span>
                    <span className="badge badge-yellow">GET · POST · PUT · DELETE</span>
                </div>
                <h1>Universal Data Fetcher</h1>
                <p className="header-sub">
                    Frontend → Backend Express (localhost:4000) → APIs externas + JSON local
                </p>
            </header>

            {/* BARRA DE CONEXIÓN */}
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
                <span className="api-info-label">Endpoint activo</span>
                <span className="api-info-url">{endpointMap[tab]}</span>
            </div>

            {/* PANEL SEGÚN TAB */}
            <div style={{ display: connStatus !== "ok" ? "none" : "block" }}>
                {tab === "anime"  && <AnimePanel />}
                {tab === "users"  && <UsersPanel />}
                {tab === "fruits" && <FruitsPanel />}
            </div>

            {connStatus === "error" && (
                <div className="error-box">
                    <strong>Backend no disponible</strong>
                    Verifica que el backend esté corriendo en el puerto 4000
                </div>
            )}

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-item"><span className="footer-dot" /><span>GET</span></div>
                <div className="footer-item"><span className="footer-dot" /><span>POST</span></div>
                <div className="footer-item"><span className="footer-dot" /><span>PUT</span></div>
                <div className="footer-item"><span className="footer-dot" /><span>DELETE</span></div>
                <div className="footer-item"><span className="footer-dot" /><span>ApiResponse&lt;T&gt;</span></div>
                <div className="footer-item"><span className="footer-dot" /><span>Repository Pattern</span></div>
            </footer>
        </div>
    );
}