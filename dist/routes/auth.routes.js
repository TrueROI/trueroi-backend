"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log("auth.routes.ts LOADED");
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
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
}, auth_controller_1.register);
// Login route with logging
router.post("/login", (req, res, next) => {
    console.log("🔑 /login route called");
    next();
}, auth_controller_1.login);
exports.default = router;
