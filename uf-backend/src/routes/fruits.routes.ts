import { Router } from "express";
import {
    getAllFruits,
    getFruitById,
    createFruit,
    updateFruit,
    deleteFruit,
} from "../controllers/fruits.controller";

const router = Router();

router.get("/",     getAllFruits);
router.get("/:id",  getFruitById);
router.post("/",    createFruit);
router.put("/:id",  updateFruit);
router.delete("/:id", deleteFruit);

export default router;