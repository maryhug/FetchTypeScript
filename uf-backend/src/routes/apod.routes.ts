import { Router } from "express";
import {
    getApodToday,
    getApodRange,
    getApodById,
    createApod,
    updateApod,
    deleteApod,
} from "../controllers/apod.controller";

const router = Router();

router.get("/range",  getApodRange);   // ⚠️ DEBE ir ANTES de /:id
router.get("/",       getApodToday);
router.get("/:id",    getApodById);
router.post("/",      createApod);
router.put("/:id",    updateApod);
router.delete("/:id", deleteApod);

export default router;