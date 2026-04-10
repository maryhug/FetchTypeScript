"use client";
import { useState } from "react";
import { ApiService } from "@/services/apiService";
import type { Fruit, ApiResponse } from "@/types";

const fruitsService = new ApiService<Fruit>("/api/fruits");

export default function FruitsPanel() {
    const [fruits, setFruits]     = useState<Fruit[]>([]);
    const [source, setSource]     = useState<string>("");
    const [loading, setLoading]   = useState(false);
    const [message, setMessage]   = useState<string | null>(null);

    // Form para crear/editar
    const emptyForm = { name: "", family: "", order: "", genus: "", calories: 0, fat: 0, sugar: 0, carbohydrates: 0, protein: 0 };
    const [form, setForm]         = useState(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);

    function notify(msg: string) {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    }

    async function handleGetAll() {
        setLoading(true);
        const result = await fruitsService.getAll();
        if (result.data) {
            setFruits(result.data);
            setSource(result.source);
        } else {
            notify(`Error: ${result.error}`);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const body = {
            name: form.name,
            family: form.family,
            order: form.order,
            genus: form.genus,
            nutritions: {
                calories: form.calories,
                fat: form.fat,
                sugar: form.sugar,
                carbohydrates: form.carbohydrates,
                protein: form.protein,
            },
        };

        let result: ApiResponse<Fruit>;
        if (editingId !== null) {
            result = await fruitsService.update(editingId, body);
            notify(result.data ? `✅ Fruta #${editingId} actualizada` : `Error: ${result.error}`);
        } else {
            result = await fruitsService.create(body);
            notify(result.data ? `✅ Fruta "${result.data.name}" creada con ID ${result.data.id}` : `Error: ${result.error}`);
        }

        setForm(emptyForm);
        setEditingId(null);
        await handleGetAll();
    }

    function handleEdit(fruit: Fruit) {
        setEditingId(fruit.id);
        setForm({
            name: fruit.name,
            family: fruit.family,
            order: fruit.order,
            genus: fruit.genus,
            calories: fruit.nutritions.calories,
            fat: fruit.nutritions.fat,
            sugar: fruit.nutritions.sugar,
            carbohydrates: fruit.nutritions.carbohydrates,
            protein: fruit.nutritions.protein,
        });
    }

    async function handleDelete(id: number) {
        const result = await fruitsService.delete(id);
        notify(result.error ? `Error: ${result.error}` : `🗑️ Fruta #${id} eliminada`);
        await handleGetAll();
    }

    return (
        <div className="panel">
            {message && <div className="toast">{message}</div>}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="crud-form">
                <h3>{editingId !== null ? `Editando fruta #${editingId}` : "Agregar fruta"}</h3>
                <div className="form-row">
                    <input placeholder="Nombre *"  value={form.name}   onChange={e => setForm({...form, name: e.target.value})}   required />
                    <input placeholder="Familia *" value={form.family} onChange={e => setForm({...form, family: e.target.value})} required />
                    <input placeholder="Orden"     value={form.order}  onChange={e => setForm({...form, order: e.target.value})}  />
                    <input placeholder="Género"    value={form.genus}  onChange={e => setForm({...form, genus: e.target.value})}  />
                </div>
                <div className="form-row">
                    <input type="number" placeholder="Calorías"     value={form.calories}      onChange={e => setForm({...form, calories: +e.target.value})}      />
                    <input type="number" placeholder="Grasa"        value={form.fat}           onChange={e => setForm({...form, fat: +e.target.value})}           />
                    <input type="number" placeholder="Azúcar"       value={form.sugar}         onChange={e => setForm({...form, sugar: +e.target.value})}         />
                    <input type="number" placeholder="Carbohidratos" value={form.carbohydrates} onChange={e => setForm({...form, carbohydrates: +e.target.value})} />
                    <input type="number" placeholder="Proteína"     value={form.protein}       onChange={e => setForm({...form, protein: +e.target.value})}       />
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

            {/* GET */}
            <button className="btn-fetch fruits" onClick={handleGetAll} disabled={loading}>
                {loading ? "Cargando..." : "▶ GET /api/fruits"}
            </button>

            {source && <div className="source-tag">source: <strong>{source}</strong></div>}

            {/* LIST */}
            {fruits.length > 0 && (
                <div className="fruits-grid">
                    {fruits.map(f => (
                        <div key={f.id} className="fruit-card">
                            <div className="fruit-name">{f.name} <span className="fruit-id">#{f.id}</span></div>
                            <div className="fruit-family">{f.family}</div>
                            <div className="nutr-row"><span className="nutr-label">Calorías</span><span className="nutr-value">{f.nutritions.calories} kcal</span></div>
                            <div className="nutr-row"><span className="nutr-label">Azúcar</span><span className="nutr-value">{f.nutritions.sugar}g</span></div>
                            <div className="crud-actions">
                                <button className="btn-edit"   onClick={() => handleEdit(f)}>✏️ Editar</button>
                                <button className="btn-delete" onClick={() => handleDelete(f.id)}>🗑️ Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}