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
const shopifyClient_1 = require("./utils/shopifyClient");
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
        if (err instanceof Error) {
            console.error("DB health error:", err.message);
        }
        else {
            console.error("DB health error:", err);
        }
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
    const redirectUri = "https://trueroi-backend-production.up.railway.app/shopify/callback";
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=read_products,read_shop&redirect_uri=${redirectUri}`;
    res.redirect(installUrl);
});
// 2. FINISH OAUTH FLOW
app.get("/shopify/callback", async (req, res) => {
    console.log("FULL CALLBACK QUERY:", req.query);
    const shopDomain = req.query.shop;
    const code = req.query.code;
    if (!code) {
        console.log("Ignoring callback without code (Shopify background request)");
        return res.send("OK");
    }
    if (!shopDomain) {
        return res.status(400).send("Missing shop parameter");
    }
    console.log("Saving shop + token now...");
    const clientId = process.env.SHOPIFY_API_KEY;
    const clientSecret = process.env.SHOPIFY_API_SECRET;
    const tokenUrl = `https://${shopDomain}/admin/oauth/access_token`;
    try {
        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code
            })
        });
        const text = await response.text();
        console.log("Shopify token response:", text);
        let data;
        try {
            data = JSON.parse(text);
        }
        catch {
            return res.status(500).send("Shopify returned an HTML error:\n\n" + text);
        }
        const accessToken = data.access_token;
        console.log("Access token:", accessToken);
        const DEFAULT_USER_ID = "4dc12f02-bf5d-4690-a609-c6806711d57c";
        let shopRecord = await db_1.default.shop.findUnique({
            where: { domain: shopDomain }
        });
        if (!shopRecord) {
            shopRecord = await db_1.default.shop.create({
                data: {
                    name: shopDomain.replace(".myshopify.com", ""),
                    domain: shopDomain,
                    userId: DEFAULT_USER_ID
                }
            });
            console.log("Created new shop:", shopRecord.id);
        }
        await db_1.default.token.create({
            data: {
                type: "shopify",
                value: accessToken,
                userId: DEFAULT_USER_ID,
                shopId: shopRecord.id
            }
        });
        console.log("Saved Shopify token for shop:", shopRecord.domain);
        res.send("App installed successfully");
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Callback error:", err.message);
        }
        else {
            console.error("Callback error:", err);
        }
        res.status(500).send("Internal server error");
    }
});
// -----------------------------
// ⭐ SHOPIFY API TEST ROUTE
// -----------------------------
app.get("/shopify/test", async (req, res) => {
    try {
        const shop = await db_1.default.shop.findFirst();
        if (!shop)
            return res.status(404).send("No shop found");
        const token = await db_1.default.token.findFirst({
            where: { shopId: shop.id }
        });
        if (!token)
            return res.status(404).send("No token found");
        const shopify = new shopifyClient_1.ShopifyClient(shop.domain, token.value);
        const data = await shopify.get("/shop.json");
        console.log("Shopify API response:", data);
        res.json(data);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Shopify API error:", err.message);
        }
        else {
            console.error("Shopify API error:", err);
        }
        res.status(500).send("Error calling Shopify API");
    }
});
// -----------------------------
// ⭐ SHOPIFY PRODUCTS ROUTE
// -----------------------------
app.get("/shopify/products", async (req, res) => {
    try {
        const shop = await db_1.default.shop.findFirst();
        if (!shop)
            return res.status(404).send("No shop found");
        const token = await db_1.default.token.findFirst({
            where: { shopId: shop.id }
        });
        if (!token)
            return res.status(404).send("No token found");
        const shopify = new shopifyClient_1.ShopifyClient(shop.domain, token.value);
        const data = await shopify.get("/products.json");
        console.log("Products:", data);
        res.json(data);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Products API error:", err.message);
        }
        else {
            console.error("Products API error:", err);
        }
        res.status(500).send("Error pulling products");
    }
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
    .catch((err) => {
    if (err instanceof Error) {
        console.error("DB connection error:", err.message);
    }
    else {
        console.error("DB connection error:", err);
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
console.log("SERVER FILE LOADED FROM:", __filename);
