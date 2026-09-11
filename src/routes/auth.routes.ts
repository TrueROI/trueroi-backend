console.log("auth.routes.ts LOADED");
import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

const router = Router();

router.use((req, res, next) => {
  console.log("AUTH ROUTER RECEIVED:", req.method, req.url);
  next();
});

router.post("/register", register);
router.post("/login", login);

export default router;
