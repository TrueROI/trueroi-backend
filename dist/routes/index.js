"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("INDEX ROUTER LOADED");
console.log("index.ts LOADED");
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const router = (0, express_1.Router)();
// All auth routes will be under /api/auth/...
router.use("/auth", auth_routes_1.default);
exports.default = router;
