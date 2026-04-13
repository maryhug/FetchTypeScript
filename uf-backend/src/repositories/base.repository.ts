import fs from "fs";
import path from "path";

export class BaseRepository<T extends { id: number }> {
    private filePath: string;

    constructor(fileName: string) {
        // process.cwd() apunta a la raíz del proyecto (donde está package.json)
        this.filePath = path.join(process.cwd(), "src", "data", fileName);
    }

    readAll(): T[] {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        return JSON.parse(raw) as T[];
    }

    readOne(id: number): T | undefined {
        return this.readAll().find((item) => item.id === id);
    }

    create(item: Omit<T, "id">): T {
        const all = this.readAll();
        const newId = all.length > 0 ? Math.max(...all.map((i) => i.id)) + 1 : 1;
        const newItem = { id: newId, ...item } as T;
        this.writeAll([...all, newItem]);
        return newItem;
    }

    update(id: number, data: Partial<Omit<T, "id">>): T | null {
        const all = this.readAll();
        const index = all.findIndex((i) => i.id === id);
        if (index === -1) return null;
        all[index] = { ...all[index], ...data };
        this.writeAll(all);
        return all[index];
    }

    delete(id: number): boolean {
        const all = this.readAll();
        const filtered = all.filter((i) => i.id !== id);
        if (filtered.length === all.length) return false;
        this.writeAll(filtered);
        return true;
    }

    private writeAll(data: T[]): void {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    }
}