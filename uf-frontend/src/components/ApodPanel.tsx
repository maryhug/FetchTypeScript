"use client";
import { useState } from "react";
import type { ApiResponse, ApodEntry } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const H: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
  Accept: "application/json",
  "Content-Type": "application/json",
};

export default function ApodPanel() {
  const [entries, setEntries]         = useState<ApodEntry[]>([]);
  const [selected, setSelected]       = useState<ApodEntry | null>(null);
  const [source, setSource]           = useState<string>("");
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm]       = useState(false);

  const emptyForm = { title: "", date: "", explanation: "", url: "", media_type: "image" as "image" | "video" };
  const [form, setForm]               = useState(emptyForm);
  const [editingId, setEditingId]     = useState<number | null>(null);

  function notify(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleGetToday() {
    setLoading(true);
    setEntries([]);
    setSelected(null);
    try {
      const res  = await fetch(`${BASE}/api/apod`, { headers: H });
      const json = await res.json() as ApiResponse<ApodEntry>;
      if (json.data) {
        setSelected(json.data);
        setSource(json.source);
      } else {
        notify("❌ No se pudo obtener la foto del día");
      }
    } catch { notify("❌ Error de red"); }
    setLoading(false);
  }

  async function handleGetRange() {
    setLoading(true);
    setSelected(null);
    try {
      const res  = await fetch(`${BASE}/api/apod/range`, { headers: H });
      const json = await res.json() as ApiResponse<ApodEntry[]>;
      if (Array.isArray(json.data)) {
        setEntries(json.data);
        setSource(json.source);
      } else {
        notify("❌ No se pudo obtener el rango");
      }
    } catch { notify("❌ Error de red"); }
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const byId = parseInt(searchQuery, 10);

    if (!isNaN(byId)) {
      setLoading(true);
      try {
        const res  = await fetch(`${BASE}/api/apod/${byId}`, { headers: H });
        const json = await res.json() as ApiResponse<ApodEntry>;
        if (json.data) {
          setSelected(json.data);
          setEntries([]);
          setSource(json.source);
        } else {
          notify(`❌ APOD #${byId} no encontrado`);
        }
      } catch { notify("❌ Error de red"); }
      setLoading(false);
    } else {
      await handleGetRange();
      setEntries(prev =>
        prev.filter(e =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    try {
      if (editingId !== null) {
        const res  = await fetch(`${BASE}/api/apod/${editingId}`, { method: "PUT", headers: H, body: JSON.stringify(form) });
        const json = await res.json() as ApiResponse<ApodEntry>;
        notify(json.data ? `✅ APOD #${editingId} actualizado` : `❌ ${String(json.error)}`);
        if (json.data) {
          setSelected(json.data);
          setEntries(prev => prev.map(e => e.id === editingId ? json.data! : e));
        }
      } else {
        const res  = await fetch(`${BASE}/api/apod`, { method: "POST", headers: H, body: JSON.stringify(form) });
        const json = await res.json() as ApiResponse<ApodEntry>;
        notify(json.data ? `✅ APOD "${json.data.title}" creado con ID ${json.data.id}` : `❌ ${String(json.error)}`);
      }
    } catch { notify("❌ Error de red"); }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`${BASE}/api/apod/${id}`, { method: "DELETE", headers: H });
      notify(`🗑️ APOD #${id} eliminado`);
      if (selected?.id === id) setSelected(null);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch { notify("❌ Error al eliminar"); }
  }

  function handleEdit(entry: ApodEntry) {
    setEditingId(entry.id);
    setForm({
      title:       entry.title,
      date:        entry.date,
      explanation: entry.explanation,
      url:         entry.url,
      media_type:  entry.media_type,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function ApodCard({ entry }: { entry: ApodEntry }) {
    return (
      <div className="apod-card">
        {entry.media_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.url} alt={entry.title} className="apod-img" />
        ) : (
          <iframe src={entry.url} title={entry.title} className="apod-video" allowFullScreen />
        )}
        <div className="apod-body">
          <div className="apod-title">
            {entry.title}
            {entry.id ? <span className="fruit-id"> #{entry.id}</span> : null}
          </div>
          <div className="apod-date">
            📅 {entry.date}
            {entry.copyright ? ` · © ${entry.copyright}` : ""}
          </div>
          <p className="apod-explanation">
            {entry.explanation.length > 220
              ? entry.explanation.slice(0, 220) + "…"
              : entry.explanation}
          </p>
          <div className="crud-actions">
            <button className="btn-edit"   onClick={() => handleEdit(entry)}>✏️ Editar</button>
            <button className="btn-delete" onClick={() => handleDelete(entry.id)}>🗑️ Eliminar</button>
            {entry.hdurl && (
              <a
                href={entry.hdurl}
                target="_blank"
                rel="noreferrer"
                className="btn-search"
                style={{ textDecoration: "none", padding: "0.3rem 0.75rem", display: "inline-block" }}
              >
                🔭 HD
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      {message && <div className="toast">{message}</div>}

      <button
        className="btn-cancel"
        style={{ marginBottom: "0.75rem" }}
        onClick={() => { setShowForm(s => !s); setEditingId(null); setForm(emptyForm); }}
      >
        {showForm ? "✕ Cerrar formulario" : "➕ Agregar APOD local"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="crud-form">
          <h3>{editingId !== null ? `Editando APOD #${editingId}` : "Nuevo APOD local"}</h3>
          <div className="form-row">
            <input
              placeholder="Título *"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
            />
            <select
              value={form.media_type}
              onChange={e => setForm({ ...form, media_type: e.target.value as "image" | "video" })}
            >
              <option value="image">image</option>
              <option value="video">video</option>
            </select>
          </div>
          <input
            placeholder="URL de imagen *"
            value={form.url}
            onChange={e => setForm({ ...form, url: e.target.value })}
            required
            style={{ width: "100%", padding: "0.4rem 0.75rem", marginBottom: "0.5rem", border: "1px solid var(--border)", borderRadius: "4px", background: "var(--surface)", color: "var(--text)", fontFamily: "var(--font-mono)" }}
          />
          <textarea
            placeholder="Explicación *"
            value={form.explanation}
            onChange={e => setForm({ ...form, explanation: e.target.value })}
            required
            rows={3}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", resize: "vertical", fontFamily: "var(--font-mono)" }}
          />
          <div className="form-actions" style={{ marginTop: "0.5rem" }}>
            <button type="submit" className="btn-post">
              {editingId !== null ? "💾 Guardar" : "➕ Crear"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
            >
              ✕ Cancelar
            </button>
          </div>
        </form>
      )}

      <form onSubmit={handleSearch} className="search-bar">
        <input
          placeholder="Buscar por ID o título"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="btn-search">🔍 Buscar</button>
        {searchQuery && (
          <button
            type="button"
            className="btn-cancel"
            onClick={() => { setSearchQuery(""); setSelected(null); setEntries([]); }}
          >
            ✕
          </button>
        )}
      </form>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button className="btn-fetch anime" onClick={handleGetToday} disabled={loading}>
          {loading ? "Cargando..." : "🌌 GET foto del día"}
        </button>
        <button className="btn-fetch fruits" onClick={handleGetRange} disabled={loading}>
          {loading ? "Cargando..." : "📅 GET últimas 10 fotos"}
        </button>
      </div>

      {source && <div className="source-tag">source: <strong>{source}</strong></div>}

      {selected && <ApodCard entry={selected} />}

      {entries.length > 0 && (
        <div className="apod-grid">
          {entries.map((e, idx) => (
            <ApodCard key={`apod-${e.id}-${idx}`} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
