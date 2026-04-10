"use client";
import { useState } from "react";
import { ApiService } from "@/services/apiService";
import type { RandomUser, RandomUserApiResponse, ApiResponse } from "@/types";

const usersService = new ApiService<RandomUser>("/api/users");

export default function UsersPanel() {
    const [users, setUsers]     = useState<RandomUser[]>([]);
    const [source, setSource]   = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const emptyForm = { title: "Mr", first: "", last: "", email: "", phone: "", country: "", city: "", nat: "" };
    const [form, setForm]           = useState(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);

    function notify(msg: string) {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    }

    async function handleGetAll() {
        setLoading(true);
        // El endpoint /api/users devuelve ApiResponse<RandomUserApiResponse>
        const result = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/users`,
            { headers: { "ngrok-skip-browser-warning": "true", Accept: "application/json" } }
        ).then(r => r.json()) as ApiResponse<RandomUserApiResponse>;

        if (result.data?.results) {
            setUsers(result.data.results);
            setSource(result.source);
        } else {
            notify(`Error: ${result.error}`);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const body: Omit<RandomUser, "id"> = {
            name: { title: form.title, first: form.first, last: form.last },
            email: form.email,
            phone: form.phone,
            location: { country: form.country, city: form.city },
            picture: { large: "", medium: "", thumbnail: "" },
            nat: form.nat,
        };

        let result: ApiResponse<RandomUser>;
        if (editingId !== null) {
            result = await usersService.update(editingId, body);
            notify(result.data ? `✅ Usuario #${editingId} actualizado` : `Error: ${result.error}`);
        } else {
            result = await usersService.create(body);
            notify(result.data ? `✅ Usuario creado con ID ${result.data.id}` : `Error: ${result.error}`);
        }

        setForm(emptyForm);
        setEditingId(null);
        await handleGetAll();
    }

    function handleEdit(user: RandomUser) {
        setEditingId(user.id);
        setForm({
            title: user.name.title,
            first: user.name.first,
            last: user.name.last,
            email: user.email,
            phone: user.phone,
            country: user.location.country,
            city: user.location.city,
            nat: user.nat,
        });
    }

    async function handleDelete(id: number) {
        const result = await usersService.delete(id);
        notify(result.error ? `Error: ${result.error}` : `🗑️ Usuario #${id} eliminado`);
        await handleGetAll();
    }

    return (
        <div className="panel">
            {message && <div className="toast">{message}</div>}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="crud-form">
                <h3>{editingId !== null ? `Editando usuario #${editingId}` : "Agregar usuario"}</h3>
                <div className="form-row">
                    <select value={form.title} onChange={e => setForm({...form, title: e.target.value})}>
                        <option>Mr</option><option>Ms</option><option>Mrs</option><option>Dr</option>
                    </select>
                    <input placeholder="Nombre *"   value={form.first}   onChange={e => setForm({...form, first: e.target.value})}   required />
                    <input placeholder="Apellido"   value={form.last}    onChange={e => setForm({...form, last: e.target.value})}    />
                    <input placeholder="Email *"    value={form.email}   onChange={e => setForm({...form, email: e.target.value})}   required />
                </div>
                <div className="form-row">
                    <input placeholder="Teléfono"   value={form.phone}   onChange={e => setForm({...form, phone: e.target.value})}   />
                    <input placeholder="País"       value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                    <input placeholder="Ciudad"     value={form.city}    onChange={e => setForm({...form, city: e.target.value})}    />
                    <input placeholder="Nat (CO)"   value={form.nat}     onChange={e => setForm({...form, nat: e.target.value})}     />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-post">{editingId !== null ? "💾 Guardar cambios" : "➕ Crear"}</button>
                    {editingId !== null && (
                        <button type="button" className="btn-cancel" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                            ✕ Cancelar
                        </button>
                    )}
                </div>
            </form>

            <button className="btn-fetch users" onClick={handleGetAll} disabled={loading}>
                {loading ? "Cargando..." : "▶ GET /api/users"}
            </button>

            {source && <div className="source-tag">source: <strong>{source}</strong></div>}

            {users.length > 0 && (
                <div className="users-grid">
                    {users.map(u => (
                        <div key={u.id} className="user-card">
                            {u.picture.medium && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.picture.medium} alt={u.name.first} className="user-avatar" />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="user-name">{u.name.first} {u.name.last} <span className="fruit-id">#{u.id}</span></div>
                                <div className="user-detail">{u.email}</div>
                                <div className="user-detail">{u.phone}</div>
                                <div className="user-location">📍 {u.location.city}, {u.location.country}</div>
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