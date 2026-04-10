"use client";
import { useState } from "react";
import { ApiService, fetchData } from "@/services/apiService";
import type { AnimeQuote, ApiResponse } from "@/types";

const animeService = new ApiService<AnimeQuote>("/api/anime");

export default function AnimePanel() {
    const [quote, setQuote]     = useState<AnimeQuote | null>(null);
    const [source, setSource]   = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const emptyForm = { anime: "", character: "", quote: "" };
    const [form, setForm]           = useState(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);

    function notify(msg: string) {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    }

    async function handleGetRandom() {
        setLoading(true);
        const result = await fetchData<AnimeQuote>("/api/anime");
        if (result.data) {
            setQuote(result.data);
            setSource(result.source);
        } else {
            notify(`Error: ${result.error}`);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        let result: ApiResponse<AnimeQuote>;

        if (editingId !== null) {
            result = await animeService.update(editingId, form);
            notify(result.data ? `✅ Cita #${editingId} actualizada` : `Error: ${result.error}`);
        } else {
            result = await animeService.create(form);
            notify(result.data ? `✅ Cita de "${result.data.anime}" creada con ID ${result.data.id}` : `Error: ${result.error}`);
        }

        setForm(emptyForm);
        setEditingId(null);
    }

    async function handleDelete(id: number) {
        if (!id) return notify("No hay ID disponible para eliminar");
        const result = await animeService.delete(id);
        notify(result.error ? `Error: ${result.error}` : `🗑️ Cita #${id} eliminada`);
        setQuote(null);
    }

    const [searchQuery, setSearchQuery] = useState("");

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);

        const byId = parseInt(searchQuery, 10);

        if (!isNaN(byId)) {
            // Buscar por ID
            const result = await animeService.getOne(byId);
            if (result.data) {
                setQuote(result.data);
                setSource(result.source);
            } else {
                notify(`❌ Cita con ID ${byId} no encontrada`);
            }
        } else {
            // Buscar por anime o personaje — usamos el endpoint /all
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
            try {
                const res = await fetch(`${BASE_URL}/api/anime/all`, {
                    headers: { "ngrok-skip-browser-warning": "true", Accept: "application/json" },
                });
                const json = await res.json();
                const all: AnimeQuote[] = Array.isArray(json?.data) ? json.data : [];

                const found = all.find(
                    (q) =>
                        q.anime.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        q.character.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (found) {
                    setQuote(found);
                    setSource("local");
                } else {
                    notify(`❌ No se encontró cita para "${searchQuery}"`);
                }
            } catch {
                notify("❌ Error buscando citas");
            }
        }
        setLoading(false);
    }

    return (
        <div className="panel">
            {message && <div className="toast">{message}</div>}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="crud-form">
                <h3>{editingId !== null ? `Editando cita #${editingId}` : "Agregar cita"}</h3>
                <div className="form-row">
                    <input placeholder="Anime *"     value={form.anime}     onChange={e => setForm({...form, anime: e.target.value})}     required />
                    <input placeholder="Personaje *" value={form.character} onChange={e => setForm({...form, character: e.target.value})} required />
                </div>
                <textarea
                    placeholder="Cita *"
                    value={form.quote}
                    onChange={e => setForm({...form, quote: e.target.value})}
                    required
                    rows={2}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", resize: "vertical" }}
                />
                <div className="form-actions">
                    <button type="submit" className="btn-post">{editingId !== null ? "💾 Guardar" : "➕ Crear"}</button>
                    {editingId !== null && (
                        <button type="button" className="btn-cancel" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                            ✕ Cancelar
                        </button>
                    )}
                </div>
            </form>

            <form onSubmit={handleSearch} className="search-bar">
                <input
                    placeholder="Buscar por ID, anime o personaje"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn-search">🔍 Buscar</button>
                {searchQuery && (
                    <button type="button" className="btn-cancel" onClick={() => { setSearchQuery(""); setQuote(null); }}>
                        ✕ Limpiar
                    </button>
                )}
            </form>

            {/* GET */}
            <button className="btn-fetch anime" onClick={handleGetRandom} disabled={loading}>
                {loading ? "Cargando..." : "▶ GET /api/anime (random)"}
            </button>

            {source && <div className="source-tag">source: <strong>{source}</strong></div>}

            {/* QUOTE CARD */}
            {quote && (
                <div className="quote-card">
                    <p className="quote-text">{quote.quote}</p>
                    <div>
                        <div className="quote-character">— {quote.character}</div>
                        <div className="quote-anime-name">{quote.anime}</div>
                    </div>
                    {quote.id && (
                        <div className="crud-actions" style={{ marginTop: "0.75rem" }}>
                            <button className="btn-edit"   onClick={() => { setEditingId(quote.id); setForm({ anime: quote.anime, character: quote.character, quote: quote.quote }); }}>✏️ Editar</button>
                            <button className="btn-delete" onClick={() => handleDelete(quote.id)}>🗑️ Eliminar</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}