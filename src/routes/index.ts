console.log("INDEX ROUTER LOADED");
console.log("index.ts LOADED");
import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

// All auth routes will be under /api/auth/...
router.use("/auth", authRoutes);

export default router;
