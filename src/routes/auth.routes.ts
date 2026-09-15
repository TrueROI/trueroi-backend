console.log("auth.routes.ts LOADED");

import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

const router = Router();

// Log every request that hits the auth router
router.use((req, res, next) => {
  console.log("🔐 AUTH ROUTER HIT");
  console.log("➡️ Method:", req.method);
  console.log("➡️ URL:", req.url);
  console.log("➡️ Body:", req.body);
  next();
});

// Register route with logging
router.post("/register", (req, res, next) => {
  console.log("📩 /register route called");
  next();
}, register);

// Login route with logging
router.post("/login", (req, res, next) => {
  console.log("🔑 /login route called");
  next();
}, login);

export default router;
