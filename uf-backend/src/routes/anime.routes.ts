import { Router } from "express";
import {
    getRandomAnime,
    getAnimeById,
    createAnimeQuote,
    updateAnimeQuote,
    deleteAnimeQuote,
} from "../controllers/anime.controller";

const router = Router();

router.get("/",       getRandomAnime);
router.get("/:id",    getAnimeById);
router.post("/",      createAnimeQuote);
router.put("/:id",    updateAnimeQuote);
router.delete("/:id", deleteAnimeQuote);

export default router;