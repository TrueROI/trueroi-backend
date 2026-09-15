"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("SERVER STARTING...");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const db_1 = __importDefault(require("./utils/db"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// -----------------------------
// BASIC HEALTH ROUTES
// -----------------------------
app.get("/", (req, res) => {
    res.send("Backend is running!");
});
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
});
app.get("/health/db", async (req, res) => {
    try {
        await db_1.default.$queryRaw `SELECT 1`;
        res.json({ status: "ok", db: "connected" });
    }
    catch (err) {
        res.status(500).json({ status: "error", db: "disconnected" });
    }
});
// -----------------------------
// SHOPIFY OAUTH ROUTES
// -----------------------------
// 1. START OAUTH FLOW
app.get("/shopify/install", (req, res) => {
    const shop = req.query.shop;
    if (!shop)
        return res.status(400).send("Missing shop parameter");
    const clientId = process.env.SHOPIFY_API_KEY;
    const redirectUri = "https://gettrueroi.com/shopify/callback";
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=&redirect_uri=${redirectUri}`;
    res.redirect(installUrl);
});
// 2. FINISH OAUTH FLOW
app.get("/shopify/callback", async (req, res) => {
    const shop = req.query.shop;
    const code = req.query.code;
    if (!shop || !code)
        return res.status(400).send("Missing parameters");
    const clientId = process.env.SHOPIFY_API_KEY;
    const clientSecret = process.env.SHOPIFY_API_SECRET;
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code
        })
    });
    const data = await response.json();
    const accessToken = data.access_token;
    res.send("App installed successfully");
});
// -----------------------------
// API ROUTES
// -----------------------------
app.use("/api", index_1.default);
// -----------------------------
// DATABASE + SERVER START
// -----------------------------
db_1.default.$connect()
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error("DB connection error:", err));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
console.log("SERVER FILE LOADED FROM:", __filename);
