import fs   from "fs";
import path from "path";

export class JsonRepository<T> {
    private filePath: string;

    constructor(fileName: string) {
        // process.cwd() apunta a la raíz del proyecto (donde está package.json)
        this.filePath = path.join(process.cwd(), "src", "data", fileName);
    }

    readAll(): T[] {
        try {
            if (!fs.existsSync(this.filePath)) {
                return [];
            }
            const raw = fs.readFileSync(this.filePath, "utf-8");
            return JSON.parse(raw) as T[];
        } catch {
            return [];
        }
    }

    write(data: T[]): void {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
        } catch (err) {
            console.error(`[JsonRepository] Error escribiendo ${this.filePath}:`, err);
        }
    }
}