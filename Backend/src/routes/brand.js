import express from "express";
import { createBrand, deleteBrandById, getAllBrands, getBrandsById, updateBrandById } from "../controllers/brand.js";
import { upload } from "../middlewares/Multer.js";



const router = express.Router()

router.post("/create/brand", upload, createBrand)
router.get("/get/brand", getAllBrands)
router.get("/get/brand/:id", getBrandsById)
router.delete("/delete/brand/:id", deleteBrandById)
router.put("/update/brand/:id", upload, updateBrandById)

export default router
