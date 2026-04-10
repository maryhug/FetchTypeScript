"use client";
import { useState } from "react";
import type { ApiResponse, RandomUser } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const H: HeadersInit = {
    "ngrok-skip-browser-warning": "true",
    Accept: "application/json",
    "Content-Type": "application/json",
};

export default function UsersPanel() {
    const [users, setUsers]             = useState<RandomUser[]>([]);
    const [source, setSource]           = useState<string>("");
    const [loading, setLoading]         = useState(false);
    const [message, setMessage]         = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const emptyForm = { title: "Mr", first: "", last: "", email: "", phone: "", country: "", city: "", nat: "" };
    const [form, setForm]               = useState(emptyForm);
    const [editingId, setEditingId]     = useState<number | null>(null);

    function notify(msg: string) {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    }

    async function handleGetAll() {
        setLoading(true);
        try {
            const res  = await fetch(`${BASE}/api/users`, { headers: H });
            const json = await res.json() as { data?: { results?: unknown[] }; source?: string };

            const raw = json?.data?.results;
            if (!Array.isArray(raw)) {
                notify("❌ Respuesta inesperada del servidor");
                setLoading(false);
                return;
            }

            const safe: RandomUser[] = raw
                .filter((u): u is Record<string, unknown> => typeof u === "object" && u !== null)
                .map((u, i) => {
                    const nameRaw = u["name"];
                    const name =
                        typeof nameRaw === "object" && nameRaw !== null
                            ? (nameRaw as { title?: unknown; first?: unknown; last?: unknown })
                            : {};
                    const loc = (u["location"] ?? {}) as Record<string, unknown>;
                    const pic = (u["picture"]  ?? {}) as Record<string, unknown>;

                    return {
                        id:    typeof u["id"] === "number" ? (u["id"] as number) : i + 1,
                        name: {
                            title: String(name.title ?? ""),
                            first: String(name.first ?? ""),
                            last:  String(name.last  ?? ""),
                        },
                        email:    String(u["email"] ?? ""),
                        phone:    String(u["phone"] ?? ""),
                        nat:      String(u["nat"]   ?? ""),
                        location: {
                            country: String(loc["country"] ?? ""),
                            city:    String(loc["city"]    ?? ""),
                        },
                        picture: {
                            large:     String(pic["large"]     ?? ""),
                            medium:    String(pic["medium"]    ?? ""),
                            thumbnail: String(pic["thumbnail"] ?? ""),
                        },
                    };
                });

            setUsers(safe);
            setSource(json.source ?? "api");
        } catch (err) {
            notify(`❌ Error: ${err instanceof Error ? err.message : "desconocido"}`);
        }
        setLoading(false);
    }

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        const byId = parseInt(searchQuery, 10);

        if (!isNaN(byId)) {
            setLoading(true);
            try {
                const res  = await fetch(`${BASE}/api/users/${byId}`, { headers: H });
                const json = await res.json() as ApiResponse<RandomUser>;
                if (json.data) {
                    setUsers([json.data]);
                    setSource(json.source);
                } else {
                    notify(`❌ Usuario #${byId} no encontrado`);
                }
            } catch { notify("❌ Error de red"); }
            setLoading(false);
        } else {
            await handleGetAll();
            setUsers(prev =>
                prev.filter(u =>
                    `${u.name.first} ${u.name.last}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const body = {
            name:     { title: form.title, first: form.first, last: form.last },
            email:    form.email,
            phone:    form.phone,
            location: { country: form.country, city: form.city },
            picture:  { large: "", medium: "", thumbnail: "" },
            nat:      form.nat,
        };
        try {
            if (editingId !== null) {
                const res  = await fetch(`${BASE}/api/users/${editingId}`, { method: "PUT", headers: H, body: JSON.stringify(body) });
                const json = await res.json() as ApiResponse<RandomUser>;
                notify(json.data ? `✅ Usuario #${editingId} actualizado` : `❌ ${String(json.error)}`);
            } else {
                const res  = await fetch(`${BASE}/api/users`, { method: "POST", headers: H, body: JSON.stringify(body) });
                const json = await res.json() as ApiResponse<RandomUser>;
                notify(json.data ? `✅ Usuario creado con ID ${json.data.id}` : `❌ ${String(json.error)}`);
            }
        } catch { notify("❌ Error de red"); }
        setForm(emptyForm);
        setEditingId(null);
        await handleGetAll();
    }

    async function handleDelete(id: number) {
        try {
            await fetch(`${BASE}/api/users/${id}`, { method: "DELETE", headers: H });
            notify(`🗑️ Usuario #${id} eliminado`);
        } catch { notify("❌ Error al eliminar"); }
        await handleGetAll();
    }

    function handleEdit(u: RandomUser) {
        setEditingId(u.id);
        setForm({
            title:   u.name.title,
            first:   u.name.first,
            last:    u.name.last,
            email:   u.email,
            phone:   u.phone,
            country: u.location.country,
            city:    u.location.city,
            nat:     u.nat,
        });
    }

    return (
        <div className="panel">
            {message && <div className="toast">{message}</div>}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="crud-form">
                <h3>{editingId !== null ? `Editando usuario #${editingId}` : "Agregar usuario"}</h3>
                <div className="form-row">
                    <select value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}>
                        <option value="Mr">Mr</option>
                        <option value="Ms">Ms</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Dr">Dr</option>
                    </select>
                    <input placeholder="Nombre *"  value={form.first}   onChange={e => setForm({ ...form, first:   e.target.value })} required />
                    <input placeholder="Apellido"  value={form.last}    onChange={e => setForm({ ...form, last:    e.target.value })} />
                    <input placeholder="Email *"   value={form.email}   onChange={e => setForm({ ...form, email:   e.target.value })} required />
                </div>
                <div className="form-row">
                    <input placeholder="Teléfono"  value={form.phone}   onChange={e => setForm({ ...form, phone:   e.target.value })} />
                    <input placeholder="País"      value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                    <input placeholder="Ciudad"    value={form.city}    onChange={e => setForm({ ...form, city:    e.target.value })} />
                    <input placeholder="Nat (CO)"  value={form.nat}     onChange={e => setForm({ ...form, nat:     e.target.value })} />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-post">
                        {editingId !== null ? "💾 Guardar cambios" : "➕ Crear"}
                    </button>
                    {editingId !== null && (
                        <button type="button" className="btn-cancel"
                                onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                            ✕ Cancelar
                        </button>
                    )}
                </div>
            </form>

            {/* BUSCADOR */}
            <form onSubmit={handleSearch} className="search-bar">
                <input
                    placeholder="Buscar por ID o nombre/email"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn-search">🔍 Buscar</button>
                {searchQuery && (
                    <button type="button" className="btn-cancel"
                            onClick={() => { setSearchQuery(""); handleGetAll(); }}>
                        ✕ Limpiar
                    </button>
                )}
            </form>

            <button className="btn-fetch users" onClick={handleGetAll} disabled={loading}>
                {loading ? "Cargando..." : "▶ GET /api/users"}
            </button>

            {source && <div className="source-tag">source: <strong>{source}</strong></div>}

            {users.length > 0 && (
                <div className="users-grid">
                    {users.map((u, idx) => (
                        <div key={`user-${u.id}-${idx}`} className="user-card">
                            {u.picture.medium && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.picture.medium} alt={u.name.first} className="user-avatar" />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="user-name">
                                    {u.name.first} {u.name.last}
                                    <span className="fruit-id"> #{u.id}</span>
                                </div>
                                <div className="user-detail">{u.email}</div>
                                <div className="user-detail">{u.phone}</div>
                                <div className="user-location">
                                    📍 {[u.location.city, u.location.country].filter(Boolean).join(", ")}
                                </div>
                                <div className="crud-actions">
                                    <button className="btn-edit"   onClick={() => handleEdit(u)}>✏️ Editar</button>
                                    <button className="btn-delete" onClick={() => handleDelete(u.id)}>🗑️ Eliminar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}