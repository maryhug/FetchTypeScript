import { BaseRepository } from "./base.repository";
import type { AnimeQuote } from "../types/types";

export class AnimeRepository extends BaseRepository<AnimeQuote> {
    constructor() {
        super("anime.json");
    }
}