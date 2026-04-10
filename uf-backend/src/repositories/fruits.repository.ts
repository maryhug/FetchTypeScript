import { BaseRepository } from "./base.repository";
import type { Fruit } from "../types/types";

export class FruitsRepository extends BaseRepository<Fruit> {
    constructor() {
        super("fruits.json");
    }
}