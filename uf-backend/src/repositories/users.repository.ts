import { BaseRepository } from "./base.repository";
import type { RandomUser } from "../types/types";

export class UsersRepository extends BaseRepository<RandomUser> {
    constructor() {
        super("users.json");
    }
}